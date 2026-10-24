import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { initialActivities } from '../data/activitiesMock';
import { canonicalJson, sha256Hex } from '../utils/hash';
import { useNotifications } from './NotificationsContext';

const ACTIVITIES_STORAGE_KEY = 'skillvault_activities';
const ACTIVITIES_VERSION_KEY = 'skillvault_activities_version';
const ACTIVITIES_DATA_VERSION = 1;

const ActivitiesContext = createContext(null);

export function ActivitiesProvider({ children }) {
  const { addNotification } = useNotifications();
  const hasWarnedQuotaRef = useRef(false);

  const [activities, setActivities] = useState(() => {
    try {
      const storedVersion = localStorage.getItem(ACTIVITIES_VERSION_KEY);
      if (storedVersion !== String(ACTIVITIES_DATA_VERSION)) {
        localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
        localStorage.setItem(ACTIVITIES_VERSION_KEY, String(ACTIVITIES_DATA_VERSION));
        return initialActivities;
      }
      const saved = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialActivities;
    } catch {
      return initialActivities;
    }
  });

  // Keep localStorage updated with quota handling
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
      localStorage.setItem(ACTIVITIES_VERSION_KEY, String(ACTIVITIES_DATA_VERSION));
    } catch {
      // Storage unavailable or quota exceeded
      if (!hasWarnedQuotaRef.current) {
        console.warn(
          'SkillVault: localStorage quota exceeded. Trimming older image previews to preserve activity records.'
        );
        hasWarnedQuotaRef.current = true;
      }

      // Retry saving with fileUrl set to null for all except 10 newest items
      try {
        const sorted = [...activities].sort((a, b) => {
          const dateA = a.submittedAt || a.date || '';
          const dateB = b.submittedAt || b.date || '';
          return dateB.localeCompare(dateA);
        });
        const newestIds = new Set(sorted.slice(0, 10).map((a) => a.id));
        const trimmedActivities = activities.map((act) =>
          newestIds.has(act.id) ? act : { ...act, fileUrl: null }
        );
        localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(trimmedActivities));
        localStorage.setItem(ACTIVITIES_VERSION_KEY, String(ACTIVITIES_DATA_VERSION));
      } catch {
        // If even that fails, strip all fileUrls but never throw
        try {
          const strippedActivities = activities.map((act) => ({ ...act, fileUrl: null }));
          localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(strippedActivities));
          localStorage.setItem(ACTIVITIES_VERSION_KEY, String(ACTIVITIES_DATA_VERSION));
        } catch {
          // Never throw
        }
      }
    }
  }, [activities]);

  /**
   * Add a new student activity submission (Pending status)
   */
  const addActivity = useCallback((newActivity) => {
    const activityWithDefaults = {
      id: newActivity.id || `act-${Date.now()}`,
      studentEmail: newActivity.studentEmail?.trim().toLowerCase() || '',
      studentName: newActivity.studentName || 'Student',
      institution: newActivity.institution || 'Higher Education Institution, J&K',
      title: newActivity.title || 'Untitled Achievement',
      category: newActivity.category || 'Technical',
      date: newActivity.date || new Date().toISOString().split('T')[0],
      formattedDate: newActivity.formattedDate || newActivity.date,
      description: newActivity.description || '',
      skills: Array.isArray(newActivity.skills) ? newActivity.skills : [],
      skillsAwarded: [],
      fileName: newActivity.fileName || 'certificate_proof.pdf',
      fileType: newActivity.fileType || 'pdf',
      fileUrl: newActivity.fileUrl || null,
      fileHash: newActivity.fileHash || null,
      status: 'Pending',
      submittedAt: newActivity.submittedAt || new Date().toISOString().split('T')[0],
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      proof: null
    };

    setActivities((prev) => [activityWithDefaults, ...prev]);
    return activityWithDefaults;
  }, []);

  /**
   * Approve an activity and mint its deterministic SHA-256 proof hash
   */
  const approveActivity = useCallback(
    async ({ id, skillsAwarded = [], adminName = 'College Admin' }) => {
      // Find activity
      const target = activities.find((a) => a.id === id);
      if (!target) {
        throw new Error(`Activity ${id} not found`);
      }
      if (target.status !== 'Pending') {
        throw new Error(`Activity ${id} is already reviewed (${target.status})`);
      }

      const approvedAt = new Date().toISOString();

      // Highest block number helper
      const maxBlock = activities.reduce((max, a) => {
        const num = a.proof?.blockNumber;
        return typeof num === 'number' && num > max ? num : max;
      }, 1849220);
      const nextBlockNumber = maxBlock + 1;

      // Canonical payload for deterministic ledger digest
      const canonicalPayload = {
        activityId: target.id,
        approvedAt,
        approvedBy: adminName,
        category: target.category,
        date: target.date,
        description: target.description,
        fileHash: target.fileHash,
        skillsAwarded: skillsAwarded.slice().sort(),
        studentEmail: target.studentEmail,
        title: target.title
      };

      const canonicalStr = canonicalJson(canonicalPayload);
      const rawHexHash = await sha256Hex(canonicalStr);
      const proofHash = `0x${rawHexHash}`;

      // Future: POST /api/v1/activities/:id/approve, backend writes hash to Polygon/Hyperledger
      const proof = {
        hash: proofHash,
        timestamp: approvedAt,
        blockNumber: nextBlockNumber,
        network: 'Govt. J&K EduLedger PoA (demo)'
      };

      const updatedActivity = {
        ...target,
        status: 'Approved',
        skillsAwarded,
        reviewedBy: adminName,
        reviewedAt: approvedAt,
        rejectionReason: null,
        proof
      };

      let wasPending = false;
      setActivities((prev) => {
        const currentTarget = prev.find((a) => a.id === id);
        if (!currentTarget || currentTarget.status !== 'Pending') {
          return prev;
        }
        wasPending = true;
        return prev.map((a) => (a.id === id ? updatedActivity : a));
      });

      if (!wasPending) {
        return target;
      }

      // Push student notification
      const skillsText = skillsAwarded.length > 0 ? skillsAwarded.join(', ') : 'Verified Credential';
      addNotification({
        studentEmail: target.studentEmail,
        type: 'approved',
        title: 'Achievement Approved',
        message: `Your '${target.title}' was approved. Skills added: ${skillsText}`,
        activityId: target.id
      });

      return updatedActivity;
    },
    [activities, addNotification]
  );

  /**
   * Reject an activity with reviewer reason
   */
  const rejectActivity = useCallback(
    ({ id, reason, adminName = 'College Admin' }) => {
      const target = activities.find((a) => a.id === id);
      if (!target) {
        throw new Error(`Activity ${id} not found`);
      }
      if (target.status !== 'Pending') {
        throw new Error(`Activity ${id} is already reviewed (${target.status})`);
      }

      const reviewedAt = new Date().toISOString();

      // Future: POST /api/v1/activities/:id/reject, notifies student and logs audit trail
      const updatedActivity = {
        ...target,
        status: 'Rejected',
        rejectionReason: reason,
        reviewedBy: adminName,
        reviewedAt,
        proof: null
      };

      setActivities((prev) =>
        prev.map((a) => (a.id === id ? updatedActivity : a))
      );

      // Push student notification
      addNotification({
        studentEmail: target.studentEmail,
        type: 'rejected',
        title: 'Achievement Not Verified',
        message: `Your '${target.title}' verification was rejected: ${reason}`,
        activityId: target.id
      });

      return updatedActivity;
    },
    [activities, addNotification]
  );

  /**
   * Filter activities for a specific student
   */
  const getActivitiesForStudent = useCallback(
    (email) => {
      if (!email) return [];
      const norm = email.trim().toLowerCase();
      return activities.filter((a) => a.studentEmail?.toLowerCase() === norm);
    },
    [activities]
  );

  /**
   * Get all pending submissions
   */
  const getPending = useCallback(() => {
    return activities.filter((a) => a.status === 'Pending');
  }, [activities]);

  /**
   * Get all activities
   */
  const getAll = useCallback(() => {
    return activities;
  }, [activities]);

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        addActivity,
        approveActivity,
        rejectActivity,
        getActivitiesForStudent,
        getPending,
        getAll
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components, react/only-export-components
export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
}
