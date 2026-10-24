import React, { createContext, useContext, useState } from 'react';
import { mockStudent } from '../data/mock';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillvault_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const storedRole = localStorage.getItem('skillvault_role');
      return storedRole || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async ({ role, email, password: _password, extraData = {} }) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Remove keys whose value is an empty string and filter out sensitive credentials
    const cleanExtra = {};
    for (const [key, value] of Object.entries(extraData)) {
      if (
        value !== '' && 
        value !== null && 
        value !== undefined && 
        key !== 'adminAccessCode' && 
        key !== 'password'
      ) {
        cleanExtra[key] = value;
      }
    }

    // Set name from extraData.fullName when non-empty; fallback to mock name only when empty
    const resolvedName = cleanExtra.fullName ? cleanExtra.fullName.trim() : null;

    let userObj = {};

    if (role === 'student') {
      userObj = {
        ...mockStudent,
        ...cleanExtra,
        name: resolvedName || mockStudent.name,
        role: 'student',
        email: email || mockStudent.email,
      };
    } else if (role === 'recruiter') {
      userObj = {
        role: 'recruiter',
        name: resolvedName || 'Tanya Roy (Tech Recruiter)',
        company: cleanExtra.companyName || 'Apex Systems & AI Labs',
        email: email || 'tanya@apexsystems.io',
        ...cleanExtra,
      };
      if (resolvedName) userObj.name = resolvedName;
    } else if (role === 'admin') {
      userObj = {
        role: 'admin',
        name: resolvedName || 'Prof. M. K. Dhar (Dean Accreditation)',
        institution: cleanExtra.institution || 'NIT Srinagar / J&K Higher Ed',
        email: email || 'admin@nitsri.ac.in',
        ...cleanExtra,
      };
      if (resolvedName) userObj.name = resolvedName;
    }

    // Ensure password and adminAccessCode are never stored
    delete userObj.password;
    delete userObj.adminAccessCode;

    setCurrentUser(userObj);
    setCurrentRole(role);
    localStorage.setItem('skillvault_user', JSON.stringify(userObj));
    localStorage.setItem('skillvault_role', role);
    setIsLoading(false);
    return userObj;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem('skillvault_user');
    localStorage.removeItem('skillvault_role');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isLoading,
        login,
        logout,
        isAuthenticated: !!currentRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
