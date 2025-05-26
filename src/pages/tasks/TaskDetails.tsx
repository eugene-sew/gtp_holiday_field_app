import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, AlertCircle, User, Edit, Trash2, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, getTaskById, updateTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  useEffect(() => {
    if (id) {
      const taskData = getTaskById(id);
      if (taskData) {
        setTask(taskData);
      } else {
        navigate('/tasks');
      }
    }
    setLoading(false);
  }, [id, getTaskById, navigate, tasks]);
  
  if (loading || !task) {
    return <div>Loading task details...</div>;
  }
  
  const isAdmin = user?.role === 'admin';
  const isAssignee = user?.id === task.assignee?.id;
  const canEdit = isAdmin || isAssignee;
  const canDelete = isAdmin;
  
  const deadlineDate = new Date(task.deadline);
  const isOverdue = deadlineDate < new Date() && task.status !== 'completed';
  
  const handleStatusChange = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    
    await updateTask(updatedTask);
    setTask(updatedTask);
    
    addNotification({
      type: 'status_update',
      title: 'Task Status Updated',
      message: `Task "${task.title}" status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };
  
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      addNotification({
        type: 'status_update',
        title: 'Task Deleted',
        message: `Task "${task.title}" has been deleted.`,
      });
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Created {format(new Date(task.createdAt), 'PPP')}
          </p>
        </div>
        <div className="flex space-x-3">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/tasks/${task.id}/edit`)}
              icon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              onClick={handleDelete}
              icon={<Trash2 className="h-4 w-4" />}
              isLoading={isDeleting}
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Task Details">
            <div className="prose max-w-none">
              <p>{task.description}</p>
            </div>
            
            {task.location && (
              <div className="mt-6 flex items-center text-sm text-gray-600">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span>Location: {task.location}</span>
              </div>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isOverdue ? 'bg-red-100 text-red-800' :
                    task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {isOverdue ? 'Overdue' :
                     task.status === 'pending' ? 'Pending' :
                     task.status === 'in_progress' ? 'In Progress' :
                     'Completed'}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <Calendar className="h-5 w-5 text-gray-400 mr-1.5" />
                  {format(deadlineDate, 'PPP')}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                <div className="mt-1 flex items-center text-sm">
                  <AlertCircle className={`h-5 w-5 mr-1.5 ${
                    task.priority === 'high' ? 'text-red-500' :
                    task.priority === 'medium' ? 'text-amber-500' :
                    'text-blue-500'
                  }`} />
                  <span className="capitalize">{task.priority}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <User className="h-5 w-5 text-gray-400 mr-1.5" />
                  {task.assignee?.name || 'Unassigned'}
                </div>
              </div>
              
              {canEdit && task.status !== 'completed' && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('pending')}
                      >
                        Mark as Pending
                      </Button>
                    )}
                    {task.status !== 'in_progress' && (
                      <Button
                        size="sm"
                        variant={task.status === 'pending' ? 'primary' : 'outline'}
                        onClick={() => handleStatusChange('in_progress')}
                      >
                        Start Working
                      </Button>
                    )}
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="success"
                        icon={<Check className="h-4 w-4" />}
                        onClick={() => handleStatusChange('completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;