import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BrainCircuit, History, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'Mock Interview', path: '/mock-interview', icon: BrainCircuit },
    { name: 'Practice History', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
];

export default function Sidebar({ isOpen, onClose }) {
    const sidebarClasses = "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-colors duration-200";

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header / Brand */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                        <BrainCircuit className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-sans font-bold text-base tracking-tight text-slate-900 dark:text-white">
                        PrepGenius <span className="text-blue-600">AI</span>
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
                    id="sidebar-close-btn"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 group ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <Icon className="mr-3 h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User details at bottom */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-bold font-sans">
                        PRO
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Premium Plan</p>
                        <p className="text-[10px] text-slate-400">Unlimited AI Feedback</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`${sidebarClasses} hidden lg:flex`}>
                {sidebarContent}
            </aside>

            {/* Mobile / Tablet Drawer Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-40 bg-black lg:hidden"
                            id="sidebar-backdrop"
                        />
                        {/* Sliding Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className={`${sidebarClasses} lg:hidden`}
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
