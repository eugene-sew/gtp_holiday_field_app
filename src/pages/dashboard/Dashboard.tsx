import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStore';
import { useActivityStore } from '../../stores/activityStore';
import { CheckSquare, Clock, AlertTriangle, Users } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import TasksChart from '../../components/dashboard/TasksChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import Card from '../../components/ui/Card';
import { Task } from '../../types/task';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const { activities } = useActivityStore();
  
  const isAdmin = user?.role === 'admin';
  
  // Filter tasks based on user role
  const userTasks = isAdmin 
    ? tasks 
    : tasks.filter(task => task.assignee?.id === user?.id);
  
  // Calculate task statistics
  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const inProgressTasks = userTasks.filter(task => task.status === 'in_progress');
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  
  // Calculate overdue tasks
  const overdueTasks = userTasks.filter(task => {
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    return deadlineDate < today && task.status !== 'completed';
  });
  
  // High priority tasks
  const highPriorityTasks = userTasks.filter(task => task.priority === 'high');
  
  // Data for chart
  const chartData = [
    { name: 'Pending', value: pendingTasks.length, color: '#F59E0B' },
    { name: 'In Progress', value: inProgressTasks.length, color: '#3B82F6' },
    { name: 'Completed', value: completedTasks.length, color: '#10B981' },
  ];
  
  // Get upcoming tasks
  const upcomingTasks = [...pendingTasks, ...inProgressTasks]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin 
            ? 'Overview of all tasks and team activity'
            : 'Overview of your assigned tasks and activity'
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={userTasks.length}
          icon={<CheckSquare className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks.length}
          icon={<Clock className="h-6 w-6" />}
          color="teal"
        />
        <StatCard
          title="Overdue"
          value={overdueTasks.length}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="High Priority"
          value={highPriorityTasks.length}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="amber"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TasksChart data={chartData} />
        <RecentActivity activities={activities.slice(0, 5)} />
      </div>
      
      <div>
        <Card title="Upcoming Tasks">
          <div className="divide-y divide-gray-200">
            {upcomingTasks.length === 0 ? (
              <p className="py-4 text-center text-gray-500">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task: Task) => (
                <div key={task.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-3 ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status === 'pending' ? 'Pending' :
                       task.status === 'in_progress' ? 'In Progress' :
                       'Completed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;