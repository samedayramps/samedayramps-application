"use client";

import { useState } from "react";
import { Button, Select, Flex, Text, Badge } from "@radix-ui/themes";
import { CheckIcon, UpdateIcon } from "@radix-ui/react-icons";
import { updateQuoteStatus } from "../_actions/updateQuoteStatus";

interface Quote {
  id: string;
  status: string;
  adminNotes?: string | null;
  customerNotes?: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'gray';
    case 'REVIEWING': return 'blue';
    case 'QUOTED': return 'yellow';
    case 'ACCEPTED': return 'green';
    case 'CONVERTED': return 'green';
    case 'DECLINED': return 'red';
    case 'EXPIRED': return 'red';
    default: return 'gray';
  }
};

const statusOptions = [
  { value: "PENDING", label: "Pending", description: "Waiting for review" },
  { value: "REVIEWING", label: "Reviewing", description: "Under review" },
  { value: "QUOTED", label: "Quoted", description: "Quote sent to customer" },
  { value: "ACCEPTED", label: "Accepted", description: "Customer accepted quote" },
  { value: "DECLINED", label: "Declined", description: "Customer declined quote" },
  { value: "EXPIRED", label: "Expired", description: "Quote has expired" },
  { value: "CONVERTED", label: "Converted", description: "Sale completed" },
];

export default function UpdateQuoteStatus({ quote }: { quote: Quote }) {
  const [status, setStatus] = useState(quote.status);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await updateQuoteStatus(quote.id, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = status !== quote.status;
  const currentOption = statusOptions.find(option => option.value === status);

  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="2">
        <Text size={{ initial: "2", md: "3" }} weight="medium">Current Status</Text>
        <Badge color={getStatusColor(quote.status)} variant="soft" size="2">
          {quote.status.toLowerCase()}
        </Badge>
      </Flex>

      <Flex direction="column" gap="3">
        <Text size={{ initial: "2", md: "3" }} weight="medium">Update Status</Text>
        <Select.Root value={status} onValueChange={setStatus}>
          <Select.Trigger placeholder="Select new status..." />
          <Select.Content>
            {statusOptions.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">{option.label}</Text>
                  <Text size="1" color="gray">{option.description}</Text>
                </Flex>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        {hasChanges && currentOption && (
          <Flex align="center" gap="2" p="3" style={{ 
            backgroundColor: 'var(--blue-2)', 
            borderRadius: '8px',
            border: '1px solid var(--blue-6)'
          }}>
            <Text size="2" color="blue">
              Will change to: <strong>{currentOption.label}</strong>
            </Text>
          </Flex>
        )}
      </Flex>

      <Button 
        onClick={handleUpdateStatus} 
        disabled={loading || !hasChanges}
        size={{ initial: "2", md: "3" }}
        color={hasChanges ? "blue" : "gray"}
        style={{ width: "100%" }}
      >
        {loading ? (
          <>
            <UpdateIcon className="animate-spin" />
            Updating...
          </>
        ) : hasChanges ? (
          <>
            <CheckIcon />
            Update Status
          </>
        ) : (
          "No Changes"
        )}
      </Button>
    </Flex>
  );
} 