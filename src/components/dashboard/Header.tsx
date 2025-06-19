"use client";

import { signOut } from "next-auth/react";
import { Button, Text, Flex, Avatar, DropdownMenu, Box } from "@radix-ui/themes";
import { ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import { User } from "next-auth";

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  return (
    <Box asChild>
      <header className="bg-white shadow-sm border-b">
        <Flex justify="between" align="center" p="4">
          <Flex direction="column" gap="1">
            <Text size="4" weight="bold">Welcome back, {user?.name}</Text>
            <Text size="2" color="gray">Same Day Ramps Admin Panel</Text>
          </Flex>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" size="2">
                <Avatar
                  size="2"
                  fallback={user?.name?.[0] || "U"}
                  color="blue"
                />
                <Text size="2">{user?.name}</Text>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>
                <PersonIcon />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item 
                color="red"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <ExitIcon />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </header>
    </Box>
  );
} 