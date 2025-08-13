import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Building2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
}

export function LoginPage({ onLogin, onSwitchToSignUp }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl text-slate-900 mb-2">CivicNavigator</h1>
          <p className="text-slate-600">Your civic assistant platform</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your civic dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
              <Button type="button" variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
                Forgot password?
              </Button>
            </CardContent>
          </form>
          <CardFooter>
            <p className="text-center text-sm text-slate-600 w-full">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Sign Up
              </button>
            </p>
          </CardFooter>
        </Card>

        {/* Demo Instructions */}
        <Card className="mt-6 border border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-blue-900">Demo Access</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 space-y-2">
            <div>
              <p><strong>Resident Portal:</strong> Use any email without "staff" or "admin"</p>
              <p className="text-xs text-blue-600">Example: john.doe@email.com</p>
            </div>
            <div>
              <p><strong>Staff Portal:</strong> Use email containing "staff"</p>
              <p className="text-xs text-blue-600">Example: sarah.staff@city.gov</p>
            </div>
            <div>
              <p><strong>Admin Portal:</strong> Use email containing "admin"</p>
              <p className="text-xs text-blue-600">Example: admin@city.gov</p>
            </div>
            <p className="text-xs text-blue-500 pt-2 border-t border-blue-200">
              Password can be anything for demo purposes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}