import React, { useState } from 'react';
import { Search, Plus, Edit, MoreHorizontal, Shield, User, Grid, List, UserPlus, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'staff' | 'admin';
};

interface StaffUsersPageProps {
  user: User;
}

type UserData = {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'staff' | 'admin';
  status: 'active' | 'inactive';
  createdOn: string;
  lastActive: string;
  incidentsReported?: number;
  incidentsAssigned?: number;
};

// Mock users data
const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    role: 'resident',
    status: 'active',
    createdOn: '2024-01-15',
    lastActive: '2024-01-20',
    incidentsReported: 3
  },
  {
    id: '2',
    name: 'Sarah Davis',
    email: 'sarah.davis@city.gov',
    role: 'staff',
    status: 'active',
    createdOn: '2023-12-01',
    lastActive: '2024-01-20',
    incidentsAssigned: 15
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@city.gov',
    role: 'admin',
    status: 'active',
    createdOn: '2023-11-15',
    lastActive: '2024-01-19',
    incidentsAssigned: 8
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    role: 'resident',
    status: 'active',
    createdOn: '2024-01-10',
    lastActive: '2024-01-18',
    incidentsReported: 7
  },
];

const roleColors = {
  resident: 'bg-blue-100 text-blue-800',
  staff: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800'
};

const roleIcons = {
  resident: User,
  staff: Shield,
  admin: Crown
};

export function StaffUsersPage({ user }: StaffUsersPageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const filteredUsers = mockUsers.filter(userData => {
    const matchesSearch = userData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         userData.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || userData.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || userData.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (userData: UserData) => {
    setSelectedUser(userData);
    setShowEditModal(true);
  };

  const handlePromoteUser = (userData: UserData) => {
    setSelectedUser(userData);
    setShowPromoteModal(true);
  };

  const stats = {
    totalUsers: mockUsers.length,
    residents: mockUsers.filter(u => u.role === 'resident').length,
    staff: mockUsers.filter(u => u.role === 'staff' || u.role === 'admin').length,
    activeUsers: mockUsers.filter(u => u.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Users Management</h1>
          <p className="text-slate-600">Manage residents and staff accounts</p>
        </div>
        <Button onClick={() => setShowNewStaffModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
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
                <p className="text-sm text-slate-600">Staff</p>
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
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-7"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userData) => {
                  const RoleIcon = roleIcons[userData.role];
                  return (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {userData.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{userData.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[userData.role]}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {userData.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={userData.status === 'active' ? 'default' : 'secondary'}>
                          {userData.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{userData.createdOn}</TableCell>
                      <TableCell>
                        {userData.role === 'resident' && userData.incidentsReported && (
                          <span className="text-sm text-slate-600">{userData.incidentsReported} reports</span>
                        )}
                        {(userData.role === 'staff' || userData.role === 'admin') && userData.incidentsAssigned && (
                          <span className="text-sm text-slate-600">{userData.incidentsAssigned} assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
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
                            {userData.role === 'resident' && (
                              <DropdownMenuItem onClick={() => handlePromoteUser(userData)}>
                                <Crown className="w-4 h-4 mr-2" />
                                Promote to Staff
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((userData) => {
            const RoleIcon = roleIcons[userData.role];
            return (
              <Card key={userData.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {userData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{userData.name}</CardTitle>
                        <p className="text-sm text-slate-600">{userData.email}</p>
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
                        {userData.role === 'resident' && (
                          <DropdownMenuItem onClick={() => handlePromoteUser(userData)}>
                            <Crown className="w-4 h-4 mr-2" />
                            Promote to Staff
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={roleColors[userData.role]}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {userData.role.toUpperCase()}
                    </Badge>
                    <Badge variant={userData.status === 'active' ? 'default' : 'secondary'}>
                      {userData.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>📅 Joined {userData.createdOn}</p>
                    <p>🔄 Active {userData.lastActive}</p>
                    {userData.role === 'resident' && userData.incidentsReported && (
                      <p>📝 {userData.incidentsReported} incidents reported</p>
                    )}
                    {(userData.role === 'staff' || userData.role === 'admin') && userData.incidentsAssigned && (
                      <p>📋 {userData.incidentsAssigned} incidents assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Staff Modal */}
      <Dialog open={showNewStaffModal} onOpenChange={setShowNewStaffModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Enter full name" />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="Enter email address" />
            </div>

            <div>
              <Label>Role</Label>
              <Select defaultValue="staff">
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
              <Label>Password</Label>
              <Input type="password" placeholder="Temporary password" />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <Label className="text-sm">Manage Incidents</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <Label className="text-sm">Manage Knowledge Base</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label className="text-sm">Manage Users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label className="text-sm">System Settings</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewStaffModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNewStaffModal(false)}>
                Create Staff User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote User Modal */}
      <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Staff</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to promote <strong>{selectedUser.name}</strong> to staff?
              </p>
              
              <div>
                <Label>Initial Permissions</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <Label className="text-sm">Manage Incidents</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label className="text-sm">Manage Knowledge Base</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPromoteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowPromoteModal(false)}>
                  Promote User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}