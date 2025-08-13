import axios from "axios";
import type {
  User,
  ChatMessage,
  ChatSession,
  Incident,
  KBArticle,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AI_API_URL =
  import.meta.env.VITE_AI_API_URL || "http://localhost:5000/ai";

console.log("🚀 API Configuration:", { API_BASE_URL, AI_API_URL });

// Create axios instances
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

const aiApi = axios.create({
  baseURL: AI_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 second timeout for AI responses
});

// Enhanced request interceptor with better logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const timestamp = new Date().toISOString();

    console.log(`📤 [${timestamp}] API Request:`, {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      data: config.data ? "Present" : "None",
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] API Success:`, {
      url: response.config.url,
      status: response.status,
      dataSize: JSON.stringify(response.data).length,
    });
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] API Error:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    // Handle different error types
    if (error.response?.status === 401) {
      console.warn("🔐 Unauthorized - Clearing auth and redirecting");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 429) {
      console.warn("⏱️ Rate limit exceeded");
      throw new Error("Too many requests. Please wait a moment and try again.");
    } else if (error.response?.status >= 500) {
      console.error("🔥 Server error detected");
      throw new Error("Server is experiencing issues. Please try again later.");
    } else if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timeout");
      throw new Error(
        "Request timed out. Please check your connection and try again.",
      );
    }

    return Promise.reject(error);
  },
);

// Apply same interceptors to AI API
aiApi.interceptors.request.use(api.interceptors.request.handlers[0].fulfilled);
aiApi.interceptors.response.use(
  api.interceptors.response.handlers[0].fulfilled,
  api.interceptors.response.handlers[0].rejected,
);

// Enhanced Auth API with better error handling
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login for:", email);
      const response = await api.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user, expiresIn } = response.data;

      // Store auth data with expiration
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (expiresIn) {
        const expirationTime = Date.now() + expiresIn * 1000;
        localStorage.setItem("tokenExpiration", expirationTime.toString());
      }

      console.log("✅ Login successful for user:", user.name);
      return { token, user };
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      throw new Error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    }
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: string = "resident",
  ) => {
    try {
      console.log("📝 Attempting registration for:", email);
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });

      console.log("✅ Registration successful");
      return response.data;
    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      throw new Error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  },

  logout: async () => {
    try {
      console.log("👋 Logging out user");

      // Call logout endpoint if available
      try {
        await api.post("/auth/logout");
      } catch (logoutError) {
        console.warn("Logout endpoint not available or failed:", logoutError);
      }

      // Clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiration");

      console.log("✅ Logout completed");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Still clear local storage even if API call fails
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiration");
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      console.log("👤 Fetching user profile");
      const response = await api.get("/auth/profile");

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error("❌ Profile fetch failed:", error);
      throw new Error("Failed to load profile. Please refresh and try again.");
    }
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    try {
      console.log("✏️ Updating profile");
      const response = await api.put("/auth/profile", updates);

      localStorage.setItem("user", JSON.stringify(response.data));
      console.log("✅ Profile updated successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Profile update failed:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile.",
      );
    }
  },

  resetPassword: async (email: string) => {
    try {
      console.log("🔑 Requesting password reset for:", email);
      const response = await api.post("/auth/reset-password", {
        email: email.toLowerCase().trim(),
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Password reset failed:", error);
      throw new Error(
        error.response?.data?.message || "Password reset failed.",
      );
    }
  },

  // Check if token is still valid
  isTokenValid: (): boolean => {
    const token = localStorage.getItem("authToken");
    const expiration = localStorage.getItem("tokenExpiration");

    if (!token) return false;
    if (!expiration) return true; // No expiration set, assume valid

    return Date.now() < parseInt(expiration);
  },
};

// Enhanced Users API matching your backend
export const usersAPI = {
  // Get all users (staff/admin only)
  getAll: async (params: any = {}) => {
    try {
      console.log("👥 Fetching users with params:", params);

      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.search && { search: params.search }),
        ...(params.role && { role: params.role }),
        ...(params.status && { status: params.status }),
      };

      const response = await api.get("/users", { params: queryParams });

      console.log("✅ Users fetched:", response.data);

      return {
        users: response.data.users || response.data,
        pagination: response.data.pagination || {
          current: 1,
          pages: 1,
          total: response.data.users?.length || 0,
        },
      };
    } catch (error: any) {
      console.error("❌ Users fetch failed:", error);
      throw new Error(error.response?.data?.error || "Failed to load users.");
    }
  },

  // Create new staff user (admin only)
  createUser: async (userData: any) => {
    try {
      console.log("👤 Creating new user:", userData.name);

      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        permissions: userData.permissions || [],
      };

      const response = await api.post("/users", payload);
      console.log("✅ User created successfully:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ User creation failed:", error);

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err: any) => err.msg)
          .join(", ");
        throw new Error(`Validation failed: ${validationErrors}`);
      }

      throw new Error(error.response?.data?.error || "Failed to create user.");
    }
  },

  // Update user (admin only)
  updateUser: async (userId: string, updates: any) => {
    try {
      console.log("✏️ Updating user:", userId);

      const payload = {
        name: updates.name,
        role: updates.role,
        isActive: updates.isActive,
        permissions: updates.permissions || [],
      };

      const response = await api.put(`/users/${userId}`, payload);
      console.log("✅ User updated successfully");

      return response.data;
    } catch (error: any) {
      console.error("❌ User update failed:", error);

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err: any) => err.msg)
          .join(", ");
        throw new Error(`Validation failed: ${validationErrors}`);
      }

      throw new Error(error.response?.data?.error || "Failed to update user.");
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId: string) => {
    try {
      console.log("🗑️ Deleting user:", userId);
      const response = await api.delete(`/users/${userId}`);
      console.log("✅ User deleted successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ User deletion failed:", error);
      throw new Error(error.response?.data?.error || "Failed to delete user.");
    }
  },

  // Get single user by ID (staff/admin only)
  getById: async (userId: string) => {
    try {
      console.log("👤 Fetching user:", userId);
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ User fetch failed:", error);
      throw new Error("User not found or failed to load.");
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await api.get("/users/stats");
      return response.data;
    } catch (error: any) {
      console.error("❌ User stats failed:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        residents: 0,
        staff: 0,
        admins: 0,
        recentRegistrations: 0,
      };
    }
  },

  // Bulk update users (admin only)
  bulkUpdate: async (userIds: string[], updates: any) => {
    try {
      console.log("🔄 Bulk updating users:", userIds.length);
      const response = await api.patch("/users/bulk", {
        userIds,
        updates,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Bulk update failed:", error);
      throw new Error(error.response?.data?.error || "Failed to update users.");
    }
  },

  // Export users data (admin only)
  exportUsers: async (params: any = {}) => {
    try {
      console.log("📊 Exporting users data");
      const response = await api.get("/users/export", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      console.error("❌ User export failed:", error);
      throw new Error("Failed to export users data.");
    }
  },
};

// Enhanced Chat API with typing indicators and better error handling
export const chatAPI = {
  sendMessage: async (message: string, sessionId?: string) => {
    try {
      console.log(
        "💬 Sending message:",
        message.substring(0, 50) + "...",
        "Session:",
        sessionId,
      );

      const payload = {
        message: message.trim(),
        sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        locale: navigator.language || "en-KE",
      };

      const response = await aiApi.post("/chat/message", payload);

      console.log(
        "✅ Message sent successfully, response length:",
        response.data.message?.content?.length,
      );
      return {
        message: {
          id: response.data.message.id,
          content: response.data.message.content,
          timestamp: response.data.message.timestamp,
          citations: response.data.message.citations || [],
          confidence: response.data.message.confidence || 0.8,
        },
        sessionId: response.data.sessionId,
        suggestions: response.data.suggestions || [],
      };
    } catch (error: any) {
      console.error("❌ Message send failed:", error);

      if (error.response?.status === 429) {
        throw new Error(
          "🚫 Too many messages. Please wait a moment before sending another message.",
        );
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "⏰ Response took too long. The AI might be processing - please wait a moment.",
        );
      }

      throw new Error("Failed to send message. Please try again.");
    }
  },

  getSessions: async (): Promise<ChatSession[]> => {
    try {
      console.log("📚 Fetching chat sessions");
      const response = await api.get("/chat/sessions", {
        params: {
          limit: 50,
          orderBy: "lastUpdated",
          order: "desc",
        },
      });

      console.log("✅ Sessions loaded:", response.data.length);
      return response.data.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages:
          session.messages?.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })) || [],
      }));
    } catch (error: any) {
      console.error("❌ Sessions fetch failed:", error);
      throw new Error(
        "Failed to load chat history. Please refresh and try again.",
      );
    }
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    try {
      console.log("📖 Fetching session:", sessionId);
      const response = await api.get(`/chat/sessions/${sessionId}`);

      return {
        ...response.data,
        timestamp: new Date(response.data.timestamp),
        messages:
          response.data.messages?.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })) || [],
      };
    } catch (error: any) {
      console.error("❌ Session fetch failed:", error);
      throw new Error("Failed to load conversation. Please try again.");
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      console.log("🗑️ Deleting session:", sessionId);
      const response = await api.delete(`/chat/sessions/${sessionId}`);
      console.log("✅ Session deleted successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Session deletion failed:", error);
      throw new Error("Failed to delete conversation. Please try again.");
    }
  },

  updateSessionTitle: async (sessionId: string, title: string) => {
    try {
      console.log("✏️ Updating session title:", sessionId);
      const response = await api.patch(`/chat/sessions/${sessionId}`, {
        title: title.trim().substring(0, 100),
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Session title update failed:", error);
      throw new Error("Failed to update conversation title.");
    }
  },

  // Get chat analytics/stats
  getStats: async () => {
    try {
      const response = await api.get("/chat/stats");
      return response.data;
    } catch (error: any) {
      console.error("❌ Stats fetch failed:", error);
      return { totalSessions: 0, totalMessages: 0, avgResponseTime: 0 };
    }
  },
};

// Enhanced Incidents API with real endpoints matching your backend
export const incidentsAPI = {
  create: async (incidentData: any) => {
    try {
      console.log("📝 Creating new incident:", incidentData.title);

      // Match your backend schema exactly
      const payload = {
        title: incidentData.title,
        description: incidentData.description,
        category: incidentData.category,
        location: incidentData.location,
        contactInfo: incidentData.contactInfo || {
          email:
            incidentData.email ||
            (localStorage.getItem("user")
              ? JSON.parse(localStorage.getItem("user")!).email
              : null),
        },
        priority: incidentData.priority || "MEDIUM",
        coordinates: incidentData.coordinates || null,
      };

      const response = await api.post("/incidents", payload);
      console.log("✅ Incident created successfully:", response.data);

      return {
        ...response.data.incident,
        incidentId:
          response.data.incident.incidentId ||
          `INC-${response.data.incident.id?.slice(-6)?.toUpperCase()}`,
      };
    } catch (error: any) {
      console.error("❌ Incident creation failed:", error);

      // Enhanced error handling for your backend validation
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err: any) => err.msg)
          .join(", ");
        throw new Error(`Validation failed: ${validationErrors}`);
      }

      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to submit incident report.",
      );
    }
  },

  getAll: async (params: any = {}) => {
    try {
      console.log("📋 Fetching incidents with params:", params);

      // Match your backend query parameters
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.category && { category: params.category }),
        ...(params.status && { status: params.status }),
        ...(params.priority && { priority: params.priority }),
        ...(params.assigned && { assigned: params.assigned }),
      };

      const response = await api.get("/incidents", { params: queryParams });

      console.log("✅ Incidents fetched:", response.data);

      // Handle your backend response format
      return {
        incidents: response.data.incidents || response.data,
        total: response.data.pagination?.total || response.data.length,
        currentPage: response.data.pagination?.current || 1,
        totalPages: response.data.pagination?.pages || 1,
      };
    } catch (error: any) {
      console.error("❌ Incidents fetch failed:", error);
      throw new Error(
        error.response?.data?.error || "Failed to load incidents.",
      );
    }
  },

  getById: async (incidentId: string) => {
    try {
      console.log("🔍 Fetching incident:", incidentId);

      // Handle both formats: INC-123456 and raw MongoDB ObjectId
      const cleanId = incidentId.replace("INC-", "");

      const response = await api.get(`/incidents/${cleanId}`);

      return {
        ...response.data,
        id: response.data.id || response.data._id,
        incidentId:
          response.data.incidentId ||
          `INC-${(response.data.id || response.data._id).slice(-6).toUpperCase()}`,
        submittedOn: response.data.createdAt || response.data.submittedOn,
        lastUpdated: response.data.updatedAt || response.data.lastUpdated,
      };
    } catch (error: any) {
      console.error("❌ Incident fetch failed:", error);
      throw new Error("Incident not found or failed to load.");
    }
  },

  updateStatus: async (
    incidentId: string,
    status: string,
    notes?: string,
    assignedTo?: string,
  ) => {
    try {
      console.log("🔄 Updating incident status:", incidentId, status);

      const payload = {
        status,
        ...(notes && { notes }),
        ...(assignedTo && { assignedTo }),
      };

      const response = await api.put(
        `/incidents/${incidentId}/status`,
        payload,
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Status update failed:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update incident status.",
      );
    }
  },

  checkStatus: async (incidentId: string) => {
    try {
      console.log("📊 Checking public status for:", incidentId);

      // Use the public status endpoint from your backend
      const cleanId = incidentId.replace("INC-", "");
      const response = await fetch(
        `${API_BASE_URL}/incidents/status/${cleanId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Incident not found");
      }

      const data = await response.json();
      return {
        ...data,
        incidentId: `INC-${data.id.slice(-6).toUpperCase()}`,
      };
    } catch (error: any) {
      console.error("❌ Status check failed:", error);
      throw new Error("Incident not found. Please check your reference ID.");
    }
  },

  addComment: async (incidentId: string, comment: string) => {
    try {
      console.log("💬 Adding comment to incident:", incidentId);
      const response = await api.post(`/incidents/${incidentId}/comments`, {
        content: comment.trim(),
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Comment addition failed:", error);
      throw new Error("Failed to add comment.");
    }
  },

  // Get incidents stats for dashboard
  getStats: async (timeframe = "30d") => {
    try {
      const response = await api.get("/incidents/stats", {
        params: { timeframe },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Incident stats failed:", error);
      return {
        total: 0,
        byStatus: { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 },
        byCategory: {},
        byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      };
    }
  },

  // Search with advanced filters
  search: async (query: string, filters: any = {}) => {
    try {
      console.log("🔍 Searching incidents:", query);
      const response = await api.get("/incidents", {
        params: {
          search: query.trim(),
          ...filters,
          limit: 50, // Higher limit for search results
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Incident search failed:", error);
      throw new Error("Search failed. Please try again.");
    }
  },
};

// Kenya-specific government services API
export const kenyaServicesAPI = {
  // IEBC Services
  iebc: {
    checkVoterStatus: async (idNumber: string) => {
      try {
        console.log("🗳️ Checking voter status");
        const response = await api.get(`/kenya/iebc/voter-status/${idNumber}`);
        return response.data;
      } catch (error: any) {
        console.error("❌ IEBC voter check failed:", error);
        throw new Error("Failed to check voter status. Please try again.");
      }
    },

    getPollingStations: async (constituency: string) => {
      try {
        const response = await api.get(`/kenya/iebc/polling-stations`, {
          params: { constituency },
        });
        return response.data;
      } catch (error: any) {
        console.error("❌ Polling stations fetch failed:", error);
        throw new Error("Failed to load polling stations.");
      }
    },

    getRegistrationCenters: async (county: string) => {
      try {
        const response = await api.get(`/kenya/iebc/registration-centers`, {
          params: { county },
        });
        return response.data;
      } catch (error: any) {
        console.error("❌ Registration centers fetch failed:", error);
        return [];
      }
    },
  },

  // County Services
  county: {
    getServices: async (countyCode: string) => {
      try {
        console.log("🏛️ Fetching county services for:", countyCode);
        const response = await api.get(`/kenya/county/${countyCode}/services`);
        return response.data;
      } catch (error: any) {
        console.error("❌ County services fetch failed:", error);
        return [];
      }
    },

    checkPropertyRates: async (propertyId: string, county: string) => {
      try {
        const response = await api.get(
          `/kenya/county/${county}/property-rates/${propertyId}`,
        );
        return response.data;
      } catch (error: any) {
        console.error("❌ Property rates check failed:", error);
        throw new Error("Failed to check property rates.");
      }
    },

    submitPermitApplication: async (permitData: any, county: string) => {
      try {
        console.log("🏗️ Submitting permit application");
        const response = await api.post(
          `/kenya/county/${county}/permits`,
          permitData,
        );
        return response.data;
      } catch (error: any) {
        console.error("❌ Permit application failed:", error);
        throw new Error("Failed to submit permit application.");
      }
    },
  },

  // NTSA Services
  ntsa: {
    checkVehicleStatus: async (plateNumber: string) => {
      try {
        const response = await api.get(`/kenya/ntsa/vehicle/${plateNumber}`);
        return response.data;
      } catch (error: any) {
        console.error("❌ Vehicle status check failed:", error);
        throw new Error("Failed to check vehicle status.");
      }
    },

    getDrivingLicenseInfo: async () => {
      try {
        const response = await api.get("/kenya/ntsa/driving-license-info");
        return response.data;
      } catch (error: any) {
        console.error("❌ License info fetch failed:", error);
        return null;
      }
    },
  },
};

// Enhanced Knowledge Base API matching your backend
export const kbAPI = {
  // Search public knowledge base (no auth required)
  search: async (query: string, category?: string, limit = 10) => {
    try {
      console.log("🔍 Searching knowledge base:", query);
      const response = await api.get("/kb/search", {
        params: {
          q: query.trim(),
          category,
          limit,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ KB search failed:", error);
      return { query, results: [] };
    }
  },

  // Get all articles (staff only)
  getArticles: async (params: any = {}) => {
    try {
      console.log("📚 Fetching KB articles with params:", params);

      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.category && { category: params.category }),
      };

      const response = await api.get("/kb/articles", { params: queryParams });

      console.log("✅ KB articles fetched:", response.data);

      return {
        articles: response.data.articles || response.data,
        pagination: response.data.pagination || {
          current: 1,
          pages: 1,
          total: response.data.articles?.length || 0,
        },
      };
    } catch (error: any) {
      console.error("❌ KB articles fetch failed:", error);
      throw new Error(
        error.response?.data?.error || "Failed to load articles.",
      );
    }
  },

  // Create new article (staff only)
  createArticle: async (articleData: any) => {
    try {
      console.log("📝 Creating KB article:", articleData.title);

      const payload = {
        title: articleData.title,
        content: articleData.content,
        category: articleData.category,
        tags: articleData.tags || [],
        sourceUrl: articleData.sourceUrl,
        status: articleData.status || "draft",
      };

      const response = await api.post("/kb/articles", payload);
      console.log("✅ KB article created successfully:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ KB article creation failed:", error);

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err: any) => err.msg)
          .join(", ");
        throw new Error(`Validation failed: ${validationErrors}`);
      }

      throw new Error(
        error.response?.data?.error || "Failed to create article.",
      );
    }
  },

  // Update article (staff only)
  updateArticle: async (articleId: string, updates: any) => {
    try {
      console.log("✏️ Updating KB article:", articleId);

      const payload = {
        title: updates.title,
        content: updates.content,
        category: updates.category,
        tags: updates.tags || [],
        sourceUrl: updates.sourceUrl,
        status: updates.status,
      };

      const response = await api.put(`/kb/articles/${articleId}`, payload);
      console.log("✅ KB article updated successfully");

      return response.data;
    } catch (error: any) {
      console.error("❌ KB article update failed:", error);

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err: any) => err.msg)
          .join(", ");
        throw new Error(`Validation failed: ${validationErrors}`);
      }

      throw new Error(
        error.response?.data?.error || "Failed to update article.",
      );
    }
  },

  // Delete article (staff only)
  deleteArticle: async (articleId: string) => {
    try {
      console.log("🗑️ Deleting KB article:", articleId);
      const response = await api.delete(`/kb/articles/${articleId}`);
      console.log("✅ KB article deleted successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ KB article deletion failed:", error);
      throw new Error(
        error.response?.data?.error || "Failed to delete article.",
      );
    }
  },

  // Get single article by ID
  getArticle: async (articleId: string) => {
    try {
      console.log("📖 Fetching KB article:", articleId);
      const response = await api.get(`/kb/articles/${articleId}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ KB article fetch failed:", error);
      throw new Error("Article not found or failed to load.");
    }
  },

  // Get popular articles (public)
  getPopularArticles: async (limit = 5) => {
    try {
      const response = await api.get("/kb/popular", { params: { limit } });
      return response.data;
    } catch (error: any) {
      console.error("❌ Popular articles fetch failed:", error);
      return [];
    }
  },

  // Reindex knowledge base (admin only)
  reindexKnowledgeBase: async () => {
    try {
      console.log("🔄 Reindexing knowledge base");
      const response = await api.post("/kb/reindex");
      console.log("✅ Knowledge base reindexed successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ KB reindex failed:", error);
      throw new Error(
        error.response?.data?.error || "Failed to reindex knowledge base.",
      );
    }
  },

  // Get KB statistics
  getStats: async () => {
    try {
      const response = await api.get("/kb/stats");
      return response.data;
    } catch (error: any) {
      console.error("❌ KB stats failed:", error);
      return {
        totalArticles: 0,
        totalViews: 0,
        publishedArticles: 0,
        draftArticles: 0,
        categoryCounts: {},
      };
    }
  },
};

// Analytics API for admin users
export const analyticsAPI = {
  getChatMetrics: async (timeframe = "7d") => {
    try {
      const response = await api.get("/analytics/chat", {
        params: { timeframe },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Chat metrics failed:", error);
      return null;
    }
  },

  getIncidentMetrics: async (timeframe = "30d") => {
    try {
      const response = await api.get("/analytics/incidents", {
        params: { timeframe },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Incident metrics failed:", error);
      return null;
    }
  },

  getUserActivity: async (userId?: string) => {
    try {
      const response = await api.get("/analytics/user-activity", {
        params: userId ? { userId } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ User activity fetch failed:", error);
      return null;
    }
  },

  // Get system-wide metrics (admin only)
  getSystemMetrics: async () => {
    try {
      const response = await api.get("/analytics/system");
      return response.data;
    } catch (error: any) {
      console.error("❌ System metrics failed:", error);
      return {
        totalUsers: 0,
        totalIncidents: 0,
        totalChatSessions: 0,
        systemUptime: 0,
        responseTime: 0,
      };
    }
  },

  // Export analytics data (admin only)
  exportAnalytics: async (type: string, timeframe = "30d") => {
    try {
      console.log("📊 Exporting analytics data:", type);
      const response = await api.get(`/analytics/export/${type}`, {
        params: { timeframe },
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type}-analytics-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      console.error("❌ Analytics export failed:", error);
      throw new Error("Failed to export analytics data.");
    }
  },
};

// Utility functions
export const apiUtils = {
  // Test all API endpoints
  healthCheck: async () => {
    try {
      console.log("🏥 Running health check...");
      const results = await Promise.allSettled([
        api.get("/health"),
        aiApi.get("/health"),
        api.get("/auth/health"),
        aiApi.get("/ai/health"),
      ]);

      const status = {
        mainAPI: results[0].status === "fulfilled",
        aiAPI: results[1].status === "fulfilled",
        authAPI: results[2].status === "fulfilled",
        aiHealthAPI: results[3].status === "fulfilled",
      };

      console.log("🏥 Health check results:", status);
      return status;
    } catch (error: any) {
      console.error("❌ Health check failed:", error);
      return {
        mainAPI: false,
        aiAPI: false,
        authAPI: false,
        aiHealthAPI: false,
      };
    }
  },

  // Get API configuration info
  getConfig: () => ({
    baseURL: API_BASE_URL,
    aiURL: AI_API_URL,
    hasToken: !!localStorage.getItem("authToken"),
    tokenValid: authAPI.isTokenValid(),
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null,
  }),

  // Retry failed requests
  retryRequest: async (
    requestFn: () => Promise<any>,
    maxRetries = 3,
    delay = 1000,
  ) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  },

  // Clear all cached data
  clearCache: () => {
    console.log("🧹 Clearing API cache and local storage");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("chatCache");
    localStorage.removeItem("incidentCache");
  },

  // Check network connectivity
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "HEAD",
        cache: "no-cache",
        timeout: 5000,
      } as RequestInit);
      return response.ok;
    } catch (error) {
      console.warn("🌐 Network connectivity check failed:", error);
      return false;
    }
  },

  // Format API errors for user display
  formatError: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  },

  // Validate API response structure
  validateResponse: (response: any, expectedFields: string[]): boolean => {
    try {
      return expectedFields.every(
        (field) => response.data && response.data.hasOwnProperty(field),
      );
    } catch (error) {
      console.error("❌ Response validation failed:", error);
      return false;
    }
  },

  // Batch API requests with rate limiting
  batchRequests: async (
    requests: (() => Promise<any>)[],
    batchSize = 5,
    delay = 100,
  ) => {
    const results = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((request) => request()),
      );
      results.push(...batchResults);

      // Add delay between batches to prevent rate limiting
      if (i + batchSize < requests.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results;
  },

  // Calculate request performance metrics
  measurePerformance: async (requestFn: () => Promise<any>) => {
    const startTime = performance.now();
    try {
      const result = await requestFn();
      const endTime = performance.now();
      return {
        success: true,
        duration: endTime - startTime,
        result,
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        duration: endTime - startTime,
        error,
      };
    }
  },

  // Generate unique request ID for tracing
  generateRequestId: (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Cache management utilities
  cache: {
    set: (key: string, value: any, ttl = 3600000) => {
      // Default 1 hour TTL
      const item = {
        value,
        expires: Date.now() + ttl,
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    },

    get: (key: string) => {
      try {
        const item = localStorage.getItem(`cache_${key}`);
        if (!item) return null;

        const parsed = JSON.parse(item);
        if (Date.now() > parsed.expires) {
          localStorage.removeItem(`cache_${key}`);
          return null;
        }

        return parsed.value;
      } catch (error) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
    },

    remove: (key: string) => {
      localStorage.removeItem(`cache_${key}`);
    },

    clear: () => {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("cache_")) {
          localStorage.removeItem(key);
        }
      });
    },
  },
};

// Request queue for offline support
export const requestQueue = {
  queue: [] as any[],

  add: (request: any) => {
    requestQueue.queue.push({
      ...request,
      id: apiUtils.generateRequestId(),
      timestamp: Date.now(),
    });
    localStorage.setItem("requestQueue", JSON.stringify(requestQueue.queue));
  },

  process: async () => {
    if (requestQueue.queue.length === 0) return;

    const isOnline = await apiUtils.checkConnection();
    if (!isOnline) return;

    const processedRequests = [];

    for (const request of requestQueue.queue) {
      try {
        await request.fn();
        processedRequests.push(request.id);
        console.log("✅ Processed queued request:", request.id);
      } catch (error) {
        console.error(
          "❌ Failed to process queued request:",
          request.id,
          error,
        );
        // Keep failed requests in queue for retry
      }
    }

    // Remove processed requests
    requestQueue.queue = requestQueue.queue.filter(
      (req) => !processedRequests.includes(req.id),
    );
    localStorage.setItem("requestQueue", JSON.stringify(requestQueue.queue));
  },

  clear: () => {
    requestQueue.queue = [];
    localStorage.removeItem("requestQueue");
  },

  // Load queue from localStorage on app start
  load: () => {
    try {
      const stored = localStorage.getItem("requestQueue");
      if (stored) {
        requestQueue.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("❌ Failed to load request queue:", error);
      requestQueue.clear();
    }
  },
};

// Initialize request queue on module load
requestQueue.load();

// Auto-process queue when network is available
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("🌐 Network restored, processing queued requests...");
    requestQueue.process();
  });
}

// Export main API instance and utilities
export { api, aiApi };
