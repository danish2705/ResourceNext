import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  portfolio: string; // 'Global' = full access
}

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Samson Karre',  email: 'samson.karre@ascendion.com',  role: 'Portfolio Lead',    portfolio: 'Global' },
  { id: 'u-2', name: 'Anurag Vaishy', email: 'anurag.vaishy@ascendion.com', role: 'Program Manager',   portfolio: 'Hi-tech' },
  { id: 'u-3', name: 'Karthik Dontula', email: 'karthik.dontula@ascendion.com', role: 'Project Manager', portfolio: 'Banking' },
  { id: 'u-4', name: 'Lindsey Lord',  email: 'lindsey.lord@ascendion.com',  role: 'Resource Manager',  portfolio: 'Healthcare' },
];

interface UserState {
  current: User;
  users: User[];
  setUser: (id: string) => void;
}

export const useUser = create<UserState>((set, get) => ({
  current: mockUsers[0],
  users: mockUsers,
  setUser: (id) => {
    const u = get().users.find((x) => x.id === id);
    if (u) set({ current: u });
  },
}));
