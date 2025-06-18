"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Text } from "@radix-ui/themes";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Quotes", href: "/quotes", icon: "💬" },
  { name: "Customers", href: "/customers", icon: "👥" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-white w-64 shadow-lg">
      <div className="p-6">
        <Text size="5" weight="bold">Same Day Ramps</Text>
        <Text size="2" color="gray">Admin Panel</Text>
      </div>
      
      <nav className="mt-8">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 