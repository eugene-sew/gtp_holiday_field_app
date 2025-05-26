import { create } from 'zustand';
import { Activity } from '../types/activity';
import { mockActivities } from '../data/mockData';

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'date'>) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [...mockActivities],
  
  addActivity: (activity) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...activity,
    };
    
    set(state => ({
      activities: [newActivity, ...state.activities],
    }));
  },
}));