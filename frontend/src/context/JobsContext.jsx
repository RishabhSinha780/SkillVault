import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialJobs, initialApplications } from '../data/jobsMock';
import { todayISO, addDays } from '../utils/dates';

const JobsContext = createContext(null);

const DATA_VERSION = 2;

const STORAGE_KEYS = {
  JOBS: 'skillvault_jobs',
  APPLICATIONS: 'skillvault_applications',
  VERSION: 'skillvault_data_version',
};

// Check if stored data version matches current DATA_VERSION
const checkIsOutdated = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VERSION);
    return !stored || Number(stored) !== DATA_VERSION;
  } catch {
    return true;
  }
};

const isOutdated = checkIsOutdated();
if (isOutdated) {
  try {
    localStorage.setItem(STORAGE_KEYS.VERSION, String(DATA_VERSION));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(initialJobs));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
  } catch (err) {
    console.warn('Could not reset data version in localStorage:', err);
  }
}

export const JobsProvider = ({ children }) => {
  // 1. Jobs State
  const [jobs, setJobs] = useState(() => {
    if (isOutdated) return initialJobs;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read jobs from localStorage:', err);
    }
    return initialJobs;
  });

  // 2. Applications State
  const [applications, setApplications] = useState(() => {
    if (isOutdated) return initialApplications;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read applications from localStorage:', err);
    }
    return initialApplications;
  });

  // Sync jobs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      localStorage.setItem(STORAGE_KEYS.VERSION, String(DATA_VERSION));
    } catch (err) {
      console.warn('Failed saving jobs to localStorage:', err);
    }
  }, [jobs]);

  // Sync applications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
      localStorage.setItem(STORAGE_KEYS.VERSION, String(DATA_VERSION));
    } catch (err) {
      console.warn('Failed saving applications to localStorage:', err);
    }
  }, [applications]);

  /**
   * Future API Integration: POST /api/v1/jobs
   * Creates and persists a new job posting.
   */
  const postJob = (jobData) => {
    const today = todayISO();
    const newJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: jobData.title?.trim() || 'Untitled Role',
      company: jobData.company?.trim() || 'SkillVault Partner',
      location: jobData.location?.trim() || 'Remote',
      type: jobData.type || 'Full-time',
      mode: jobData.mode || 'Hybrid',
      stipendOrSalary: jobData.stipendOrSalary?.trim() || 'Competitive',
      description: jobData.description?.trim() || '',
      requiredSkills: Array.isArray(jobData.requiredSkills) ? jobData.requiredSkills : [],
      preferredSkills: Array.isArray(jobData.preferredSkills) ? jobData.preferredSkills : [],
      minVerifiedActivities: Number(jobData.minVerifiedActivities) || 1,
      deadline: jobData.deadline || addDays(today, 30),
      postedBy: jobData.postedBy || 'recruiter@apexsystems.io',
      postedAt: today,
      status: 'Open',
    };

    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  /**
   * Closes an existing job posting.
   */
  const closeJob = (jobId) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: 'Closed' } : job))
    );
  };

  /**
   * Reopens a closed job posting.
   */
  const reopenJob = (jobId) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: 'Open' } : job))
    );
  };

  /**
   * Future API Integration: POST /api/v1/jobs/:id/apply
   * Applies a student to a job posting, storing their verified skills and approved activities snapshot.
   */
  const applyToJob = ({
    jobId,
    studentEmail,
    studentName,
    matchScore = 0,
    verifiedSkills = [],
    approvedActivities = [],
    institution = '',
    verifiedScore = 94,
  }) => {
    // Check if already applied
    const existing = applications.find(
      (app) => app.jobId === jobId && app.studentEmail === studentEmail
    );
    if (existing) {
      return { success: false, application: existing, isDuplicate: true };
    }

    const newApplication = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      jobId,
      studentEmail,
      studentName: studentName || 'Applicant',
      appliedAt: todayISO(),
      status: 'Applied', // 'Applied' | 'Shortlisted' | 'Interviewing' | 'Hired' | 'Rejected'
      matchScore: Math.round(matchScore),
      snapshot: {
        name: studentName || 'Applicant',
        email: studentEmail,
        institution: institution || 'National Institute of Technology, Srinagar',
        verifiedScore: verifiedScore || 94,
        verifiedSkills: Array.isArray(verifiedSkills) ? verifiedSkills : [],
        approvedActivities: Array.isArray(approvedActivities) ? approvedActivities : [],
      },
    };

    setApplications((prev) => [newApplication, ...prev]);
    return { success: true, application: newApplication };
  };

  /**
   * Future API Integration: PATCH /api/v1/applications/:id
   * Updates an applicant's status in the review pipeline.
   */
  const updateApplicationStatus = (applicationId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
  };

  /**
   * Future API Integration: GET /api/v1/jobs/recruiter/:email
   * Returns all postings by a specific recruiter.
   */
  const getJobsByRecruiter = (recruiterEmail) => {
    if (!recruiterEmail) return jobs;
    return jobs.filter(
      (j) => j.postedBy?.toLowerCase() === recruiterEmail.toLowerCase()
    );
  };

  /**
   * Future API Integration: GET /api/v1/jobs/:id/applications
   * Returns applications for a given job.
   */
  const getApplicationsForJob = (jobId) => {
    return applications.filter((app) => app.jobId === jobId);
  };

  /**
   * Future API Integration: GET /api/v1/students/:email/applications
   * Returns applications submitted by a student.
   */
  const getApplicationsForStudent = (studentEmail) => {
    if (!studentEmail) return [];
    return applications.filter(
      (app) => app.studentEmail?.toLowerCase() === studentEmail.toLowerCase()
    );
  };

  /**
   * Lookup helper: returns job by ID
   */
  const getJobById = (jobId) => {
    return jobs.find((j) => j.id === jobId) || null;
  };

  return (
    <JobsContext.Provider
      value={{
        jobs,
        applications,
        postJob,
        closeJob,
        reopenJob,
        applyToJob,
        updateApplicationStatus,
        getJobsByRecruiter,
        getApplicationsForJob,
        getApplicationsForStudent,
        getJobById,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
