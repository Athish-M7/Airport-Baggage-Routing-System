import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface StaffUser {
  username: string;
  name: string;
  badgeId: string;
  role: string;
  department: string;
  avatarIcon: string;
  password?: string;
  isCustom?: boolean;
}

export const PRESET_STAFF_ACCOUNTS: StaffUser[] = [
  {
    username: 'ops_lead',
    name: 'Officer Arun Kumar',
    badgeId: 'OPS-742',
    role: 'Operations Lead',
    department: 'Baggage Operations Center',
    avatarIcon: '👨‍✈️',
  },
  {
    username: 'sec_officer',
    name: 'Officer Priya Raman',
    badgeId: 'SEC-310',
    role: 'Security Controller',
    department: 'Aviation X-Ray & Screening',
    avatarIcon: '🛡️',
  },
  {
    username: 'bay_manager',
    name: 'Supervisor Rajesh M.',
    badgeId: 'BAY-108',
    role: 'Ramp Supervisor',
    department: 'Apron & Loading Bays',
    avatarIcon: '🏗️',
  },
];

interface AuthContextType {
  user: StaffUser | null;
  allStaff: StaffUser[];
  isAuthenticated: boolean;
  login: (badgeOrUsername: string, password?: string) => boolean;
  quickLogin: (usernameOrBadge: string) => void;
  registerStaff: (data: {
    name: string;
    badgeId: string;
    department: string;
    role: string;
    avatarIcon: string;
    password?: string;
  }) => StaffUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'vaanam_staff_session';
const REGISTERED_KEY = 'vaanam_registered_staff_list';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load registered staff accounts from localStorage
  const [allStaff, setAllStaff] = useState<StaffUser[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_KEY);
      if (saved) {
        const parsed: StaffUser[] = JSON.parse(saved);
        // Combine presets with saved custom accounts
        const customOnly = parsed.filter(
          (p) => !PRESET_STAFF_ACCOUNTS.some((preset) => preset.username === p.username)
        );
        return [...PRESET_STAFF_ACCOUNTS, ...customOnly];
      }
    } catch {
      // ignore
    }
    return PRESET_STAFF_ACCOUNTS;
  });

  // Current logged in user
  const [user, setUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return PRESET_STAFF_ACCOUNTS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  useEffect(() => {
    try {
      const customOnly = allStaff.filter((s) => s.isCustom);
      localStorage.setItem(REGISTERED_KEY, JSON.stringify(customOnly));
    } catch {
      // ignore
    }
  }, [allStaff]);

  // Sync staff accounts with backend database
  useEffect(() => {
    api.getAllStaff()
      .then((dbList) => {
        if (Array.isArray(dbList) && dbList.length > 0) {
          const mapped: StaffUser[] = dbList.map((s: any) => ({
            username: s.username,
            name: s.fullName,
            badgeId: s.badgeId,
            department: s.department,
            role: s.staffRole,
            avatarIcon: s.avatarIcon || '👨‍✈️',
            password: s.passwordPin || 'vaanam2026',
            isCustom: !PRESET_STAFF_ACCOUNTS.some((p) => p.badgeId === s.badgeId),
          }));
          setAllStaff(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const login = (badgeOrUsername: string, password?: string): boolean => {
    const query = badgeOrUsername.trim().toLowerCase();
    const matched = allStaff.find(
      (s) => s.username.toLowerCase() === query || s.badgeId.toLowerCase() === query
    );

    if (matched) {
      if (matched.password && password && matched.password !== password) {
        return false;
      }
      setUser(matched);
      return true;
    }

    // Allow quick badge login
    if (query.length >= 3) {
      const customStaff: StaffUser = {
        username: query,
        name: `Staff Member (${query.toUpperCase()})`,
        badgeId: query.toUpperCase(),
        role: 'Operations Staff',
        department: 'Terminal Baggage Division',
        avatarIcon: '🛂',
        isCustom: true,
      };
      setAllStaff((prev) => [...prev, customStaff]);
      setUser(customStaff);
      return true;
    }

    return false;
  };

  const quickLogin = (usernameOrBadge: string) => {
    const matched = allStaff.find(
      (s) =>
        s.username.toLowerCase() === usernameOrBadge.toLowerCase() ||
        s.badgeId.toLowerCase() === usernameOrBadge.toLowerCase()
    );
    if (matched) {
      setUser(matched);
    }
  };

  const registerStaff = (data: {
    name: string;
    badgeId: string;
    department: string;
    role: string;
    avatarIcon: string;
    password?: string;
  }): StaffUser => {
    const cleanBadge = data.badgeId.trim().toUpperCase();
    const cleanUsername = cleanBadge.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const newStaff: StaffUser = {
      username: cleanUsername,
      name: data.name.trim(),
      badgeId: cleanBadge,
      department: data.department,
      role: data.role,
      avatarIcon: data.avatarIcon || '🛂',
      password: data.password || 'vaanam2026',
      isCustom: true,
    };

    setAllStaff((prev) => {
      // replace if already exists by badgeId
      const filtered = prev.filter((s) => s.badgeId !== newStaff.badgeId);
      return [...filtered, newStaff];
    });

    // Persist to backend SQL database table airport_staff
    api.registerStaffApi({
      badgeId: newStaff.badgeId,
      fullName: newStaff.name,
      username: newStaff.username,
      department: newStaff.department,
      staffRole: newStaff.role,
      avatarIcon: newStaff.avatarIcon,
      passwordPin: newStaff.password || 'vaanam2026',
    }).catch((err) => console.warn('Could not sync staff to DB:', err));

    // Automatically log in the newly registered staff member!
    setUser(newStaff);
    return newStaff;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allStaff,
        isAuthenticated: !!user,
        login,
        quickLogin,
        registerStaff,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
