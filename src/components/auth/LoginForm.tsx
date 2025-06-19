"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, TextField, Text, Heading, Card, Flex, Box, Callout } from "@radix-ui/themes";
import { LockClosedIcon, EnvelopeClosedIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

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
    <Card size={{ initial: "3", md: "4" }} style={{ maxWidth: '400px', width: '100%' }}>
      <Flex direction="column" gap={{ initial: "4", md: "6" }}>
        {/* Header */}
        <Flex direction="column" align="center" gap="2">
          <Box style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--blue-9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LockClosedIcon color="white" width="24" height="24" />
          </Box>
          <Heading size={{ initial: "6", md: "7" }} weight="bold">Welcome Back</Heading>
          <Text color="gray" size={{ initial: "2", md: "3" }} align="center">
            Sign in to access the Same Day Ramps admin panel
          </Text>
        </Flex>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Text as="label" size={{ initial: "2", md: "3" }} weight="medium">Email Address</Text>
              <TextField.Root
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@samedayramps.com"
                size={{ initial: "2", md: "3" }}
                required
              >
                <TextField.Slot>
                  <EnvelopeClosedIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size={{ initial: "2", md: "3" }} weight="medium">Password</Text>
              <TextField.Root
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                size={{ initial: "2", md: "3" }}
                required
              >
                <TextField.Slot>
                  <LockClosedIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </Flex>

            {error && (
              <Callout.Root color="red" size="2">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text>{error}</Callout.Text>
              </Callout.Root>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              size={{ initial: "2", md: "3" }}
              style={{ width: '100%' }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Flex>
        </form>

        {/* Footer */}
        <Box style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid var(--gray-6)' }}>
          <Text size="2" color="gray">
            © 2024 Same Day Ramps. All rights reserved.
          </Text>
        </Box>
      </Flex>
    </Card>
  );
} 