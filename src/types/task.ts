// import { User } from './user'; // Removed as User is no longer directly referenced

export interface Task {
  taskId: string;
  description: string;
  status: "New" | "in_progress" | "completed";
  deadline: string; // ISO date string
  assignedTo: string;
  createdBy: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
