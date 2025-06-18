"use client";

import { signOut } from "next-auth/react";
import { Button, Text } from "@radix-ui/themes";
import { User } from "next-auth";

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
      <div>
        <Text size="4" weight="bold">Welcome back, {user?.name}</Text>
      </div>
      
      <Button 
        variant="outline" 
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign Out
      </Button>
    </header>
  );
} 