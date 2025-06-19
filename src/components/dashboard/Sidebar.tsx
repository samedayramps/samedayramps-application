"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Mail,
  Settings,
  Calculator,
  ClipboardList
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Quotes", href: "/quotes", icon: MessageSquare },
  { name: "Customers", href: "/customers", icon: User },
  { name: "Rentals", href: "/rentals", icon: ClipboardList },
  { name: "Pricing Calculator", href: "/calculator", icon: Calculator },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Test Email", href: "/test-email", icon: Mail },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation */}
      <div className="flex-1 px-3 pt-6">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigation}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <IconComponent className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2024 Same Day Ramps
        </p>
      </div>
    </div>
  );
} 