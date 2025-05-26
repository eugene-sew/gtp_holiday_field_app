import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../stores/taskStore';
import { useTeamStore } from '../../stores/teamStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { Task } from '../../types/task';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Calendar, Clock, MapPin, AlertCircle, FileText, Users } from 'lucide-react';

type TaskFormProps = {
  task?: Task;
  isEditing?: boolean;
};

const TaskForm = ({ task, isEditing = false }: TaskFormProps) => {
  const navigate = useNavigate();
  const { addTask, updateTask } = useTaskStore();
  const { team } = useTeamStore();
  const { addNotification } = useNotificationStore();
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    deadline: task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    location: task?.location || '',
    assigneeId: task?.assignee?.id || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const assignee = formData.assigneeId 
        ? team.find(member => member.id === formData.assigneeId)
        : undefined;
      
      const taskData = {
        id: task?.id || crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        deadline: new Date(formData.deadline).toISOString(),
        priority: formData.priority as 'low' | 'medium' | 'high',
        status: formData.status as 'pending' | 'in_progress' | 'completed',
        location: formData.location,
        assignee: assignee,
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (isEditing && task) {
        await updateTask(taskData);
        addNotification({
          type: 'status_update',
          title: 'Task Updated',
          message: `Task "${taskData.title}" has been updated.`,
        });
      } else {
        await addTask(taskData);
        addNotification({
          type: 'task_assigned',
          title: 'New Task Created',
          message: `Task "${taskData.title}" has been created.`,
        });
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <Input
              id="title"
              name="title"
              type="text"
              label="Task Title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              icon={<FileText className="h-5 w-5 text-gray-400" />}
              fullWidth
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-gray-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter task description"
                value={formData.description}
                onChange={handleChange}
                className={`appearance-none block w-full pl-10 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                label="Deadline"
                value={formData.deadline}
                onChange={handleChange}
                error={errors.deadline}
                icon={<Calendar className="h-5 w-5 text-gray-400" />}
                fullWidth
              />
            </div>
            
            <div>
              <Input
                id="location"
                name="location"
                type="text"
                label="Location"
                placeholder="Enter location (optional)"
                value={formData.location}
                onChange={handleChange}
                icon={<MapPin className="h-5 w-5 text-gray-400" />}
                fullWidth
              />
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="assigneeId"
                  name="assigneeId"
                  value={formData.assigneeId}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Unassigned</option>
                  {team.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {isEditing && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;