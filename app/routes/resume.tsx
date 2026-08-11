import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, auth.isAuthenticated]);

    useEffect(() => {
        let isMounted = true;
        let pdfObjUrl = '';
        let imgObjUrl = '';

        const loadFileUrl = async (path: string, defaultMime: string) => {
            if (!path) return '';

            // Static local images in /images/ or external URLs
            if (path.startsWith('/images/') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
                return path;
            }

            // Puter Cloud Storage path (e.g. /AppData/...)
            try {
                const fileData = await fs.read(path);
                if (fileData) {
                    const blob = fileData instanceof Blob ? fileData : new Blob([fileData], { type: defaultMime });
                    return URL.createObjectURL(blob);
                }
            } catch (e) {
                console.warn(`Failed to read ${path} from Puter FS:`, e);
            }

            return path;
        };

        const loadResume = async () => {
            if (!id) return;
            const resumeStr = await kv.get(`resume:${id}`);

            if (!resumeStr) return;

            let data;
            try {
                data = typeof resumeStr === 'string' ? JSON.parse(resumeStr) : resumeStr;
            } catch (e) {
                console.error("Failed to parse resume JSON:", e);
                return;
            }

            if (!data) return;

            // Set feedback structure
            try {
                const parsedFeedback = typeof data.feedback === 'string' ? JSON.parse(data.feedback) : data.feedback;
                if (isMounted) setFeedback(parsedFeedback);
            } catch (e) {
                console.error("Failed to parse feedback structure:", e);
            }

            // Load resume PDF object URL
            if (data.resumePath) {
                const pdfUrl = await loadFileUrl(data.resumePath, 'application/pdf');
                if (isMounted) {
                    if (pdfUrl.startsWith('blob:')) pdfObjUrl = pdfUrl;
                    setResumeUrl(pdfUrl);
                }
            }

            // Load resume preview image object URL
            if (data.imagePath) {
                const imgUrl = await loadFileUrl(data.imagePath, 'image/png');
                if (isMounted) {
                    if (imgUrl.startsWith('blob:')) imgObjUrl = imgUrl;
                    setImageUrl(imgUrl);
                }
            }
        };

        loadResume();

        return () => {
            isMounted = false;
            if (pdfObjUrl) URL.revokeObjectURL(pdfObjUrl);
            if (imgObjUrl) URL.revokeObjectURL(imgObjUrl);
        };
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full min-h-[calc(100vh-65px)] max-lg:flex-col-reverse">
                <section className="w-1/2 max-lg:w-full bg-[url('/images/bg-small.svg')] bg-cover sticky top-0 h-[calc(100vh-65px)] p-2 md:p-4 flex items-center justify-center">
                    <div className="gradient-border w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm shadow-xl !p-2">
                        {imageUrl ? (
                            <a href={resumeUrl || imageUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center overflow-auto">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain object-top rounded-xl shadow-md hover:scale-[1.005] transition-transform duration-300"
                                    alt="Resume Preview"
                                    title="Click to view full resume"
                                />
                            </a>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 gap-3 p-6">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-base font-medium text-gray-600">Loading resume preview...</span>
                            </div>
                        )}
                    </div>
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" alt="scanning" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
