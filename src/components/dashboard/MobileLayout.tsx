"use client";

import { useState, useEffect } from "react";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import Sidebar from "./Sidebar";

interface MobileLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function MobileLayout({ children, user }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Responsive */}
      <div
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative w-64 flex-shrink-0"
        }`}
      >
        <Sidebar onNavigate={closeSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex justify-between items-center px-4 py-4">
            {/* Left: Menu Button + Logo */}
            <div className="flex items-center space-x-3">
              {isMobile ? (
                <>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Open sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <h1 className="text-xl font-bold text-blue-600">
                    Same Day Ramps
                  </h1>
                </>
              ) : (
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-blue-600">Same Day Ramps</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              )}
            </div>

            {/* Right: User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.[0] || "U"}
                    </span>
                  </div>
                  <span className="hidden sm:inline">{user?.name}</span>
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
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 