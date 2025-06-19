import { db } from "@/lib/db";
import { Button, Heading, Card, Flex, Box, Text, Avatar, IconButton, TextField, Badge } from "@radix-ui/themes";
import Link from "next/link";
import { MagnifyingGlassIcon, EyeOpenIcon } from "@radix-ui/react-icons";

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Quote {
  id: string;
  status: string;
  createdAt: Date;
  installationAddress: string;
  adminNotes?: string | null;
  customerNotes?: string | null;
  estimatedCost?: unknown; // Prisma Decimal type
  customer: Customer;
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

const formatCurrency = (amount: unknown) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
};

export default async function QuotesPage() {
  const quotes: Quote[] = await db.quote.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statusCounts = quotes.reduce((acc, quote) => {
    acc[quote.status] = (acc[quote.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box p={{ initial: "4", md: "6" }}>
      <Flex direction="column" gap={{ initial: "4", md: "6" }}>
        {/* Header */}
        <Flex direction={{ initial: "column", sm: "row" }} justify="between" align={{ initial: "start", sm: "center" }} gap="4">
          <Flex direction="column" gap="1">
            <Heading size={{ initial: "6", md: "8" }} weight="bold">Quotes</Heading>
            <Text size={{ initial: "2", md: "3" }} color="gray">{quotes.length} total quotes</Text>
          </Flex>
          <TextField.Root placeholder="Search quotes..." size="2" style={{ width: "100%", maxWidth: "300px" }}>
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        {/* Status Overview */}
        <Flex gap="3" wrap="wrap">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Badge key={status} color={getStatusColor(status)} variant="soft" size="2">
              {status.toLowerCase()}: {count}
            </Badge>
          ))}
        </Flex>

                {/* Quotes Grid */}
        <Flex direction="column" gap="3">
          {quotes.length > 0 ? quotes.map((quote) => (
            <Card key={quote.id} size="3">
              <Flex direction={{ initial: "column", md: "row" }} gap="4">
                <Flex gap="4" align="start" style={{ flex: 1 }}>
                  {/* Customer Avatar */}
                  <Avatar
                    size={{ initial: "2", md: "3" }}
                    fallback={`${quote.customer.firstName[0]}${quote.customer.lastName[0]}`}
                    color="blue"
                  />
                  
                  {/* Quote Details */}
                  <Flex direction="column" gap="2" style={{ flex: 1 }}>
                    <Flex direction={{ initial: "column", sm: "row" }} justify="between" align={{ initial: "start", sm: "start" }} gap="2">
                      <Flex direction="column" gap="1">
                        <Text size={{ initial: "3", md: "4" }} weight="bold">
                          {quote.customer.firstName} {quote.customer.lastName}
                        </Text>
                        <Text size="2" color="gray">
                          {quote.customer.email}
                        </Text>
                        <Text size="2" color="gray" className="sm:hidden">
                          {quote.customer.phone}
                        </Text>
                        <Text size="2" color="gray" className="hidden sm:inline">
                          {quote.customer.email} • {quote.customer.phone}
                        </Text>
                      </Flex>
                      <Badge color={getStatusColor(quote.status)} variant="soft" size={{ initial: "1", md: "2" }}>
                        {quote.status.toLowerCase()}
                      </Badge>
                    </Flex>
                    
                    <Text size={{ initial: "2", md: "3" }} color="gray" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      📍 {quote.installationAddress}
                    </Text>
                    
                    <Flex direction={{ initial: "column", sm: "row" }} gap={{ initial: "1", sm: "4" }} align={{ initial: "start", sm: "center" }}>
                      <Text size="2" color="gray">
                        Created: {new Date(quote.createdAt).toLocaleDateString()}
                      </Text>
                      {quote.estimatedCost ? (
                        <Text size="2" weight="medium" color="green">
                          Est: {formatCurrency(quote.estimatedCost)}
                        </Text>
                      ) : null}
                    </Flex>
                  </Flex>
                </Flex>

                {/* Actions */}
                <Flex direction={{ initial: "row", md: "row" }} gap="2" align="center" justify={{ initial: "start", md: "center" }} style={{ width: "100%" }}>
                  <IconButton asChild size="2" variant="soft" className="md:flex hidden">
                    <Link href={`/quotes/${quote.id}`}>
                      <EyeOpenIcon />
                    </Link>
                  </IconButton>
                  <Button asChild size="2" variant="outline" style={{ flex: 1, maxWidth: "200px" }}>
                    <Link href={`/quotes/${quote.id}`}>
                      View Details
                    </Link>
                  </Button>
                </Flex>
              </Flex>
            </Card>
          )) : (
            <Card size="4">
              <Flex direction="column" align="center" justify="center" gap="3" py="8">
                <Text size="6">📋</Text>
                <Text size="4" weight="medium">No quotes found</Text>
                <Text size="3" color="gray">Quotes will appear here when customers submit requests</Text>
              </Flex>
            </Card>
          )}
        </Flex>
      </Flex>
    </Box>
  );
} 