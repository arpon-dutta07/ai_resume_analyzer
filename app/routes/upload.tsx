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
            setStatusText('Uploading resume file to Puter cloud storage...');
            const uploadedFileRaw = await fs.upload([file]);
            const uploadedFile = Array.isArray(uploadedFileRaw) ? uploadedFileRaw[0] : uploadedFileRaw;

            if (!uploadedFile || !uploadedFile.path) {
                throw new Error('Failed to upload resume file to storage.');
            }

            setStatusText('Rendering PDF page to image preview...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                throw new Error(imageFile.error || 'Failed to convert PDF page to preview image.');
            }

            setStatusText('Saving preview thumbnail...');
            const uploadedImageRaw = await fs.upload([imageFile.file]);
            const uploadedImage = Array.isArray(uploadedImageRaw) ? uploadedImageRaw[0] : uploadedImageRaw;

            if (!uploadedImage || !uploadedImage.path) {
                throw new Error('Failed to upload resume preview image.');
            }

            setStatusText('Evaluating ATS compatibility & extracting feedback with AI...');
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

            setStatusText('Structuring score insights...');
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
            setStatusText('Complete! Redirecting to report...');
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
        <main className="bg-slate-50 dark:bg-slate-950 min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading pt-6 pb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                        ⚡ Instant AI ATS Screening
                    </div>
                    <h1>Smart Feedback for Your Target Job</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                        Upload your PDF resume and target job details to generate an instant ATS benchmark report.
                    </p>
                </div>

                {/* Step Progress Tracker */}
                <div className="w-full max-w-2xl grid grid-cols-3 gap-2 my-4">
                    <div className={`p-3 rounded-2xl border text-center transition-all ${
                        file ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                    }`}>
                        <span className="text-xs font-extrabold uppercase tracking-wider block">Step 1</span>
                        <span className="text-sm font-bold truncate block">{file ? "PDF Selected" : "Upload PDF"}</span>
                    </div>
                    <div className="p-3 rounded-2xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-center">
                        <span className="text-xs font-extrabold uppercase tracking-wider block">Step 2</span>
                        <span className="text-sm font-bold truncate block">Target Role</span>
                    </div>
                    <div className="p-3 rounded-2xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-center">
                        <span className="text-xs font-extrabold uppercase tracking-wider block">Step 3</span>
                        <span className="text-sm font-bold truncate block">AI Analysis</span>
                    </div>
                </div>

                {/* Processing Overlay State */}
                {isProcessing ? (
                    <div className="glass-card max-w-xl w-full p-12 text-center flex flex-col items-center gap-6 my-6 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xl">📄</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statusText}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                This usually takes 5-10 seconds. Puter AI is scanning your formatting, skills, and ATS alignment.
                            </p>
                        </div>
                        <img src="/images/resume-scan.gif" className="w-full max-w-sm rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800" alt="Scanning" />
                    </div>
                ) : (
                    <div className="glass-card max-w-2xl w-full p-8 md:p-10 border border-slate-200/80 dark:border-slate-800/80">
                        {errorMessage && (
                            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 p-4 rounded-2xl mb-6 text-center animate-in fade-in duration-200">
                                <p className="font-bold text-sm">{errorMessage}</p>
                                <p className="text-xs mt-1 opacity-80">Please check your internet connection or select another PDF file.</p>
                            </div>
                        )}

                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="form-div">
                                <label htmlFor="uploader" className="font-bold text-slate-900 dark:text-slate-100">
                                    1. Upload Resume PDF <span className="text-rose-500">*</span>
                                </label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="form-div">
                                    <label htmlFor="company-name">Company Name (Optional)</label>
                                    <input
                                        type="text"
                                        name="company-name"
                                        placeholder="e.g. Google, Stripe, Microsoft"
                                        id="company-name"
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-title">Job Title (Optional)</label>
                                    <input
                                        type="text"
                                        name="job-title"
                                        placeholder="e.g. Senior Frontend Engineer"
                                        id="job-title"
                                    />
                                </div>
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description">Job Description / Requirements (Optional)</label>
                                <textarea
                                    rows={4}
                                    name="job-description"
                                    placeholder="Paste job description keywords here to run tailored ATS keyword matching..."
                                    id="job-description"
                                />
                            </div>

                            <button className="primary-button cursor-pointer text-base font-bold py-3.5 mt-2" type="submit">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Run AI ATS Analysis
                            </button>
                        </form>
                    </div>
                )}
            </section>
        </main>
    );
};

export default Upload;
