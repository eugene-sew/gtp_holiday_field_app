import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Task } from '../../types/task';
import { clsx } from 'clsx';

type TaskCardProps = {
  task: Task;
};

const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };
  
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
  const displayStatus = isOverdue ? 'overdue' : task.status;
  
  const statusLabel = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    overdue: 'Overdue',
  };

  // Calculate deadline proximity for animation
  const deadlineDate = new Date(task.deadline);
  const today = new Date();
  const daysUntilDeadline = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const isUrgent = daysUntilDeadline <= 1 && !isOverdue && task.status !== 'completed';

  return (
    <div 
      onClick={() => navigate(`/tasks/${task.id}`)}
      className={clsx(
        'bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-150 cursor-pointer',
        isUrgent && 'animate-pulse-subtle border-amber-300'
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
        <div className={clsx(
          'px-2 py-1 rounded-full text-xs font-medium',
          statusColors[displayStatus as keyof typeof statusColors]
        )}>
          {statusLabel[displayStatus as keyof typeof statusLabel]}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
      
      <div className="border-t border-gray-100 pt-3 mt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <User className="h-3 w-3 mr-1" />
            <span>{task.assignee?.name || 'Unassigned'}</span>
          </div>
          
          {task.location && (
            <div className="flex items-center text-xs text-gray-500 col-span-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{task.location}</span>
            </div>
          )}
          
          {task.priority === 'high' && (
            <div className="flex items-center text-xs text-red-500 col-span-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>High Priority</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;