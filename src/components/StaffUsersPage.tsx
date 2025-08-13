import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  MoreHorizontal,
  Shield,
  User,
  Grid,
  List,
  UserPlus,
  Crown,
  RefreshCw,
  Loader2,
  UserX,
  Ban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { usersAPI } from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "resident" | "staff" | "admin";
};

interface StaffUsersPageProps {
  user: User;
}

type UserData = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "resident" | "staff" | "admin";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lastActive?: string;
  phone?: string;
  address?: string;
  permissions?: string[];
  profileCompleted?: boolean;
};

type UserStats = {
  totalUsers: number;
  residents: number;
  staff: number;
  activeUsers: number;
  inactiveUsers: number;
};

type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  role: "staff" | "admin";
  permissions: string[];
};

type UpdateUserForm = {
  name: string;
  role: "resident" | "staff" | "admin";
  status: "active" | "inactive" | "suspended";
  permissions: string[];
};

const roleColors = {
  resident: "bg-blue-100 text-blue-800 border-blue-200",
  staff: "bg-green-100 text-green-800 border-green-200",
  admin: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  suspended: "bg-red-100 text-red-800 border-red-200",
};

const roleIcons = {
  resident: User,
  staff: Shield,
  admin: Crown,
};

const availablePermissions = [
  {
    id: "read_incidents",
    label: "View Incidents",
    description: "Can view incident reports",
  },
  {
    id: "write_incidents",
    label: "Manage Incidents",
    description: "Can create and update incidents",
  },
  {
    id: "manage_kb",
    label: "Manage Knowledge Base",
    description: "Can create and edit articles",
  },
  {
    id: "manage_users",
    label: "Manage Users",
    description: "Can create and manage user accounts",
  },
  {
    id: "analytics",
    label: "View Analytics",
    description: "Can access system analytics",
  },
];

export function StaffUsersPage({ user }: StaffUsersPageProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  // Data state
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    residents: 0,
    staff: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Form state
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    name: "",
    email: "",
    password: "",
    role: "staff",
    permissions: ["read_incidents", "write_incidents"],
  });

  const [updateForm, setUpdateForm] = useState<UpdateUserForm>({
    name: "",
    role: "resident",
    status: "active",
    permissions: [],
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter, searchQuery]);

  const loadUsers = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      };

      console.log("Loading users with params:", params);

      const response = await usersAPI.getAll(params);

      const transformedUsers = (response.users || []).map((userData) => ({
        ...userData,
        id: userData.id || userData._id,
        status:
          userData.status ||
          (userData.isActive !== false ? "active" : "inactive"),
        createdAt: userData.createdAt || userData.createdOn,
        updatedAt: userData.updatedAt || userData.lastUpdated,
      }));

      setUsers(transformedUsers);
      setTotalPages(response.pagination?.pages || 1);

      // Calculate stats
      const totalUsers = transformedUsers.length;
      const residents = transformedUsers.filter(
        (u) => u.role === "resident",
      ).length;
      const staffCount = transformedUsers.filter(
        (u) => u.role === "staff" || u.role === "admin",
      ).length;
      const activeUsers = transformedUsers.filter(
        (u) => u.status === "active",
      ).length;
      const inactiveUsers = transformedUsers.filter(
        (u) => u.status !== "active",
      ).length;

      setStats({
        totalUsers,
        residents,
        staff: staffCount,
        activeUsers,
        inactiveUsers,
      });

      console.log("Users loaded successfully:", transformedUsers.length);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      await usersAPI.createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
        permissions: createForm.permissions,
      });

      toast.success("Staff user created successfully");
      setShowNewStaffModal(false);
      resetCreateForm();
      await loadUsers(true);
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !updateForm.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      await usersAPI.updateUser(selectedUser.id, {
        name: updateForm.name.trim(),
        role: updateForm.role,
        isActive: updateForm.status === "active",
        permissions: updateForm.permissions,
      });

      toast.success("User updated successfully");
      setShowEditModal(false);
      await loadUsers(true);
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userData: UserData) => {
    if (userData.id === user.id) {
      toast.error("Cannot delete your own account");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userData.name}?`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(userData.id);
      toast.success("User deleted successfully");
      await loadUsers(true);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  const handleEditUser = (userData: UserData) => {
    setSelectedUser(userData);
    setUpdateForm({
      name: userData.name,
      role: userData.role,
      status: userData.status,
      permissions: userData.permissions || [],
    });
    setShowEditModal(true);
  };

  const handlePromoteUser = (userData: UserData) => {
    setSelectedUser(userData);
    setUpdateForm({
      name: userData.name,
      role: "staff",
      status: userData.status,
      permissions: ["read_incidents", "write_incidents"],
    });
    setShowPromoteModal(true);
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      email: "",
      password: "",
      role: "staff",
      permissions: ["read_incidents", "write_incidents"],
    });
  };

  const togglePermission = (permission: string, isCreate: boolean = false) => {
    if (isCreate) {
      setCreateForm((prev) => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission],
      }));
    } else {
      setUpdateForm((prev) => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission],
      }));
    }
  };

  const getRoleBadge = (role: string) => {
    const RoleIcon = roleIcons[role];
    return (
      <Badge className={roleColors[role]}>
        <RoleIcon className="w-3 h-3 mr-1" />
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status] || statusColors["active"]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((userData) => (
        <Card
          key={userData.id}
          className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-400"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {userData.name}
                  </CardTitle>
                  <p className="text-sm text-slate-600 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditUser(userData)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </DropdownMenuItem>
                  {userData.role === "resident" && user.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => handlePromoteUser(userData)}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Promote to Staff
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && userData.id !== user.id && (
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(userData)}
                      className="text-red-600"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              {getRoleBadge(userData.role)}
              {getStatusBadge(userData.status)}
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Joined: {new Date(userData.createdAt).toLocaleDateString()}</p>
              {userData.lastActive && (
                <p>
                  Last Active:{" "}
                  {new Date(userData.lastActive).toLocaleDateString()}
                </p>
              )}
              {userData.permissions && userData.permissions.length > 0 && (
                <p>Permissions: {userData.permissions.length} assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Users Management
          </h1>
          <p className="text-slate-600">
            Manage residents and staff accounts • Total: {stats.totalUsers}{" "}
            users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => loadUsers(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          {user.role === "admin" && (
            <Button onClick={() => setShowNewStaffModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.residents}</p>
                <p className="text-sm text-slate-600">Residents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.staff}</p>
                <p className="text-sm text-slate-600">Staff & Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-slate-100 rounded-[3rem] p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-7 px-2"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-7 px-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-20">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            No users found
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || roleFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters or search terms"
              : "No users have been registered yet"}
          </p>
        </div>
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Last Active</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {userData.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{userData.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {userData.email}
                      </TableCell>
                      <TableCell>{getRoleBadge(userData.role)}</TableCell>
                      <TableCell>{getStatusBadge(userData.status)}</TableCell>
                      <TableCell>
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {userData.lastActive
                          ? new Date(userData.lastActive).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditUser(userData)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            {userData.role === "resident" &&
                              user.role === "admin" && (
                                <DropdownMenuItem
                                  onClick={() => handlePromoteUser(userData)}
                                >
                                  <Crown className="w-4 h-4 mr-2" />
                                  Promote to Staff
                                </DropdownMenuItem>
                              )}
                            {user.role === "admin" &&
                              userData.id !== user.id && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(userData)}
                                  className="text-red-600"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <GridView />
      )}

      {/* New Staff Modal */}
      <Dialog open={showNewStaffModal} onOpenChange={setShowNewStaffModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Staff User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="create-password">Temporary Password *</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(value: "staff" | "admin") =>
                  setCreateForm((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                {availablePermissions.map((perm) => (
                  <div key={perm.id} className="flex items-start space-x-2">
                    <Checkbox
                      checked={createForm.permissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id, true)}
                    />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {perm.label}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewStaffModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Staff User"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={updateForm.name}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={selectedUser.email}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={updateForm.role}
                    onValueChange={(value: "resident" | "staff" | "admin") =>
                      setUpdateForm((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={updateForm.status}
                    onValueChange={(
                      value: "active" | "inactive" | "suspended",
                    ) => setUpdateForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(updateForm.role === "staff" || updateForm.role === "admin") && (
                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {availablePermissions.map((perm) => (
                      <div key={perm.id} className="flex items-start space-x-2">
                        <Checkbox
                          checked={updateForm.permissions.includes(perm.id)}
                          onCheckedChange={() =>
                            togglePermission(perm.id, false)
                          }
                        />
                        <div className="flex-1">
                          <Label className="text-sm font-medium">
                            {perm.label}
                          </Label>
                          <p className="text-xs text-slate-500">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote User Modal */}
      <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Promote to Staff</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to promote{" "}
                <strong>{selectedUser.name}</strong> to staff?
              </p>

              <div>
                <Label>Initial Permissions</Label>
                <div className="space-y-2 mt-2">
                  {availablePermissions.slice(0, 3).map((perm) => (
                    <div key={perm.id} className="flex items-start space-x-2">
                      <Checkbox
                        checked={updateForm.permissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id, false)}
                      />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">
                          {perm.label}
                        </Label>
                        <p className="text-xs text-slate-500">
                          {perm.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPromoteModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setShowPromoteModal(false);
                    await handleUpdateUser();
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Promoting...
                    </>
                  ) : (
                    "Promote User"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
