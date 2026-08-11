import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    });

    const file = acceptedFiles[0] || null;

    return (
        <div className="w-full gradient-border">
            <div
                {...getRootProps()}
                className={`uploader-drag-area ${
                    isDragActive
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-4 ring-indigo-500/20'
                        : ''
                }`}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div
                        className="uploader-selected-file w-full animate-in fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs md:max-w-md">
                                    {file.name}
                                </p>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    PDF Ready ({formatSize(file.size)})
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileSelect?.(null);
                            }}
                            title="Remove file"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-4">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-base text-slate-700 dark:text-slate-300 font-semibold">
                                <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4">Click to upload</span> or drag and drop PDF
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Standard PDF formats accepted (Max file size: {formatSize(maxFileSize)})
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
