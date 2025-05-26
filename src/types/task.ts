import { User } from './user';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string; // ISO date string
  assignee?: User;
  location?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}