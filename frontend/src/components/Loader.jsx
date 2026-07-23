import React from 'react';
import { motion } from 'motion/react';

export default function Loader({ size = 'medium', fullPage = false }) {
    const sizeClasses = {
        small: 'w-6 h-6 border-2',
        medium: 'w-12 h-12 border-4',
        large: 'w-16 h-16 border-4'
    };

    const loaderContent = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
                className={`${sizeClasses[size]} border-blue-100 border-t-blue-600 rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            {fullPage && (
                <motion.p
                    className="text-blue-600 dark:text-blue-400 font-medium font-sans tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    Loading PrepGenius AI...
                </motion.p>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center z-50">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
}
