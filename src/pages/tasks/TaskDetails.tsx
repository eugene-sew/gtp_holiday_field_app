import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTaskStore } from "../../stores/taskStore";
import { useAuthStore } from "../../stores/authStore";
import { useTeamStore } from "../../stores/teamStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { format } from "date-fns";
import { Calendar, Edit, Trash2, Check, User } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Task } from "../../types/task";

const TaskDetails = () => {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, getTaskById, updateTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const team = useTeamStore((state) => state.team);
  const { addNotification } = useNotificationStore();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (taskId) {
      const taskData = getTaskById(taskId);
      if (taskData) {
        setTask(taskData);
      } else {
        addNotification({
          type: "error",
          title: "Task Not Found",
          message: `Task with ID ${taskId} could not be found.`,
        });
        navigate("/tasks");
      }
    }
    setLoading(false);
  }, [taskId, getTaskById, navigate, tasks, addNotification]);

  const assigneeUser = task?.assignedTo
    ? team.find((member) => member.id === task.assignedTo)
    : null;
  const assigneeName = assigneeUser ? assigneeUser.name : "Unassigned";

  if (loading || !task) {
    return <div className="p-4">Loading task details...</div>;
  }

  const isAdmin = user?.role === "admin";
  const isAssignee = user?.sub === task.assignedTo;
  const canEdit = isAdmin || isAssignee;
  const canDelete = isAdmin;

  const deadlineDate = new Date(task.deadline);
  const isOverdue = deadlineDate < new Date() && task.status !== "completed";

  const handleStatusChange = async (newStatus: Task["status"]) => {
    if (!task || !task.taskId) return;
    setIsUpdatingStatus(true);
    try {
      await updateTask(task.taskId, newStatus);
      setTask((prevTask) =>
        prevTask
          ? {
              ...prevTask,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : null
      );

      addNotification({
        type: "status_update",
        title: "Task Status Updated",
        message: `Task "${task.description.substring(
          0,
          30
        )}..." status changed to ${newStatus.replace("_", " ")}.`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      addNotification({
        type: "error",
        title: "Error Updating Status",
        message: "Could not update task status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !task.taskId) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTask(task.taskId);
      addNotification({
        type: "status_update",
        title: "Task Deleted",
        message: `Task "${task.description.substring(
          0,
          30
        )}..." has been deleted.`,
      });
      navigate("/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      addNotification({
        type: "error",
        title: "Error Deleting Task",
        message: "Could not delete task.",
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 line-clamp-2">
            Task: {task.description.substring(0, 50)}...
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Created by {task.createdBy} on{" "}
            {format(new Date(task.createdAt), "PPP")}
          </p>
        </div>
        <div className="flex space-x-3">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/tasks/${task.taskId}/edit`)}
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
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Task Description">
            <div className="prose max-w-none">
              <p>{task.description}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isOverdue
                        ? "bg-red-100 text-red-800"
                        : task.status === "New"
                        ? "bg-gray-100 text-gray-800"
                        : task.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {isOverdue
                      ? "Overdue"
                      : task.status === "New"
                      ? "New"
                      : task.status
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <Calendar className="h-5 w-5 text-gray-400 mr-1.5" />
                  {format(deadlineDate, "PPP")}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Assigned To
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <User className="h-5 w-5 text-gray-400 mr-1.5" />
                  {assigneeName}
                </div>
              </div>

              {canEdit && task.status !== "completed" && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Update Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.status !== "pending" && task.status !== "New" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange("pending")}
                        isLoading={isUpdatingStatus}
                      >
                        Mark as Pending
                      </Button>
                    )}
                    {task.status !== "in_progress" && (
                      <Button
                        size="sm"
                        variant={
                          task.status === "pending" || task.status === "New"
                            ? "primary"
                            : "outline"
                        }
                        onClick={() => handleStatusChange("in_progress")}
                        isLoading={isUpdatingStatus}
                      >
                        Start Working
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="success"
                      icon={<Check className="h-4 w-4" />}
                      onClick={() => handleStatusChange("completed")}
                      isLoading={isUpdatingStatus}
                    >
                      Complete
                    </Button>
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
