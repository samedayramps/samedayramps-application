"use client";

import { signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-gray-500">
            Same Day Ramps Admin Panel
          </p>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.[0] || "U"}
              </span>
            </div>
            <span>{user?.name}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <div className="font-medium">{user?.name}</div>
                <div className="text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 