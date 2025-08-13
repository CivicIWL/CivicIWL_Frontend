import React from "react";
import {
  Home,
  FileText,
  Book,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { StaffDashboard } from "./StaffDashboard";
import { StaffIncidentsPage } from "./StaffIncidentsPage";
import { StaffKnowledgeBasePage } from "./StaffKnowledgeBasePage";
import { StaffUsersPage } from "./StaffUsersPage";
import { StaffSettingsPage } from "./StaffSettingsPage";

type User = {
  id: string;
  name: string;
  email: string;
  role: "resident" | "staff" | "admin";
};

type StaffPage =
  | "staff-dashboard"
  | "staff-incidents"
  | "staff-knowledge"
  | "staff-users"
  | "staff-settings";

interface StaffLayoutProps {
  user: User;
  currentPage: StaffPage;
  onNavigate: (page: StaffPage) => void;
  onLogout: () => void;
}

const navigation = [
  { id: "staff-dashboard" as StaffPage, label: "Dashboard", icon: Home },
  { id: "staff-incidents" as StaffPage, label: "Incidents", icon: FileText },
  { id: "staff-knowledge" as StaffPage, label: "Knowledge Base", icon: Book },
  { id: "staff-users" as StaffPage, label: "Users", icon: Users },
  { id: "staff-settings" as StaffPage, label: "Settings", icon: Settings },
];

export function StaffLayout({
  user,
  currentPage,
  onNavigate,
  onLogout,
}: StaffLayoutProps) {
  const renderPage = () => {
    switch (currentPage) {
      case "staff-dashboard":
        return <StaffDashboard user={user} />;
      case "staff-incidents":
        return <StaffIncidentsPage user={user} />;
      case "staff-knowledge":
        return <StaffKnowledgeBasePage user={user} />;
      case "staff-users":
        return <StaffUsersPage user={user} />;
      case "staff-settings":
        return <StaffSettingsPage user={user} />;
      default:
        return <StaffDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-[3rem] flex items-center justify-center">
              <span className="text-white font-medium text-sm">CN</span>
            </div>
            <div>
              <h2 className="font-medium text-slate-900">CivicNavigator</h2>
              <p className="text-xs text-slate-500">Staff Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
              <h1 className="font-medium text-slate-900 capitalize">
                {navigation.find((nav) => nav.id === currentPage)?.label ||
                  "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
              </Button>

              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user.role}
                  </p>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
