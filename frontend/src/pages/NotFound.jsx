import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md space-y-6"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 mx-auto shadow-sm">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white font-sans tracking-tight">404</h1>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans">Page Not Found</h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                        The resource or practice session route you've navigated to is invalid or does not exist.
                    </p>
                </div>

                <Link
                    to="/dashboard"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Dashboard</span>
                </Link>
            </motion.div>
        </div>
    );
}
