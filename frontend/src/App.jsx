import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import MockInterview from './pages/MockInterview';
import InterviewResult from './pages/InterviewResult';
import History from './pages/History';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Root redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* Protected Routes nested in global Layout dashboard structure */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Dashboard />
                                    </Layout>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/resume-analyzer" 
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <ResumeAnalyzer />
                                    </Layout>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/mock-interview" 
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <MockInterview />
                                    </Layout>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/interview-result" 
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <InterviewResult />
                                    </Layout>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/history" 
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <History />
                                    </Layout>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Profile />
                                    </Layout>
                                </ProtectedRoute>
                            } 
                        />

                        {/* Catch-all Not Found Route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
