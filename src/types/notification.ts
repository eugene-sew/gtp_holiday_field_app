export interface Notification {
  id: string;
  type: 'task_assigned' | 'deadline' | 'status_update';
  title: string;
  message: string;
  read: boolean;
  timestamp: string; // ISO date string
  icon: React.ReactNode;
}