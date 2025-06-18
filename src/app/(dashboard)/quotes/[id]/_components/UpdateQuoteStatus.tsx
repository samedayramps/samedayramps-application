"use client";

import { useState } from "react";
import { Button, Select } from "@radix-ui/themes";
import { updateQuoteStatus } from "../_actions/updateQuoteStatus";

interface Quote {
  id: string;
  status: string;
  adminNotes?: string | null;
  customerNotes?: string | null;
}

export default function UpdateQuoteStatus({ quote }: { quote: Quote }) {
  const [status, setStatus] = useState(quote.status);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async () => {
    setLoading(true);
    await updateQuoteStatus(quote.id, status);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4">
      <Select.Root value={status} onValueChange={setStatus}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="PENDING">Pending</Select.Item>
          <Select.Item value="REVIEWING">Reviewing</Select.Item>
          <Select.Item value="QUOTED">Quoted</Select.Item>
          <Select.Item value="ACCEPTED">Accepted</Select.Item>
          <Select.Item value="DECLINED">Declined</Select.Item>
          <Select.Item value="EXPIRED">Expired</Select.Item>
          <Select.Item value="CONVERTED">Converted</Select.Item>
        </Select.Content>
      </Select.Root>
      <Button onClick={handleUpdateStatus} disabled={loading}>
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
} 