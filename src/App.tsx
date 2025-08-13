import React, { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { SignUpPage } from "./components/SignUpPage";
import { ChatbotInterface } from "./components/ChatbotInterface";
import { ProfilePage } from "./components/ProfilePage";
import { StaffLayout } from "./components/StaffLayout";
import { ResidentDashboard } from "./components/ResidentDashboard";
import { ReportedIncidents } from "./components/ReportIncidents";
import { authAPI } from "./services/api";
import type { User, Page, StaffPage } from "./types";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page | StaffPage>("login");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on app load - BUT DON'T AUTO-LOGOUT ON FAILURE
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("user");

      console.log("Checking existing auth...");
      console.log("Token exists:", !!token);
      console.log("Saved user exists:", !!savedUser);

      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        console.log("Found saved user:", userData);

        // DON'T verify token with API call yet - just use saved data
        // This prevents automatic logout if backend is down
        setUser(userData);
        setCurrentPage(
          userData.role === "resident" ? "dashboard" : "staff-dashboard",
        );
        console.log("Restored user session from localStorage");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // DON'T clear auth data here - let user manually login if needed
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login with real API
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting login...");

      const { user: userData } = await authAPI.login(email, password);
      console.log("Login successful:", userData);

      setUser(userData);
      setCurrentPage(
        userData.role === "resident" ? "dashboard" : "staff-dashboard",
      );
    } catch (error) {
      console.error("Login failed:", error);
      alert(
        "Login failed. Please check your credentials and make sure the backend is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup with real API
  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      setIsLoading(true);
      await authAPI.register(name, email, password);
      setCurrentPage("login");
      alert("Registration successful! Please log in.");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await authAPI.logout();
      setUser(null);
      setCurrentPage("login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local state
      setUser(null);
      setCurrentPage("login");
    }
  };

  // Handle navigation for staff
  const handleStaffNavigate = (page: StaffPage) => {
    console.log("Staff navigating to:", page);
    setCurrentPage(page);
  };

  // Handle navigation for residents
  const handleResidentNavigate = (page: Page) => {
    console.log("Resident navigating to:", page);
    setCurrentPage(page);
  };

  // Show loading spinner during initial auth check ONLY
  if (isLoading && !user && currentPage === "login") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render current page
  const renderPage = () => {
    console.log("Rendering page:", currentPage, "User:", user?.name);

    // If no user and not on auth pages, show login
    if (!user && currentPage !== "login" && currentPage !== "signup") {
      return (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToSignUp={() => setCurrentPage("signup")}
          isLoading={isLoading}
        />
      );
    }

    // Staff pages
    if (user && (user.role === "staff" || user.role === "admin")) {
      return (
        <StaffLayout
          user={user}
          currentPage={currentPage as StaffPage}
          onNavigate={handleStaffNavigate}
          onLogout={handleLogout}
        />
      );
    }

    // Resident pages
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignUp={() => setCurrentPage("signup")}
            isLoading={isLoading}
          />
        );
      case "signup":
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onSwitchToLogin={() => setCurrentPage("login")}
            isLoading={isLoading}
          />
        );
      case "dashboard":
        return (
          <ResidentDashboard
            user={user!}
            onNavigate={handleResidentNavigate}
            onLogout={handleLogout}
          />
        );
      case "chatbot":
        return (
          <ChatbotInterface
            user={user!}
            onNavigate={handleResidentNavigate}
            onLogout={handleLogout}
          />
        );
      case "incidents":
        return (
          <ReportedIncidents
            user={user!}
            onNavigate={handleResidentNavigate}
            onLogout={handleLogout}
          />
        );
      case "profile":
        return (
          <ProfilePage
            user={user!}
            onNavigate={handleResidentNavigate}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignUp={() => setCurrentPage("signup")}
            isLoading={isLoading}
          />
        );
    }
  };

  return <div className="min-h-screen bg-slate-50">{renderPage()}</div>;
}
