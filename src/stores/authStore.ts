/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { User } from "../types/user";
import { jwtDecode } from "jwt-decode";
import {
  CognitoUserPool,
  // CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser as CognitoIdentityUser,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: import.meta.env.VITE_APP_AUTH_USER_POOL_ID,
  ClientId: import.meta.env.VITE_APP_AUTH_USER_POOL_WEB_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  fetchUserAttributes: (
    cognitoUser: CognitoIdentityUser
  ) => Promise<Pick<User, "id" | "name" | "email" | "sub"> | null>;
}

// Helper function to extract role from ID token
const getRoleFromIdToken = (
  idToken: string
): "admin" | "member" | undefined => {
  try {
    const decodedToken = jwtDecode<{
      "cognito:groups"?: string[];
      sub?: string;
    }>(idToken);
    console.log("decodedToken", decodedToken);
    const groups = decodedToken["cognito:groups"];
    if (groups) {
      if (groups.includes("admin")) {
        return "admin";
      } else if (groups.includes("member")) {
        return "member";
      }
    }
  } catch (error) {
    console.error("Error decoding token or extracting groups:", error);
  }
  return undefined;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const cognitoIdentityUser = new CognitoIdentityUser({
      Username: email,
      Pool: userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoIdentityUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          const otherAttributes = await get().fetchUserAttributes(
            cognitoIdentityUser
          );
          const idToken = session.getIdToken().getJwtToken();
          const role = getRoleFromIdToken(idToken);

          if (otherAttributes && role) {
            const userWithRole: User = {
              ...otherAttributes,
              role: role,
              idToken: idToken,
            };
            set({ user: userWithRole, isAuthenticated: true });
            localStorage.setItem("user", JSON.stringify(userWithRole));
            resolve();
          } else if (otherAttributes) {
            console.log(otherAttributes);
            console.warn(
              "Login successful, fetched attributes, but role could not be determined from ID token."
            );
            const userWithoutRole: User = {
              ...otherAttributes,
              role: "member",
              idToken: idToken,
            };
            set({ user: userWithoutRole, isAuthenticated: true });
            localStorage.setItem("user", JSON.stringify(userWithoutRole));
            resolve();
          } else {
            console.error(
              "Login successful, but failed to fetch user attributes or determine role."
            );
            set({ user: null, isAuthenticated: false });
            reject(
              new Error(
                "Failed to fetch user attributes or determine role after login."
              )
            );
          }
        },
        onFailure: (err) => {
          console.error("Login failed:", err);
          set({ user: null, isAuthenticated: false });
          reject(err);
        },
      });
    });
  },

  logout: async () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  updateUser: async (user: User) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
      console.warn(
        "updateUser is primarily updating local state and localStorage. Cognito attributes should be updated via Cognito SDK."
      );
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    }
  },

  checkAuth: async () => {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser != null) {
        cognitoUser.getSession(
          async (err: Error | null, session: CognitoUserSession | null) => {
            if (err) {
              console.error("Session check failed:", err);
              localStorage.removeItem("user");
              set({ user: null, isAuthenticated: false });
              resolve(false);
              return;
            }
            if (session && session.isValid()) {
              const otherAttributes = await get().fetchUserAttributes(
                cognitoUser
              );

              const idToken = session.getIdToken().getJwtToken();
              const role = getRoleFromIdToken(idToken);

              if (otherAttributes && role) {
                const userWithRole: User = {
                  ...otherAttributes,
                  role: role,
                  idToken: idToken,
                };
                set({ user: userWithRole, isAuthenticated: true });
                localStorage.setItem("user", JSON.stringify(userWithRole));
                resolve(true);
              } else if (otherAttributes) {
                console.warn(
                  "Session valid, fetched attributes, but role could not be determined from ID token."
                );
                const userWithoutRole: User = {
                  ...otherAttributes,
                  role: "member",
                  idToken: idToken,
                };
                set({ user: userWithoutRole, isAuthenticated: true });
                localStorage.setItem("user", JSON.stringify(userWithoutRole));
                resolve(true);
              } else {
                console.error(
                  "Session valid, but failed to fetch user attributes or determine role."
                );
                set({ user: null, isAuthenticated: false });
                localStorage.removeItem("user");
                resolve(false);
              }
            } else {
              console.log("Session is not valid or does not exist");
              localStorage.removeItem("user");
              set({ user: null, isAuthenticated: false });
              resolve(false);
            }
          }
        );
      } else {
        console.log("No current user in Cognito pool");
        localStorage.removeItem("user");
        set({ user: null, isAuthenticated: false });
        resolve(false);
      }
    });
  },

  fetchUserAttributes: async (
    cognitoUser: CognitoIdentityUser
  ): Promise<Pick<User, "id" | "name" | "email" | "sub"> | null> => {
    return new Promise((resolve, reject) => {
      cognitoUser.getSession(
        (err: Error | null, session: CognitoUserSession | null) => {
          if (err) {
            console.error("Error getting session:", err);
            return reject(err);
          }
          if (!session || !session.isValid()) {
            console.error("Session is not valid or does not exist");
            return reject(new Error("Session is not valid or does not exist"));
          }
          const idToken = session.getIdToken().getJwtToken();
          let subFromToken: string | undefined;
          try {
            const decodedToken = jwtDecode<{ sub?: string }>(idToken);
            subFromToken = decodedToken.sub;
          } catch (error) {
            console.error("Error decoding ID token:", error);
            // Proceed without sub if decoding fails, or handle as critical error
          }

          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error("Failed to get user attributes:", err);
              reject(err);
              return;
            }

            if (attributes) {
              const user: Partial<Pick<User, "id" | "name" | "email" | "sub">> =
                {
                  id: cognitoUser.getUsername(),
                  sub: subFromToken,
                };
              attributes.forEach((attr) => {
                if (attr.Name === "email") user.email = attr.Value;
                if (attr.Name === "name") user.name = attr.Value;
              });
              resolve(user as Pick<User, "id" | "name" | "email" | "sub">);
            } else {
              resolve(null);
            }
          });
        }
      );
    });
  },
}));

// function getAttributeValue(attributes: CognitoUserAttribute[] | undefined, attributeName: string): string | undefined {
//   if (!attributes) return undefined;
//   const attribute = attributes.find(attr => attr.getName() === attributeName);
//   return attribute ? attribute.getValue() : undefined;
// }
