import React from 'react';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MessageSquare, AlertTriangle, User, Calendar } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'staff' | 'admin';
};

type Page = 'login' | 'signup' | 'dashboard' | 'chatbot' | 'incidents' | 'profile';

interface ResidentDashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function ResidentDashboard({ user, onNavigate, onLogout }: ResidentDashboardProps) {
  const stats = [
    { label: 'Active Chats', value: '12', icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Reports Submitted', value: '7', icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Profile Complete', value: '85%', icon: User, color: 'bg-green-500' },
  ];

  const recentActivity = [
    { type: 'chat', title: 'Asked about voting registration', date: '2 hours ago' },
    { type: 'incident', title: 'Reported broken streetlight', date: '1 day ago' },
    { type: 'chat', title: 'Property tax deadline inquiry', date: '3 days ago' },
    { type: 'incident', title: 'Pothole report on Main St', date: '1 week ago' },
  ];

  return (
    <Layout user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back, {user.name}</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('chatbot')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Start Chat</h3>
                  <p className="text-slate-600">Get help with civic services</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('incidents')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Report Issue</h3>
                  <p className="text-slate-600">Submit a new incident report</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'chat' ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'chat' ? (
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}