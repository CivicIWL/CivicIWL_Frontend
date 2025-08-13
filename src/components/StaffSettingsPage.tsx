import React from "react";

interface StaffSettingsPageProps {
  user: any;
}

export function StaffSettingsPage({ user }: StaffSettingsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-slate-900">Settings</h1>
        <p className="text-slate-600">
          Manage system configuration and preferences
        </p>
      </div>

      <div className="bg-white p-6 rounded-[3rem] border">
        <h2 className="text-lg font-medium mb-4">System Settings</h2>
        <p className="text-slate-600">
          Settings functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}
