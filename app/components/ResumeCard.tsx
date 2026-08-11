import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        let isMounted = true;
        let objectUrl = '';

        const loadResume = async () => {
            if (!imagePath) return;

            // Direct URL / local static asset path
            if (imagePath.startsWith('/images/') || imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
                if (isMounted) setResumeUrl(imagePath);
                return;
            }

            // Puter FS path
            try {
                const blob = await fs.read(imagePath);
                if (blob && isMounted) {
                    objectUrl = URL.createObjectURL(blob);
                    setResumeUrl(objectUrl);
                } else if (isMounted) {
                    setResumeUrl(imagePath);
                }
            } catch (err) {
                console.error("Failed to load resume thumbnail:", err);
                if (isMounted) setResumeUrl(imagePath);
            }
        };

        loadResume();

        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imagePath]);

    const overallScore = feedback?.overallScore ?? 0;

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={overallScore} />
                </div>
            </div>
            <div className="gradient-border animate-in fade-in duration-1000">
                <div className="w-full h-full min-h-[250px] flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden">
                    {resumeUrl ? (
                        <img
                            src={resumeUrl}
                            alt="resume thumbnail"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-gray-400 gap-2">
                            <span className="text-xs">Preview Loading...</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
export default ResumeCard;
