import { create } from 'zustand';
import { Task } from '../types/task';
import { mockTasks } from '../data/mockData';

interface TaskState {
  tasks: Task[];
  getTaskById: (id: string) => Task | undefined;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [...mockTasks],
  
  getTaskById: (id: string) => {
    return get().tasks.find(task => task.id === id);
  },
  
  addTask: async (task: Task) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        tasks: [...state.tasks, task],
      }));
    } catch (error) {
      console.error('Add task failed:', error);
      throw error;
    }
  },
  
  updateTask: async (task: Task) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        tasks: state.tasks.map(t => (t.id === task.id ? task : t)),
      }));
    } catch (error) {
      console.error('Update task failed:', error);
      throw error;
    }
  },
  
  deleteTask: async (id: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
      }));
    } catch (error) {
      console.error('Delete task failed:', error);
      throw error;
    }
  },
}));