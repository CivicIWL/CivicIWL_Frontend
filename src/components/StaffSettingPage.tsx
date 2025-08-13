import React, { useState } from "react";
import {
  Save,
  Bell,
  Shield,
  Settings2,
  Database,
  Mail,
  Globe,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type User = {
  id: string;
  name: string;
  email: string;
  role: "resident" | "staff" | "admin";
};

interface StaffSettingsPageProps {
  user: User;
}

export function StaffSettingsPage({ user }: StaffSettingsPageProps) {
  const [activeTab, setActiveTab] = useState("system");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-slate-900">Settings</h1>
        <p className="text-slate-600">
          Manage system configuration and preferences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>System Name</Label>
                  <Input defaultValue="CivicNavigator" />
                </div>
                <div>
                  <Label>City/Organization</Label>
                  <Input defaultValue="Springfield City" />
                </div>
              </div>

              <div>
                <Label>System Description</Label>
                <Textarea
                  defaultValue="Civic assistant platform for Springfield residents to report incidents and access city services."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Time Zone</Label>
                  <Select defaultValue="america/new_york">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/new_york">
                        Eastern Time
                      </SelectItem>
                      <SelectItem value="america/chicago">
                        Central Time
                      </SelectItem>
                      <SelectItem value="america/denver">
                        Mountain Time
                      </SelectItem>
                      <SelectItem value="america/los_angeles">
                        Pacific Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>

          {/* Incident Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Infrastructure</Badge>
                <Badge variant="secondary">Transportation</Badge>
                <Badge variant="secondary">Safety</Badge>
                <Badge variant="secondary">Environment</Badge>
                <Badge variant="secondary">Utilities</Badge>
              </div>

              <div className="flex gap-2">
                <Input placeholder="Add new category..." />
                <Button variant="outline">Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Status Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-[3rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>New</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-[3rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-[3rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Resolved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-[3rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Closed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Incident Notifications</Label>
                    <p className="text-sm text-slate-600">
                      Notify staff when new incidents are reported
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Assignment Notifications</Label>
                    <p className="text-sm text-slate-600">
                      Notify staff when incidents are assigned to them
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Status Update Notifications</Label>
                    <p className="text-sm text-slate-600">
                      Notify residents when incident status changes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Summary Reports</Label>
                    <p className="text-sm text-slate-600">
                      Send weekly incident summary to administrators
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Label>SMTP Configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Server</Label>
                    <Input placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input placeholder="587" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input placeholder="notifications@city.gov" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-600">
                      Require 2FA for all staff accounts
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-slate-600">
                      Automatically log out inactive users
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Password Requirements</Label>
                    <p className="text-sm text-slate-600">
                      Enforce strong password policy
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Attempt Limit</Label>
                    <p className="text-sm text-slate-600">
                      Lock accounts after failed attempts
                    </p>
                  </div>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-[3rem] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label>Staff Role</Label>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Manage Incidents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Manage Knowledge Base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Manage Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>System Settings</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-[3rem] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label>Admin Role</Label>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Manage Incidents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Manage Knowledge Base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Manage Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>System Settings</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                External Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-[3rem]">
                  <div>
                    <Label>Google Maps API</Label>
                    <p className="text-sm text-slate-600">
                      For location services and mapping
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Connected</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-[3rem]">
                  <div>
                    <Label>SMS Gateway</Label>
                    <p className="text-sm text-slate-600">
                      For SMS notifications
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Not Connected</Badge>
                    <Button variant="outline" size="sm">
                      Setup
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-[3rem]">
                  <div>
                    <Label>Analytics Platform</Label>
                    <p className="text-sm text-slate-600">
                      For usage analytics and reporting
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Not Connected</Badge>
                    <Button variant="outline" size="sm">
                      Setup
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database & Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-slate-600">
                      Schedule regular database backups
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Frequency</Label>
                    <p className="text-sm text-slate-600">
                      How often to create backups
                    </p>
                  </div>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Retention Period</Label>
                    <p className="text-sm text-slate-600">
                      How long to keep backups
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline">Create Backup Now</Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
