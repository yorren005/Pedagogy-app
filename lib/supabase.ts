/**
 * Mock Supabase client and helper functions
 */

export type Profile = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Child = {
  id: string;
  profile_id: string;
  name: string;
  avatar_url?: string;
  age?: number;
  created_at: string;
  updated_at: string;
};

export type ProgressLog = {
  id: string;
  child_id: string;
  level_id: string;
  score: number;
  stars: number;
  time_spent_seconds: number;
  completed: boolean;
  created_at: string;
};

// Mock local data store
let mockProfiles: Profile[] = [];
let mockChildren: Child[] = [];
let mockProgressLogs: ProgressLog[] = [];

// Helper functions

export const getProfile = async (id: string): Promise<Profile | null> => {
  return mockProfiles.find((p) => p.id === id) || null;
};

export const getChildrenByProfile = async (profileId: string): Promise<Child[]> => {
  return mockChildren.filter((c) => c.profile_id === profileId);
};

export const addChild = async (child: Omit<Child, 'id' | 'created_at' | 'updated_at'>): Promise<Child> => {
  const newChild: Child = {
    ...child,
    id: Math.random().toString(36).substring(7),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockChildren.push(newChild);
  return newChild;
};

export const getProgressLogsByChild = async (childId: string): Promise<ProgressLog[]> => {
  return mockProgressLogs.filter((p) => p.child_id === childId);
};

export const addProgressLog = async (log: Omit<ProgressLog, 'id' | 'created_at'>): Promise<ProgressLog> => {
  const newLog: ProgressLog = {
    ...log,
    id: Math.random().toString(36).substring(7),
    created_at: new Date().toISOString(),
  };
  mockProgressLogs.push(newLog);
  return newLog;
};
