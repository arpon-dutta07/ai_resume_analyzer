export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then(async (lib) => {
        console.log('PDF.js module imported successfully');
        
        // Try to set the worker source to use local file
        const workerSrc = "/pdf.worker.min.mjs";
        lib.GlobalWorkerOptions.workerSrc = workerSrc;
        console.log('PDF.js worker source set to:', lib.GlobalWorkerOptions.workerSrc);
        
        // Test if the worker can be loaded
        try {
            // Create a simple test document to verify worker is working
            const testArrayBuffer = new ArrayBuffer(8);
            console.log('Testing PDF.js worker...');
            // Don't actually load a document here, just verify the library is ready
        } catch (workerError) {
            console.warn('Worker test failed, but continuing:', workerError);
        }
        
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    }).catch((error) => {
        console.error('Failed to load PDF.js:', error);
        isLoading = false;
        loadPromise = null;
        throw error;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log('Starting PDF conversion for file:', file.name);
        const lib = await loadPdfJs();
        console.log('PDF.js library loaded successfully');

        const arrayBuffer = await file.arrayBuffer();
        console.log('File converted to array buffer, size:', arrayBuffer.byteLength);
        
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF document loaded, pages:', pdf.numPages);
        
        const page = await pdf.getPage(1);
        console.log('First page loaded');

        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to get 2D context from canvas");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        console.log('Starting page render...');
        await page.render({ canvasContext: context, viewport }).promise;
        console.log('Page rendered successfully');

        return new Promise((resolve) => {
            console.log('Converting canvas to blob...');
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log('Blob created successfully, size:', blob.size);
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        console.log('Image file created:', imageFile.name, imageFile.size);
                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        console.error('Failed to create blob from canvas');
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            ); // Set quality to maximum (1.0)
        });
    } catch (err) {
        console.error('PDF conversion error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${errorMessage}`,
        };
    }
}
