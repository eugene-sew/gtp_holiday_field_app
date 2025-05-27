import { create } from "zustand";
import { User } from "../types/user";
import { useAuthStore } from "./authStore";

// API endpoint for fetching users (team members).
const API_USERS_URL = import.meta.env.VITE_APP_API_BASE_URL + "users/";

/**
 * @interface ApiUser
 * Describes the shape of user data as returned by the backend API.
 * This is transformed into the local 'User' type.
 */
interface ApiUser {
  username: string;
  attributes: {
    email: string;
    email_verified: string;
    sub: string;
  };
  enabled: boolean;
  userStatus: string;
  groups: string[];
}

/**
 * @interface TeamState
 * Defines the shape of the team management state.
 */
interface TeamState {
  team: User[];
  fetchTeamMembers: () => Promise<void>;
  addTeamMember: (member: User) => Promise<void>;
  updateTeamMember: (member: User) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
}

/**
 * Zustand store for managing team members.
 * Fetches team members from the API (admin only) and transforms them into the local User type.
 * Provides placeholders for add, update, remove operations which currently only affect local state.
 */
export const useTeamStore = create<TeamState>((set) => ({
  team: [], // Initial state: empty array of team members.

  /**
   * Fetches all team members from the API.
   * This operation is restricted to admin users.
   * Transforms API user data into the frontend 'User' type.
   */
  fetchTeamMembers: async () => {
    const { user } = useAuthStore.getState(); // Get current authenticated user.
    if (!user || !user.idToken) {
      console.error("Fetch team: User not authenticated or idToken missing");
      set({ team: [] });
      return;
    }

    // Client-side check; backend also enforces this rule.
    if (user.role !== "admin") {
      console.warn(
        "Fetch team: Only admins can fetch all users. Current user role:",
        user.role
      );
      set({ team: [] }); // Non-admins get an empty team list.
      return;
    }

    try {
      const response = await fetch(API_USERS_URL, {
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
          `Failed to fetch team members: ${
            errorData.message || response.statusText
          }`
        );
      }

      const apiUsers: ApiUser[] = await response.json();

      // Transform API data to the local User type.
      const transformedTeam: User[] = apiUsers.map((apiUser) => {
        let role: "admin" | "member" = "member"; // Default role.
        if (apiUser.groups && apiUser.groups.includes("admin")) {
          role = "admin";
        } else if (apiUser.groups && apiUser.groups.includes("member")) {
          role = "member";
        }

        return {
          id: apiUser.attributes.sub,
          name: apiUser.username,
          email: apiUser.attributes.email,
          role: role,
        } as User;
      });

      set({ team: transformedTeam });
    } catch (error) {
      console.error("Fetch team members failed:", error);
      set({ team: [] }); // Clear team on error.
    }
  },

  // --- Placeholder/Simulated CRUD operations for team members ---
  // These currently only modify local state and log warnings.
  // Full API integration is required for these to be persistent.

  addTeamMember: async (member: User) => {
    console.warn(
      "addTeamMember is using local simulation and needs API integration."
    );
    set((state) => ({ team: [...state.team, member] }));
  },

  updateTeamMember: async (member: User) => {
    console.warn(
      "updateTeamMember is using local simulation and needs API integration."
    );
    set((state) => ({
      team: state.team.map((m) => (m.id === member.id ? member : m)),
    }));
  },

  removeTeamMember: async (id: string) => {
    console.warn(
      "removeTeamMember is using local simulation and needs API integration."
    );
    set((state) => ({ team: state.team.filter((m) => m.id !== id) }));
  },
}));
