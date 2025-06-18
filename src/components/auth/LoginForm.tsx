"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, TextField, Text, Heading } from "@radix-ui/themes";

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
        setError("Invalid credentials");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <Heading size="6">Admin Login</Heading>
        <Text color="gray">Same Day Ramps Administration</Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Text as="label" size="3" className="block mb-2">Email</Text>
          <TextField.Root
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@samedayramps.com"
            required
          />
        </div>

        <div>
          <Text as="label" size="3" className="block mb-2">Password</Text>
          <TextField.Root
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>

        {error && (
          <Text color="red" size="2">{error}</Text>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full"
          size="3"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
} 