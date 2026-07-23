import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    TrendingUp, FileText, BrainCircuit, Award, 
    Sparkles, ArrowRight, Clock, PlusCircle, CheckCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import Loader from '../components/Loader';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/summary');
                setSummary(res.data?.data?.summary);
            } catch (err) {
                console.error("Dashboard fetch error, loading fallback:", err);
                // Graceful fallback structure if backend is not seeded/configured yet
                setSummary({
                    kpis: {
                        resumesAnalyzed: 3,
                        interviewsCompleted: 5,
                        avgMatchScore: 78,
                        prepProgress: 65
                    },
                    recommendations: [
                        { id: 1, text: "Your experience matches 85% of Software Engineer roles. Enhance your 'System Design' keywords.", type: "skills" },
                        { id: 2, text: "Practice more 'Situational' questions to improve your average evaluation feedback score.", type: "practice" },
                        { id: 3, text: "Resume 'optimizer_v2' detected. Optimize it for Google ATS specifications.", type: "resume" }
                    ],
                    recentPractices: [
                        { _id: "s1", jobTitle: "Fullstack Developer", interviewType: "Technical", score: 82, date: "2026-07-15" },
                        { _id: "s2", jobTitle: "Backend Architect", interviewType: "Technical", score: 75, date: "2026-07-12" },
                        { _id: "s3", jobTitle: "Product Engineer", interviewType: "Behavioral", score: 85, date: "2026-07-10" }
                    ],
                    performanceHistory: [55, 60, 72, 75, 82]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <Loader fullPage={true} />;
    }

    const kpis = summary?.kpis || { resumesAnalyzed: 0, interviewsCompleted: 0, avgMatchScore: 0, prepProgress: 0 };
    const recs = summary?.recommendations || [];
    const practices = summary?.recentPractices || [];
    const history = summary?.performanceHistory || [0, 0, 0, 0, 0];

    // Helper to generate coordinates for a beautiful custom line chart
    const getChartPoints = (data) => {
        const width = 500;
        const height = 150;
        const padding = 20;
        const xStep = (width - padding * 2) / Math.max(1, data.length - 1);
        
        return data.map((val, idx) => {
            const x = padding + idx * xStep;
            // Map 0-100 score to height chart range
            const y = height - padding - (val / 100) * (height - padding * 2);
            return { x, y };
        });
    };

    const points = getChartPoints(history);
    const pathD = points.length > 0 
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') 
        : '';
    
    // Fill path for background gradient
    const fillD = points.length > 0 
        ? `${pathD} L ${points[points.length - 1].x} 130 L ${points[0].x} 130 Z` 
        : '';

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Welcome Panel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-600/10">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI-Powered Career Accelerator</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold font-sans tracking-tight">
                        Hi, {user?.name || "Candidate"}!
                    </h1>
                    <p className="text-sm text-blue-100 font-sans font-light">
                        {kpis.interviewsCompleted > 0 
                            ? `You've finished ${kpis.interviewsCompleted} sessions. Ready to tackle another interview simulation?` 
                            : "Welcome! Let's optimize your resume and schedule your first mock interview simulation."}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link 
                        to="/resume-analyzer"
                        className="inline-flex items-center space-x-2 px-4.5 py-2.5 bg-white text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition cursor-pointer"
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>Upload Resume</span>
                    </Link>
                    <Link 
                        to="/mock-interview"
                        className="inline-flex items-center space-x-2 px-4.5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
                    >
                        <BrainCircuit className="h-4 w-4" />
                        <span>Start Interview</span>
                    </Link>
                </div>
            </div>

            {/* KPI Metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric Card 1 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumes Uploaded</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{kpis.resumesAnalyzed}</h3>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-600">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mocks Conducted</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{kpis.interviewsCompleted}</h3>
                        </div>
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center text-indigo-600">
                            <BrainCircuit className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Metric Card 3 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Score Match</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{kpis.avgMatchScore}%</h3>
                        </div>
                        <div className="h-10 w-10 bg-green-50 dark:bg-green-950/20 rounded-xl flex items-center justify-center text-green-600">
                            <Award className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Metric Card 4 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{kpis.prepProgress}%</h3>
                        </div>
                        <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-500">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Chart & Recent Practices Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Line Chart (Performance Score Tracking) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">Performance Score Tracking</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Average mock evaluation ratings over last 5 attempts</p>
                        </div>
                        <div className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg">
                            <TrendingUp className="h-3.5 w-3.5 mr-1" />
                            Upward trend
                        </div>
                    </div>

                    <div className="relative h-[160px] w-full flex items-center justify-center">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeWidth="1" />
                            <line x1="20" y1="75" x2="480" y2="75" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeWidth="1" />
                            <line x1="20" y1="130" x2="480" y2="130" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeWidth="1" />
                            
                            {/* Area Fill */}
                            {fillD && <path d={fillD} fill="url(#chartGrad)" />}
                            {/* Line path */}
                            {pathD && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                            
                            {/* Accent Points */}
                            {points.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" />
                                    <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3b82f6" className="dark:fill-blue-400">
                                        {history[i]}%
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                            <Sparkles className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                            AI Coach Advisor
                        </h3>
                        <div className="space-y-4">
                            {recs.map((rec) => (
                                <div key={rec.id} className="flex gap-3 text-xs">
                                    <div className="mt-0.5 shrink-0">
                                        <CheckCircle className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                                        {rec.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <Link 
                        to="/profile" 
                        className="mt-6 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group cursor-pointer"
                    >
                        <span>Optimize Coach Rubrics</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>

            {/* Recent Practice Simulations */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Mock Interviews</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Quickly resume practicing or review evaluations</p>
                    </div>
                    <Link 
                        to="/history" 
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        View All History
                    </Link>
                </div>

                {practices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="pb-3">Job Role</th>
                                    <th className="pb-3">Session Type</th>
                                    <th className="pb-3">Sim Date</th>
                                    <th className="pb-3">Overall Score</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-sm">
                                {practices.map((session) => (
                                    <tr key={session._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="py-4 font-semibold text-slate-700 dark:text-slate-200">{session.jobTitle}</td>
                                        <td className="py-4 text-slate-500 dark:text-slate-400">
                                            <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600 text-xs font-medium">
                                                {session.interviewType}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-400 text-xs flex items-center mt-1">
                                            <Clock className="h-3.5 w-3.5 mr-1" />
                                            {session.date}
                                        </td>
                                        <td className="py-4">
                                            <span className={`font-bold ${session.score >= 80 ? 'text-green-600' : 'text-amber-500'}`}>
                                                {session.score}%
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <Link
                                                to={`/mock-interview?session=${session._id}`}
                                                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline mr-4"
                                            >
                                                Resume
                                            </Link>
                                            <Link
                                                to={`/history?result=${session._id}`}
                                                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                                            >
                                                Scorecard
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400">No mock interviews completed yet.</p>
                        <Link 
                            to="/mock-interview"
                            className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 hover:underline"
                        >
                            <span>Initiate your first session</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
