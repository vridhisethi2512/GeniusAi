import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 py-6 px-6 transition-colors duration-200">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row max-w-7xl mx-auto">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    &copy; 2026 PrepGenius AI. All rights reserved. Secure Cloud Storage.
                </p>
                <div className="flex space-x-6 text-xs text-slate-400 dark:text-slate-500">
                    <span className="hover:text-blue-500 cursor-pointer transition">Privacy Policy</span>
                    <span className="hover:text-blue-500 cursor-pointer transition">Terms of Service</span>
                    <span className="hover:text-blue-500 cursor-pointer transition">Support Helpdesk</span>
                </div>
            </div>
        </footer>
    );
}
