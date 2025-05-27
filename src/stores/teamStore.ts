import { create } from "zustand";
import { User } from "../types/user";
import { useAuthStore } from "./authStore";

const API_USERS_URL = import.meta.env.VITE_APP_API_BASE_URL + "users/";
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

interface TeamState {
  team: User[];
  fetchTeamMembers: () => Promise<void>;
  addTeamMember: (member: User) => Promise<void>;
  updateTeamMember: (member: User) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set) => ({
  team: [],

  fetchTeamMembers: async () => {
    const { user } = useAuthStore.getState();
    if (!user || !user.idToken) {
      console.error("Fetch team: User not authenticated or idToken missing");
      set({ team: [] });
      return;
    }

    if (user.role !== "admin") {
      console.warn("Fetch team: Only admins can fetch all users.");
      set({ team: [] });
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

      const transformedTeam: User[] = apiUsers.map((apiUser) => {
        let role: "admin" | "member" = "member";
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
      set({ team: [] });
    }
  },

  addTeamMember: async (member: User) => {
    console.warn(
      "addTeamMember is using local simulation and needs API integration."
    );
    set((state) => ({
      team: [...state.team, member],
    }));
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
    set((state) => ({
      team: state.team.filter((m) => m.id !== id),
    }));
  },
}));
