"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Text, Flex, Box, Button } from "@radix-ui/themes";
import { DashboardIcon, ChatBubbleIcon, PersonIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Quotes", href: "/quotes", icon: ChatBubbleIcon },
  { name: "Customers", href: "/customers", icon: PersonIcon },
  { name: "Test Email", href: "/test-email", icon: EnvelopeClosedIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box className="bg-white w-64 shadow-lg border-r">
      <Flex direction="column" height="100vh">
        {/* Logo */}
        <Box p="6">
          <Flex direction="column" gap="1">
            <Text size="6" weight="bold" color="blue">Same Day Ramps</Text>
            <Text size="2" color="gray">Admin Panel</Text>
          </Flex>
        </Box>
        
        {/* Navigation */}
        <Flex direction="column" gap="1" px="3" style={{ flex: 1 }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "soft" : "ghost"}
                color={isActive ? "blue" : "gray"}
                size="3"
                style={{ 
                  justifyContent: "flex-start",
                  fontWeight: isActive ? "600" : "400"
                }}
              >
                <Link href={item.href}>
                  <IconComponent />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </Flex>

        {/* Footer */}
        <Box p="4" style={{ borderTop: "1px solid var(--gray-6)" }}>
          <Text size="1" color="gray" align="center">
            © 2024 Same Day Ramps
          </Text>
        </Box>
      </Flex>
    </Box>
  );
} 