import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { 
    Clock, History as HistoryIcon, Calendar, 
    Award, ShieldAlert, Sparkles, FileText, BrainCircuit 
} from 'lucide-react';

export default function History() {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('interviews'); // 'interviews' | 'logs'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchHistoryData();
    }, [page]);

    const fetchHistoryData = async () => {
        setLoading(true);
        try {
            // Parallel fetches
            const [sessionsRes, logsRes] = await Promise.all([
                api.get('/interviews/sessions'),
                api.get(`/dashboard/activity-logs?page=${page}&limit=10`)
            ]);

            setSessions(sessionsRes.data?.data?.sessions || []);
            setLogs(logsRes.data?.data?.logs || logsRes.data?.logs || []);
            setTotalPages(logsRes.data?.data?.totalPages || logsRes.data?.totalPages || 1);
        } catch (err) {
            console.error("History fetch fail, setting mockup data:", err);
            // Simulate history records
            setSessions([
                { _id: "s1", jobTitle: "Fullstack Developer", interviewType: "Technical", difficulty: "Mid-Level", score: 82, status: "Completed", createdAt: "2026-07-15T10:00:00.000Z" },
                { _id: "s2", jobTitle: "Backend Architect", interviewType: "Technical", difficulty: "Senior-Level", score: 75, status: "Completed", createdAt: "2026-07-12T14:30:00.000Z" },
                { _id: "s3", jobTitle: "Product Engineer", interviewType: "Behavioral", difficulty: "Junior-Level", score: 85, status: "Completed", createdAt: "2026-07-10T09:15:00.000Z" }
            ]);
            
            setLogs([
                { id: "l1", type: "interview", text: "Concluded Technical practice for Fullstack Developer. Score: 82%", date: "2026-07-15 10:25" },
                { id: "l2", type: "resume", text: "Uploaded and parsed 'Software_Engineer_CV.pdf'.", date: "2026-07-15 09:50" },
                { id: "l3", type: "analysis", text: "Ran ATS alignment compatibility check against Product Designer job listing.", date: "2026-07-13 16:10" },
                { id: "l4", type: "interview", text: "Concluded Technical practice for Backend Architect. Score: 75%", date: "2026-07-12 15:00" },
                { id: "l5", type: "resume", text: "Uploaded and parsed 'Product_Manager_Resume.pdf'.", date: "2026-07-12 14:00" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    if (loading) {
        return <Loader fullPage={true} />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white font-sans tracking-tight flex items-center">
                    <HistoryIcon className="h-6 w-6 text-blue-600 mr-2 shrink-0" />
                    Practice History & Activity Logs
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Trace back your previous AI simulations, document analysis iterations, and learning milestone logs.
                </p>
            </div>

            {/* Tab Toggles */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('interviews')}
                    className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'interviews'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Mock Interviews ({sessions.length})
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'logs'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Activity Chronology
                </button>
            </div>

            {/* Interviews Tab View */}
            {activeTab === 'interviews' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    {sessions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                                        <th className="px-6 py-4">Job Role</th>
                                        <th className="px-6 py-4">Theme</th>
                                        <th className="px-6 py-4">Difficulty</th>
                                        <th className="px-6 py-4">Attempt Date</th>
                                        <th className="px-6 py-4">Performance Score</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-sm">
                                    {sessions.map((session) => (
                                        <tr key={session._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                                                {session.jobTitle}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600 text-xs font-medium">
                                                    {session.interviewType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                                                {session.difficulty}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {formatDate(session.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${session.score >= 80 ? 'text-green-600' : 'text-amber-500'}`}>
                                                    {session.score}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/interview-result?session=${session._id}`}
                                                    className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    View Scorecard
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400 text-sm space-y-2">
                            <p>No completed practice simulations recorded.</p>
                            <Link to="/mock-interview" className="text-blue-500 hover:underline text-xs font-semibold">Start your first simulation</Link>
                        </div>
                    )}
                </div>
            )}

            {/* Activity Logs Tab View */}
            {activeTab === 'logs' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    {logs.length > 0 ? (
                        <div className="space-y-6 relative border-l border-slate-100 dark:border-slate-800 pl-6 ml-3">
                            {logs.map((log, index) => (
                                <div key={log.id || index} className="relative space-y-1">
                                    {/* Circle Bullet icon */}
                                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                            {log.text}
                                        </p>
                                        <span className="text-[10px] text-slate-400 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {log.date}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 capitalize">
                                        Action Category: {log.type}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-12 text-slate-400 text-sm">No activity logs recorded.</p>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-slate-400 self-center">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
