"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertTriangle } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-15 h-15 bg-blue-600 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm md:text-base text-gray-600 text-center">
            Sign in to access the Same Day Ramps admin panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="email" className="text-sm md:text-base font-medium text-gray-900">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@samedayramps.com"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="password" className="text-sm md:text-base font-medium text-gray-900">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            © 2024 Same Day Ramps. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
} 