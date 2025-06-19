"use client";

import { useState } from "react";
import { Box, Flex, IconButton } from "@radix-ui/themes";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import { User } from "next-auth";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MobileLayoutProps {
  children: React.ReactNode;
  user?: User;
}

export default function MobileLayout({ children, user }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "var(--gray-2)" }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <Box
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Layout */}
      <Flex className="hidden lg:flex" style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Flex direction="column" style={{ flex: 1 }}>
          {user && <Header user={user} />}
          <Box
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "var(--gray-2)",
            }}
          >
            {children}
          </Box>
        </Flex>
      </Flex>

      {/* Mobile Layout */}
      <Flex direction="column" className="lg:hidden" style={{ minHeight: "100vh" }}>
        {/* Mobile Header */}
        <Box
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid var(--gray-6)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <Flex justify="between" align="center" p="4">
            <IconButton
              variant="ghost"
              size="3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </IconButton>
            
            <Box style={{ fontSize: "18px", fontWeight: "bold", color: "var(--blue-11)" }}>
              Same Day Ramps
            </Box>
            
            <Box style={{ width: "40px" }} /> {/* Spacer for centering */}
          </Flex>
        </Box>

        {/* Mobile Sidebar */}
        <Box
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </Box>

        {/* Mobile Content */}
        <Box style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </Box>

        {/* Mobile User Info - Bottom */}
        {user && (
          <Box
            style={{
              backgroundColor: "white",
              borderTop: "1px solid var(--gray-6)",
              padding: "16px",
            }}
          >
            <Flex align="center" justify="between">
              <Flex direction="column" gap="1">
                <Box style={{ fontSize: "14px", fontWeight: "500" }}>
                  {user.name}
                </Box>
                <Box style={{ fontSize: "12px", color: "var(--gray-11)" }}>
                  {user.email}
                </Box>
              </Flex>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  );
} 