import { Task } from '../types/task';
import { User } from '../types/user';
import { Activity } from '../types/activity';
import { AlertCircle, CheckSquare, Clock, ClipboardCheck, MapPin, UserCheck } from 'lucide-react';

// Mock team members
export const mockTeam: User[] = [
  {
    id: 'field-1',
    name: 'John Smith',
    email: 'john@fieldtask.com',
    role: 'field',
    phone: '555-123-4567',
  },
  {
    id: 'field-2',
    name: 'Sarah Johnson',
    email: 'sarah@fieldtask.com',
    role: 'field',
    phone: '555-234-5678',
  },
  {
    id: 'field-3',
    name: 'Mike Davis',
    email: 'mike@fieldtask.com',
    role: 'field',
    phone: '555-345-6789',
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@fieldtask.com',
    role: 'admin',
  },
];

// Create a function to get a team member by ID
const getTeamMember = (id: string): User | undefined => {
  return mockTeam.find(member => member.id === id);
};

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Site inspection at Project Alpha',
    description: 'Conduct a complete site inspection at Project Alpha. Check for safety compliance, progress on current phase, and document any issues.',
    status: 'in_progress',
    priority: 'high',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
    assignee: getTeamMember('field-1'),
    location: '123 Main St, Anytown, USA',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
  },
  {
    id: 'task-2',
    title: 'Equipment maintenance',
    description: 'Perform regular maintenance on the excavation equipment. Check fluid levels, inspect for damage, and test all safety features.',
    status: 'pending',
    priority: 'medium',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
    assignee: getTeamMember('field-2'),
    location: 'Equipment Yard, 456 Industrial Blvd',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'task-3',
    title: 'Client meeting preparation',
    description: 'Prepare presentation materials for the upcoming client meeting. Include project timeline, budget updates, and recent progress photos.',
    status: 'completed',
    priority: 'high',
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    assignee: getTeamMember('field-3'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
  },
  {
    id: 'task-4',
    title: 'Material delivery coordination',
    description: 'Coordinate with suppliers for the delivery of construction materials. Ensure delivery times align with project schedule and site access requirements.',
    status: 'pending',
    priority: 'medium',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days from now
    assignee: getTeamMember('field-1'),
    location: 'Project Beta Site, 789 Construction Ave',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'task-5',
    title: 'Safety training documentation',
    description: 'Document completion of safety training for all new team members. Collect signed acknowledgments and update training records.',
    status: 'pending',
    priority: 'low',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
    assignee: getTeamMember('field-2'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'task-6',
    title: 'Submit permit applications',
    description: 'Complete and submit all required permit applications for the next phase of Project Charlie. Include all supporting documentation and pay applicable fees.',
    status: 'completed',
    priority: 'high',
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    assignee: getTeamMember('field-3'),
    location: 'City Hall, 101 Government Plaza',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
  },
];

// Mock activities
export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    user: 'Admin User',
    description: 'Created a new task "Site inspection at Project Alpha"',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    icon: <ClipboardCheck className="h-6 w-6 text-blue-600" />,
    iconBackground: 'bg-blue-100',
  },
  {
    id: 'activity-2',
    user: 'John Smith',
    description: 'Started working on "Site inspection at Project Alpha"',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    icon: <Clock className="h-6 w-6 text-teal-600" />,
    iconBackground: 'bg-teal-100',
  },
  {
    id: 'activity-3',
    user: 'Admin User',
    description: 'Assigned "Equipment maintenance" to Sarah Johnson',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    icon: <UserCheck className="h-6 w-6 text-indigo-600" />,
    iconBackground: 'bg-indigo-100',
  },
  {
    id: 'activity-4',
    user: 'Mike Davis',
    description: 'Completed "Client meeting preparation"',
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
    icon: <CheckSquare className="h-6 w-6 text-green-600" />,
    iconBackground: 'bg-green-100',
  },
  {
    id: 'activity-5',
    user: 'Admin User',
    description: 'Created a new task "Material delivery coordination"',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    icon: <ClipboardCheck className="h-6 w-6 text-blue-600" />,
    iconBackground: 'bg-blue-100',
  },
  {
    id: 'activity-6',
    user: 'Mike Davis',
    description: 'Completed "Submit permit applications"',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    icon: <CheckSquare className="h-6 w-6 text-green-600" />,
    iconBackground: 'bg-green-100',
  },
  {
    id: 'activity-7',
    user: 'Sarah Johnson',
    description: 'Added location to "Equipment maintenance"',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    icon: <MapPin className="h-6 w-6 text-purple-600" />,
    iconBackground: 'bg-purple-100',
  },
  {
    id: 'activity-8',
    user: 'Admin User',
    description: 'Marked "Site inspection at Project Alpha" as high priority',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    icon: <AlertCircle className="h-6 w-6 text-red-600" />,
    iconBackground: 'bg-red-100',
  },
];