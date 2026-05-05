import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import PostJob from './pages/PostJob';
import Admin from './pages/Admin';
import RoleSelector from './components/RoleSelector';

const AuthenticatedApp = () => {
    const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
    const [user, setUser] = useState(null);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const me = await base44.auth.me();
                setUser(me);
            } catch (e) {
                // not logged in
            }
            setCheckingRole(false);
        };
        if (!isLoadingAuth && !isLoadingPublicSettings) checkUser();
    }, [isLoadingAuth, isLoadingPublicSettings]);

    // Show loading spinner while checking app public settings or auth
    if (isLoadingPublicSettings || isLoadingAuth || checkingRole) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Handle authentication errors
    if (authError) {
        if (authError.type === 'user_not_registered') {
            return <UserNotRegisteredError />;
        } else if (authError.type === 'auth_required') {
            // Redirect to login automatically
            navigateToLogin();
            return null;
        }
    }

    // Show role selector for new users
    if (user && !user.role_chosen && user.role !== 'admin') {
        return <RoleSelector onComplete={() => setUser(prev => ({ ...prev, role_chosen: true }))} />;
    }

    // Render the main app
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<PageNotFound />} />
            </Route>
        </Routes>
    );
};


function App() {

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <Router>
                    <AuthenticatedApp />
                </Router>
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}

export default App