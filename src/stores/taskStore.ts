import { create } from "zustand";
import { Task } from "../types/task";
import { useAuthStore } from "./authStore";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

interface TaskState {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  addTask: (
    taskData: Pick<Task, "description" | "deadline" | "assignedTo">
  ) => Promise<void>;
  updateTask: (taskId: string, status: Task["status"]) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  fetchTasks: async () => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Fetch tasks: User not authenticated or idToken missing");
      set({ tasks: [] });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Failed to fetch tasks: ${errorData.message || response.statusText}`
        );
      }
      const tasks: Task[] = await response.json();
      set({ tasks });
    } catch (error) {
      console.error("Fetch tasks failed:", error);
      set({ tasks: [] });
    }
  },

  getTaskById: (taskId: string) => {
    return get().tasks.find((task) => task.taskId === taskId);
  },

  addTask: async (
    taskData: Pick<Task, "description" | "deadline" | "assignedTo">
  ) => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Add task: User not authenticated or idToken missing");
      throw new Error("User not authenticated");
    }
    if (user.role !== "admin") {
      console.warn("Add task: Only admins can add tasks.");
      throw new Error("Only admins can add tasks.");
    }

    const payload = { ...taskData };

    try {
      const response = await fetch(`${API_BASE_URL}tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Failed to add task: ${errorData.message || response.statusText}`
        );
      }
      const newTask: Task = await response.json();
      set((state) => ({
        tasks: [...state.tasks, newTask],
      }));
    } catch (error) {
      console.error("Add task failed:", error);
      throw error;
    }
  },

  updateTask: async (taskId: string, status: Task["status"]) => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Update task: User not authenticated or idToken missing");
      throw new Error("User not authenticated");
    }

    const payload = { taskId, status };

    try {
      const response = await fetch(`${API_BASE_URL}tasks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Failed to update task: ${errorData.message || response.statusText}`
        );
      }
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.taskId === taskId
            ? { ...t, status, updatedAt: new Date().toISOString() }
            : t
        ),
      }));
    } catch (error) {
      console.error("Update task failed:", error);
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Delete task: User not authenticated or idToken missing");
      throw new Error("User not authenticated");
    }
    if (user.role !== "admin") {
      console.warn("Delete task: Only admins can delete tasks.");
      throw new Error("Only admins can delete tasks.");
    }
    // API Call for DELETE /tasks/${taskId} or /tasks with taskId in body needs to be implemented here
    console.warn(`Simulating delete for task ${taskId}. API call needed.`);
    // If API call is successful:
    set((state) => ({
      tasks: state.tasks.filter((task) => task.taskId !== taskId),
    }));
    // If API call fails, throw an error or handle appropriately
    // throw new Error('API delete failed');
  },
}));
