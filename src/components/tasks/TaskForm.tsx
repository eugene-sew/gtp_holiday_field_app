import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../../stores/taskStore";
import { useTeamStore } from "../../stores/teamStore";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { Task } from "../../types/task";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Calendar, Clock, FileText, Users } from "lucide-react";

type TaskFormProps = {
  task?: Task;
  isEditing?: boolean;
};

const TaskForm = ({ task, isEditing = false }: TaskFormProps) => {
  const navigate = useNavigate();
  const { addTask, updateTask } = useTaskStore();
  const team = useTeamStore((state) => state.team);
  const fetchTeamMembers = useTeamStore((state) => state.fetchTeamMembers);
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchTeamMembers();
    }
  }, [fetchTeamMembers, user]);

  const [formData, setFormData] = useState({
    description: task?.description || "",
    deadline: task?.deadline
      ? new Date(task.deadline).toISOString().split("T")[0]
      : "",
    status: task?.status || "pending",
    assigneeId: task?.assignedTo || "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        description: task.description || "",
        deadline: task.deadline
          ? new Date(task.deadline).toISOString().split("T")[0]
          : "",
        status: task.status || "pending",
        assigneeId: task.assignedTo || "",
      });
    } else {
      setFormData({
        description: "",
        deadline: "",
        status: "pending",
        assigneeId: "",
      });
    }
  }, [task]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadlineDate < today && !isEditing) {
        newErrors.deadline = "Deadline cannot be in the past for new tasks";
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
      if (isEditing && task && task.taskId) {
        await updateTask(task.taskId, formData.status as Task["status"]);
        addNotification({
          type: "status_update",
          title: "Task Updated",
          message: `Task description: "${formData.description.substring(
            0,
            30
          )}..." has been updated.`,
        });
      } else {
        const taskCreationData: Pick<
          Task,
          "description" | "deadline" | "assignedTo"
        > = {
          description: formData.description,
          deadline: new Date(formData.deadline).toISOString(),
          assignedTo: formData.assigneeId,
        };
        await addTask(taskCreationData);
        addNotification({
          type: "task_assigned",
          title: "New Task Created",
          message: `Task description: "${formData.description.substring(
            0,
            30
          )}..." has been created.`,
        });
      }

      navigate("/tasks");
    } catch (error: unknown) {
      console.error("Error saving task:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      addNotification({
        type: "error",
        title: "Error Saving Task",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-gray-400">
                <FileText className="h-5 w-5" />
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter task description"
                value={formData.description}
                onChange={handleChange}
                className={`appearance-none block w-full pl-10 pt-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.description ? "border-red-300" : "border-gray-300"
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
              <label
                htmlFor="assigneeId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign To (User ID)
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
                  <option value="">Unassigned / Type User ID</option>
                  {team.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} (ID: {member.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isEditing && (
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                    <option value="New">New</option>
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
            onClick={() => navigate("/tasks")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
