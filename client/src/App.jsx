import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import BusinessProfileForm from './pages/BusinessProfileForm';
import RoadmapView from './pages/RoadmapView';
import DocumentChecklist from './pages/DocumentChecklist';
import Dashboard from './pages/Dashboard';
import SchemesView from './pages/SchemesView';
import Login from './pages/Login';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerApplicationDetail from './pages/OfficerApplicationDetail';
import VerifyCertificate from './pages/VerifyCertificate';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                className: 'text-sm font-semibold rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
              }} 
            />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public & Landing */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify" element={<VerifyCertificate />} />
                <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
                
                {/* Entrepreneur Intake & Compliance Routes */}
                <Route path="/start" element={<BusinessProfileForm />} />
                <Route path="/roadmap/:profileId" element={<RoadmapView />} />
                <Route path="/documents/:profileId/:approvalId" element={<DocumentChecklist />} />
                <Route path="/dashboard/:profileId" element={<Dashboard />} />
                <Route path="/schemes/:profileId" element={<SchemesView />} />
                
                {/* Officer Desk Routes */}
                <Route path="/officer-dashboard" element={<OfficerDashboard />} />
                <Route path="/officer/applications/:statusId" element={<OfficerApplicationDetail />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
