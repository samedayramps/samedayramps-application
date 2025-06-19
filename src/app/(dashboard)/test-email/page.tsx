"use client";

import { useState } from "react";
import { Box, Button, Card, Flex, Heading, Text, Callout } from "@radix-ui/themes";
import { EnvelopeClosedIcon, CheckIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function TestEmailPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const testEmail = async (type: 'admin' | 'quote') => {
    setLoading(type);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ type: 'success', message: data.message });
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to send email' });
      }
         } catch {
       setResult({ type: 'error', message: 'Network error occurred' });
     } finally {
      setLoading(null);
    }
  };

  return (
    <Box p={{ initial: "4", md: "6" }}>
      <Flex direction="column" gap={{ initial: "4", md: "6" }}>
        <Flex direction="column" gap="2">
          <Heading size={{ initial: "6", md: "8" }} weight="bold">Email Testing</Heading>
          <Text size={{ initial: "2", md: "3" }} color="gray">
            Test the email notification system
          </Text>
        </Flex>

        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="5" weight="medium">Test Email Functions</Heading>
            
            <Flex direction="column" gap="3">
              <Flex direction="column" gap="2">
                <Text size="3" weight="medium">Admin Notification</Text>
                <Text size="2" color="gray">
                  Tests the email sent to admin when a new quote is created
                </Text>
                <Button
                  onClick={() => testEmail('admin')}
                  disabled={loading !== null}
                  size="2"
                  variant="outline"
                >
                  <EnvelopeClosedIcon />
                  {loading === 'admin' ? 'Sending...' : 'Test Admin Email'}
                </Button>
              </Flex>

              <Flex direction="column" gap="2">
                <Text size="3" weight="medium">Customer Quote Email</Text>
                <Text size="2" color="gray">
                  Tests the email sent to customers when quote status changes to QUOTED
                </Text>
                <Button
                  onClick={() => testEmail('quote')}
                  disabled={loading !== null}
                  size="2"
                  variant="outline"
                >
                  <EnvelopeClosedIcon />
                  {loading === 'quote' ? 'Sending...' : 'Test Quote Email'}
                </Button>
              </Flex>
            </Flex>

            {result && (
              <Callout.Root color={result.type === 'success' ? 'green' : 'red'} size="2">
                <Callout.Icon>
                  {result.type === 'success' ? <CheckIcon /> : <ExclamationTriangleIcon />}
                </Callout.Icon>
                <Callout.Text>{result.message}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </Card>

        <Card size="3">
          <Flex direction="column" gap="3">
            <Heading size="4" weight="medium">Setup Instructions</Heading>
            <Text size="2" color="gray">
              To enable email notifications:
            </Text>
                         <Box style={{ backgroundColor: 'var(--gray-3)', padding: '12px', borderRadius: '8px' }}>
               <Text size="1" style={{ fontFamily: 'monospace' }}>
                 RESEND_API_KEY=&quot;re_your_api_key_here&quot;
               </Text>
             </Box>
            <Text size="2" color="gray">
              Add this to your .env or .env.local file. Get your API key from{' '}
              <Text as="span" weight="medium" color="blue">
                resend.com
              </Text>
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
} 