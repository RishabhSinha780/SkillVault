import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Hash, 
  Share2 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatCard } from '../components/StatCard';
import { UploadCard } from '../components/UploadCard';
import { Timeline } from '../components/Timeline';
import { SkillRadar } from '../components/SkillRadar';
import { PortfolioQR } from '../components/PortfolioQR';
import { ProofModal } from '../components/ProofModal';
import { NotificationToast } from '../components/NotificationToast';
import { useAuth } from '../context/AuthContext';
import { initialActivities, mockStudent } from '../data/mock';

export const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const student = currentUser || mockStudent;

  // Local state for activities (so uploads immediately reflect)
  const [activities, setActivities] = useState(initialActivities);

  // Modal & Toast state
  const [selectedProof, setSelectedProof] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleShowToast = (toastObj) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(toastObj);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 4500);
  };

  const handleCloseToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  };

  const handleOpenProof = (activity) => {
    setSelectedProof(activity);
    setIsProofModalOpen(true);
  };

  const handleAddActivity = (newActivity) => {
    setActivities((prev) => [newActivity, ...prev]);

    // Trigger subtle celebratory confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#B7F34A', '#F3F1EA', '#38BDF8'],
      });
    } catch {
      // safe fallback
    }

    handleShowToast({
      type: 'success',
      title: 'Achievement queued for verification!',
      message: `"${newActivity.title}" was submitted to the faculty review queue.`,
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#172120] text-[#F3F1EA] flex flex-col relative selection:bg-[#B7F34A] selection:text-[#172120]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area (Clean container, no heavy sidebar) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* =========================================================================
            SECTION 1: WELCOME HERO
           ========================================================================= */}
        <section id="overview-section" className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E2B2A] border border-[#B7F34A]/25 text-xs font-semibold uppercase tracking-wider text-[#B7F34A] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7F34A] animate-pulse"></span>
                <span>Student dashboard</span>
              </div>

              {/* Heading with Italic Accent */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F3F1EA]">
                Welcome back,{' '}
                <span className="italic font-normal text-[#B7F34A]">
                  {student.name?.split(' ')[0] || 'Aarav'}.
                </span>
              </h1>

              {/* Subtext with Institution + Enrollment Number */}
              <p className="text-xs sm:text-sm text-[#9FB0AD] mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans">
                <span className="flex items-center gap-1.5 text-[#F3F1EA]">
                  <Building2 className="w-3.5 h-3.5 text-[#B7F34A]" />
                  {student.institution || 'National Institute of Technology, Srinagar'}
                </span>
                <span className="hidden sm:inline text-white/20">·</span>
                <span className="font-mono text-[#9FB0AD] flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#9FB0AD]" />
                  Roll: {student.enrollmentNo || '2022BCSE042'}
                </span>
                <span className="hidden sm:inline text-white/20">·</span>
                <span className="text-[#9FB0AD]">
                  {student.currentSemester || '7th Semester'} · {student.department || 'CSE'}
                </span>
              </p>
            </div>

            {/* Two Pill CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('upload-section')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B7F34A] hover:bg-[#C9FA62] text-[#172120] font-semibold text-xs transition-all shadow-[0_0_20px_rgba(183,243,74,0.3)] cursor-pointer hover:translate-y-[-1px]"
              >
                <span>Upload achievement →</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('portfolio-section')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E2B2A] hover:bg-[#253735] text-[#F3F1EA] border border-white/[0.12] hover:border-white/25 font-medium text-xs transition-all cursor-pointer hover:translate-y-[-1px]"
              >
                <Share2 className="w-3.5 h-3.5 text-[#B7F34A]" />
                <span>Share my portfolio</span>
              </button>
            </div>
          </div>

          {/* Stat Cards Row & Verified Score Ring */}
          <StatCard activities={activities} verifiedScore={student.verifiedScore || 94} />
        </section>

        {/* =========================================================================
            SECTION 2: UPLOAD ACHIEVEMENT (CARD)
           ========================================================================= */}
        <UploadCard onAddActivity={handleAddActivity} />

        {/* =========================================================================
            SECTION 3: ACTIVITY TIMELINE
           ========================================================================= */}
        <Timeline activities={activities} onSelectProof={handleOpenProof} />

        {/* =========================================================================
            SECTION 4: AI SKILL-GAP & CAREER DASHBOARD
           ========================================================================= */}
        <SkillRadar />

        {/* =========================================================================
            SECTION 5: VERIFIED PORTFOLIO / RECRUITER LINK
           ========================================================================= */}
        <PortfolioQR student={student} onShowToast={handleShowToast} />
      </main>

      {/* Proof Modal for Inspecting Certificates & Blockchain Hashes */}
      <ProofModal
        item={selectedProof}
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
      />

      {/* Floating Notification Toast */}
      <NotificationToast toast={toast} onClose={handleCloseToast} />

      {/* =========================================================================
          SECTION 6: FOOTER
         ========================================================================= */}
      <Footer />
    </div>
  );
};
