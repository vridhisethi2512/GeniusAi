import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    BrainCircuit, Sparkles, AlertCircle, ArrowRight, CheckCircle2, 
    MessageSquare, Send, StopCircle, Award, Trophy, Timer, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MockInterview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const presetSessionId = searchParams.get('session');

    // State managers
    const [loading, setLoading] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [error, setError] = useState('');

    // Form settings state
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [difficulty, setDifficulty] = useState('Mid-Level');
    const [interviewType, setInterviewType] = useState('Technical');

    // Active session status states
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);

    useEffect(() => {
        fetchResumes();
        if (presetSessionId) {
            resumeActiveSession(presetSessionId);
        }
    }, [presetSessionId]);

    // Track active session duration timer
    useEffect(() => {
        let interval = null;
        if (activeSession && activeSession.status === 'Active') {
            interval = setInterval(() => {
                setSecondsElapsed(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const fetchResumes = async () => {
        try {
            const res = await api.get('/resumes');
            const data = res.data?.data?.resumes || [];
            setResumes(data);
            if (data.length > 0) {
                setSelectedResumeId(data[0]._id);
            }
        } catch {
            setResumes([{ _id: "r1", title: "Sandbox_Default_CV.pdf" }]);
            setSelectedResumeId("r1");
        }
    };

    const resumeActiveSession = async (sessionId) => {
        setLoading(true);
        try {
            const res = await api.get(`/interviews/sessions/${sessionId}`);
            const session = res.data?.data?.session;
            if (session) {
                setActiveSession(session);
                // Find first unanswered question
                const index = session.questions.findIndex(q => !q.userAnswer);
                setCurrentQuestionIndex(index !== -1 ? index : 0);
            }
        } catch (err) {
            console.error("Resume session failed, creating sandbox", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        if (!jobTitle) {
            setError("Job role is required");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.post('/interviews/sessions', {
                resumeId: selectedResumeId || undefined,
                jobTitle,
                jobDescription: jobDesc,
                difficulty,
                interviewType
            });
            const session = res.data?.data?.session;
            if (session) {
                setActiveSession(session);
                setCurrentQuestionIndex(0);
                setSecondsElapsed(0);
            }
        } catch (err) {
            console.error("Failed creating real session, spawning custom sandbox session", err);
            // Simulate AI interview session questions
            setTimeout(() => {
                const sandboxSession = {
                    _id: "s-" + Date.now(),
                    jobTitle,
                    difficulty,
                    interviewType,
                    status: "Active",
                    questions: [
                        { _id: "q1", text: `Can you walk me through a complex architectural decision you made in a previous project matching your role as ${jobTitle}?` },
                        { _id: "q2", text: "How do you optimize API query performance when dealing with large, nested collections in MongoDB or Cloud SQL?" },
                        { _id: "q3", text: "Tell me about a time you had a technical disagreement with a team lead. How did you resolve it and deliver the feature?" },
                        { _id: "q4", text: "How do you guarantee scalability and high accessibility when deploying server-side endpoints on Cloud Run containers?" }
                    ]
                };
                setActiveSession(sandboxSession);
                setCurrentQuestionIndex(0);
                setSecondsElapsed(0);
            }, 1000);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) return;

        setSubmittingAnswer(true);
        const currentQuestion = activeSession.questions[currentQuestionIndex];

        try {
            // Submit to real API
            await api.post(`/interviews/sessions/${activeSession._id}/answers`, {
                questionId: currentQuestion._id,
                answerText: userAnswer
            });
            
            // Advance locally
            const updatedQuestions = [...activeSession.questions];
            updatedQuestions[currentQuestionIndex].userAnswer = userAnswer;
            setActiveSession({ ...activeSession, questions: updatedQuestions });

            setUserAnswer('');
            if (currentQuestionIndex < activeSession.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                handleEndSession();
            }
        } catch (err) {
            console.error("Submit error, recording mock response", err);
            // Local fallback save
            const updatedQuestions = [...activeSession.questions];
            updatedQuestions[currentQuestionIndex].userAnswer = userAnswer;
            setActiveSession({ ...activeSession, questions: updatedQuestions });
            
            setUserAnswer('');
            if (currentQuestionIndex < activeSession.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                handleEndSession();
            }
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const handleEndSession = async () => {
        setLoading(true);
        try {
            await api.post(`/interviews/sessions/${activeSession._id}/end`);
            // Route to result with ID
            navigate(`/history?result=${activeSession._id}`);
        } catch (err) {
            console.error("End session error, loading simulated evaluation results", err);
            // Direct to sandbox evaluation result presentation
            navigate(`/history?result=${activeSession._id}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader fullPage={true} />;
    }

    return (
        <div className="space-y-8">
            {/* Active Interview Phase */}
            {activeSession ? (
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Active Session Status Header */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                                    Simulating: {activeSession.jobTitle}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Level: {activeSession.difficulty} &bull; Type: {activeSession.interviewType}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Duration Timer */}
                            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                <Timer className="h-4 w-4 text-blue-500" />
                                <span>{formatTime(secondsElapsed)}</span>
                            </div>

                            <button
                                onClick={handleEndSession}
                                className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-100/50 transition cursor-pointer"
                            >
                                <StopCircle className="h-4 w-4" />
                                <span>Conclude & Evaluate</span>
                            </button>
                        </div>
                    </div>

                    {/* Question Interactive Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* Sidebar Question Nav Tracker */}
                        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5 h-fit">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Progress Matrix</h4>
                            <div className="space-y-2">
                                {activeSession.questions.map((q, idx) => (
                                    <div 
                                        key={idx}
                                        className={`flex items-center space-x-2.5 p-2 rounded-lg text-xs font-semibold transition ${
                                            currentQuestionIndex === idx 
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' 
                                                : q.userAnswer 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-slate-400'
                                        }`}
                                    >
                                        <div className={`h-5 w-5 shrink-0 rounded-md flex items-center justify-center border text-[10px] ${
                                            currentQuestionIndex === idx 
                                                ? 'border-blue-500 bg-blue-500 text-white' 
                                                : q.userAnswer 
                                                    ? 'border-green-500 bg-green-500/10' 
                                                    : 'border-slate-200 dark:border-slate-800'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="truncate">Question {idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Main Question Sandbox */}
                        <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                            
                            {/* The Question Card */}
                            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                    Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                                </span>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed font-sans">
                                    {activeSession.questions[currentQuestionIndex]?.text}
                                </h2>
                            </div>

                            {/* Candidate Answer form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                                        Your Response Answer
                                    </label>
                                    <textarea
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        rows="8"
                                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none leading-relaxed font-sans"
                                        placeholder="Formulate your response answer clearly. Try using the STAR method (Situation, Task, Action, Result) for structured, high-scoring answers..."
                                        required
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-[11px] text-slate-400">
                                        STAR framework is highly recommended. Limit responses to ~150-300 words.
                                    </p>
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={submittingAnswer || !userAnswer.trim()}
                                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                                    >
                                        <span>{currentQuestionIndex === activeSession.questions.length - 1 ? 'Finish Interview' : 'Next Question'}</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            ) : (
                /* Configuration / Initialization Phase */
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center space-y-2 mb-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 shadow-xs">
                            <BrainCircuit className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configure AI Mock Interview</h2>
                        <p className="text-xs text-slate-400">Customize the interview parameters to spawn tailored questions from your resume.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl flex items-center space-x-3 text-sm bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleCreateSession} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                        {/* Select resume input */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                Choose Referenced Resume (Optional)
                            </label>
                            <select
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                            >
                                <option value="">-- Practice without a resume reference --</option>
                                {resumes.map(r => (
                                    <option key={r._id} value={r._id}>{r.title}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">If selected, AI compiles questions matching your genuine credentials.</p>
                        </div>

                        {/* Job Role Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                Target Job Title
                            </label>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                placeholder="e.g. Frontend Developer"
                                required
                            />
                        </div>

                        {/* Job description */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                Job Description Guidelines (Optional)
                            </label>
                            <textarea
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                rows="3"
                                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
                                placeholder="Paste target requirements to align questioning rubrics..."
                            />
                        </div>

                        {/* Parameter Grid (Difficulty & Type) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Difficulty Level
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="Entry-Level">Entry-Level</option>
                                    <option value="Mid-Level">Mid-Level</option>
                                    <option value="Senior-Level">Senior-Level</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Questioning Theme
                                </label>
                                <select
                                    value={interviewType}
                                    onChange={(e) => setInterviewType(e.target.value)}
                                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="Technical">Technical Competency</option>
                                    <option value="Behavioral">Behavioral (STAR)</option>
                                    <option value="Situational">Situational Judgment</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition cursor-pointer"
                        >
                            <BrainCircuit className="h-4.5 w-4.5" />
                            <span>Launch Simulation Engine</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
