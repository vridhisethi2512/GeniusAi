import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileSelect, accept = ".pdf,.doc,.docx", maxSizeMB = 5 }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const validateFile = (selectedFile) => {
        setError('');
        if (!selectedFile) return false;

        // Check file extension
        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        const allowedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
        
        if (!allowedExtensions.includes(fileExt)) {
            setError(`Unsupported file format. Please upload: ${accept}`);
            setFile(null);
            return false;
        }

        // Check size
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setError(`File size exceeds the limit of ${maxSizeMB}MB.`);
            setFile(null);
            return false;
        }

        setFile(selectedFile);
        if (onFileSelect) {
            onFileSelect(selectedFile);
        }
        return true;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div className="w-full">
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragActive 
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/10" 
                        : "border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-slate-800/10"
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />

                {file ? (
                    <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
                            <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">Click or drag to replace</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600">
                            <Upload className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Drag & drop your resume file here
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Supported formats: {accept.toUpperCase()} (Max {maxSizeMB}MB)
                            </p>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-950/30 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            Browse Files
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center space-x-2 mt-3 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
