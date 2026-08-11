import { type FormEvent, useState, useEffect } from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img-cdn";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const cleanAndParseJson = (text: string) => {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
};

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/auth?next=/upload');
        }
    }, [isLoading, auth.isAuthenticated]);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        setErrorMessage('');
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);
        setErrorMessage('');

        try {
            setStatusText('Uploading the resume file...');
            const uploadedFileRaw = await fs.upload([file]);
            const uploadedFile = Array.isArray(uploadedFileRaw) ? uploadedFileRaw[0] : uploadedFileRaw;

            if (!uploadedFile || !uploadedFile.path) {
                throw new Error('Failed to upload resume file to storage.');
            }

            setStatusText('Converting PDF to preview image...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                throw new Error(imageFile.error || 'Failed to convert PDF page to preview image.');
            }

            setStatusText('Uploading preview image...');
            const uploadedImageRaw = await fs.upload([imageFile.file]);
            const uploadedImage = Array.isArray(uploadedImageRaw) ? uploadedImageRaw[0] : uploadedImageRaw;

            if (!uploadedImage || !uploadedImage.path) {
                throw new Error('Failed to upload resume preview image.');
            }

            setStatusText('Analyzing resume with AI...');
            const feedbackResponse = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );

            if (!feedbackResponse || !feedbackResponse.message || !feedbackResponse.message.content) {
                throw new Error('Failed to get feedback response from AI model.');
            }

            const feedbackText = typeof feedbackResponse.message.content === 'string'
                ? feedbackResponse.message.content
                : Array.isArray(feedbackResponse.message.content)
                    ? (feedbackResponse.message.content[0] as any)?.text || ''
                    : '';

            if (!feedbackText) {
                throw new Error('AI returned an empty response.');
            }

            setStatusText('Parsing feedback results...');
            const parsedFeedback = cleanAndParseJson(feedbackText);

            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: parsedFeedback,
            };

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${uuid}`);
        } catch (err: any) {
            console.error('Error during analysis:', err);
            setErrorMessage(err.message || 'An unexpected error occurred during resume analysis.');
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) {
            setErrorMessage('Please select a PDF resume file to upload.');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full max-w-md mx-auto" alt="Scanning" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {errorMessage && !isProcessing && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-center">
                            <p className="font-semibold">{errorMessage}</p>
                            <p className="text-sm mt-1">Please try uploading again or select a different PDF file.</p>
                        </div>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button cursor-pointer" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
