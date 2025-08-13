import React, { useState } from 'react';
import { Layout } from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { User, Mail, Phone, MapPin, MessageSquare, AlertTriangle, Calendar, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
};

type Page = 'login' | 'signup' | 'dashboard' | 'chatbot' | 'incidents' | 'profile';

interface ProfilePageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function ProfilePage({ user, onNavigate, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Cityville, ST 12345',
  });

  const [editData, setEditData] = useState(profileData);

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const accountStats = [
    { label: 'Member Since', value: 'January 2024', icon: Calendar },
    { label: 'Active Chats', value: '12', icon: MessageSquare },
    { label: 'Reports Submitted', value: '7', icon: AlertTriangle },
    { label: 'Community Score', value: '92%', icon: User },
  ];

  const recentActivity = [
    { type: 'chat', title: 'Started chat about voting registration', date: '2024-01-18' },
    { type: 'incident', title: 'Reported broken streetlight', date: '2024-01-15' },
    { type: 'chat', title: 'Asked about property tax deadlines', date: '2024-01-12' },
    { type: 'incident', title: 'Reported pothole on Main St', date: '2024-01-10' },
  ];

  return (
    <Layout user={user} currentPage="profile" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-slate-900">Profile</h1>
            <p className="text-slate-600">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-[3rem]">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{profileData.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-[3rem]">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-[3rem]">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-[3rem]">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{profileData.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-[3rem]">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'chat' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        {activity.type === 'chat' ? (
                          <MessageSquare className={`h-4 w-4 ${
                            activity.type === 'chat' ? 'text-blue-600' : 'text-orange-600'
                          }`} />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-600">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => onNavigate('chatbot')}>
                    View All Chats
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('incidents')}>
                    View All Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{stat.label}</span>
                      </div>
                      <span className="text-sm text-slate-900">{stat.value}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('chatbot')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start New Chat
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('incidents')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
                <Separator />
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={onLogout}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}