
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import LoginForm from './pages/login';
import RegisterForm from './pages/register';
import LoadingScreen from './pages/loading';
import ClientDashboard from './components/ClientDashboard';
import BusinessDashboard from './components/BusinessDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import LiveSupport from './components/LiveSupport';
import CallCenter from './pages/call-center';
import SupportTicket from './pages/support-ticket';
import ClientOnboardingQuiz from './components/ClientOnboardingQuiz';
import BusinessRegistrationForm from './components/BusinessRegistrationForm';
import SwipeInterface from './components/SwipeInterface';
import NotFound from './pages/not-found';
import BusinessSupportTerminal from './components/BusinessSupportTerminal';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" richColors closeButton />
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/loading" element={<LoadingScreen />} />
              
              {/* Business Registration - Fixed routing */}
              <Route path="/business-registration" element={<BusinessRegistrationForm />} />
              <Route path="/register-business" element={<Navigate to="/business-registration" replace />} />
              
              <Route path="/dashboard/client" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/business" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <BusinessDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/employee" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } />
              
              {/* Discover - Only for clients */}
              <Route path="/discover" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <SwipeInterface />
                </ProtectedRoute>
              } />
              
              <Route path="/live-support" element={
                <ProtectedRoute>
                  <LiveSupport />
                </ProtectedRoute>
              } />
              <Route path="/business-support" element={
                <ProtectedRoute>
                  <BusinessSupportTerminal />
                </ProtectedRoute>
              } />
              <Route path="/call-center" element={
                <ProtectedRoute>
                  <CallCenter />
                </ProtectedRoute>
              } />
              <Route path="/support-ticket" element={
                <ProtectedRoute>
                  <SupportTicket />
                </ProtectedRoute>
              } />
              <Route path="/client-quiz" element={
                <ProtectedRoute>
                  <ClientOnboardingQuiz onComplete={() => {}} onSkip={() => {}} />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
