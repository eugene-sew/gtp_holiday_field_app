import { create } from 'zustand';
import { User } from '../types/user';
import { mockTeam } from '../data/mockData';

interface TeamState {
  team: User[];
  addTeamMember: (member: User) => Promise<void>;
  updateTeamMember: (member: User) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set) => ({
  team: [...mockTeam],
  
  addTeamMember: async (member: User) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        team: [...state.team, member],
      }));
    } catch (error) {
      console.error('Add team member failed:', error);
      throw error;
    }
  },
  
  updateTeamMember: async (member: User) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        team: state.team.map(m => (m.id === member.id ? member : m)),
      }));
    } catch (error) {
      console.error('Update team member failed:', error);
      throw error;
    }
  },
  
  removeTeamMember: async (id: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        team: state.team.filter(member => member.id !== id),
      }));
    } catch (error) {
      console.error('Remove team member failed:', error);
      throw error;
    }
  },
}));