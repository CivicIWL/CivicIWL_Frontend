import React from 'react';
import { FileText, Users, AlertTriangle, CheckCircle, Clock, Plus, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'staff' | 'admin';
};

interface StaffDashboardProps {
  user: User;
}

// Mock data
const incidentData = [
  { name: 'Jan', incidents: 65 },
  { name: 'Feb', incidents: 59 },
  { name: 'Mar', incidents: 80 },
  { name: 'Apr', incidents: 81 },
  { name: 'May', incidents: 56 },
  { name: 'Jun', incidents: 55 },
];

const categoryData = [
  { name: 'Infrastructure', value: 35, color: '#3B82F6' },
  { name: 'Safety', value: 25, color: '#EF4444' },
  { name: 'Environment', value: 20, color: '#10B981' },
  { name: 'Transportation', value: 20, color: '#F59E0B' },
];

const recentActivities = [
  { id: 1, action: 'New incident reported', details: 'Water leak on Main Street', time: '5 mins ago', type: 'incident' },
  { id: 2, action: 'Incident resolved', details: 'INC-2024-0156 marked as resolved', time: '12 mins ago', type: 'resolved' },
  { id: 3, action: 'New user registered', details: 'john.smith@email.com joined', time: '1 hour ago', type: 'user' },
  { id: 4, action: 'KB article updated', details: 'Emergency Procedures guide', time: '2 hours ago', type: 'knowledge' },
];

export function StaffDashboard({ user }: StaffDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-medium text-slate-900">Welcome back, {user.name}</h1>
        <p className="text-slate-600">Here's what's happening in your city today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <FileText className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">1,247</div>
            <p className="text-xs text-slate-600">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">23</div>
            <p className="text-xs text-slate-600">
              <span className="text-orange-600">+3</span> since yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">47</div>
            <p className="text-xs text-slate-600">
              Avg. resolution: 3.2 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Residents</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">8,456</div>
            <p className="text-xs text-slate-600">
              <span className="text-green-600">+156</span> new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="incidents" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incidents by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50">
                  <div className="flex-shrink-0">
                    {activity.type === 'incident' && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    )}
                    {activity.type === 'resolved' && (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                    )}
                    {activity.type === 'user' && (
                      <Users className="w-4 h-4 text-blue-600 mt-1" />
                    )}
                    {activity.type === 'knowledge' && (
                      <Edit className="w-4 h-4 text-purple-600 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{activity.action}</p>
                    <p className="text-sm text-slate-600">{activity.details}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Assign Incident
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Edit className="w-4 h-4" />
              Add KB Article
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Users className="w-4 h-4" />
              Add Staff User
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}