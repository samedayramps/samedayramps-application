import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Heading, Text, Card, Flex, Box, Badge, Avatar, Separator, Grid } from "@radix-ui/themes";
import { CalendarIcon, EnvelopeClosedIcon, MobileIcon } from "@radix-ui/react-icons";
import UpdateQuoteStatus from "./_components/UpdateQuoteStatus";

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

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await db.quote.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });

  if (!quote) {
    notFound();
  }

  return (
    <Box p={{ initial: "4", md: "6" }}>
      <Flex direction="column" gap={{ initial: "4", md: "6" }}>
        {/* Header */}
        <Flex direction={{ initial: "column", sm: "row" }} justify="between" align={{ initial: "start", sm: "start" }} gap="3">
          <Flex direction="column" gap="2">
            <Heading size={{ initial: "6", md: "8" }} weight="bold">Quote Details</Heading>
            <Text size={{ initial: "2", md: "3" }} color="gray">Quote ID: {quote.id}</Text>
          </Flex>
          <Badge color={getStatusColor(quote.status)} size={{ initial: "2", md: "3" }} variant="soft">
            {quote.status.toLowerCase()}
          </Badge>
        </Flex>

        <Grid columns={{ initial: "1", lg: "2" }} gap={{ initial: "4", md: "6" }}>
          {/* Customer Information */}
          <Card size="3">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Avatar
                  size={{ initial: "3", md: "4" }}
                  fallback={`${quote.customer.firstName[0]}${quote.customer.lastName[0]}`}
                  color="blue"
                />
                <Flex direction="column" gap="1">
                  <Text size={{ initial: "4", md: "5" }} weight="bold">
                    {quote.customer.firstName} {quote.customer.lastName}
                  </Text>
                  <Text size="2" color="gray">Customer Information</Text>
                </Flex>
              </Flex>
              
              <Separator size="4" />
              
              <Flex direction="column" gap="3">
                <Flex align="center" gap="3">
                  <EnvelopeClosedIcon />
                  <Flex direction="column" gap="1">
                    <Text size="2" color="gray">Email</Text>
                    <Text size="3">{quote.customer.email}</Text>
                  </Flex>
                </Flex>
                
                <Flex align="center" gap="3">
                  <MobileIcon />
                  <Flex direction="column" gap="1">
                    <Text size="2" color="gray">Phone</Text>
                    <Text size="3">{quote.customer.phone}</Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Quote Information */}
          <Card size="3">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Text size="5">📋</Text>
                <Flex direction="column" gap="1">
                  <Text size={{ initial: "4", md: "5" }} weight="bold">Quote Information</Text>
                  <Text size="2" color="gray">Project Details</Text>
                </Flex>
              </Flex>
              
              <Separator size="4" />
              
              <Flex direction="column" gap="3">
                <Flex align="start" gap="3">
                  <Text size="3">📍</Text>
                  <Flex direction="column" gap="1">
                    <Text size="2" color="gray">Installation Address</Text>
                    <Text size="3">{quote.installationAddress}</Text>
                  </Flex>
                </Flex>
                
                <Flex align="center" gap="3">
                  <CalendarIcon />
                  <Flex direction="column" gap="1">
                    <Text size="2" color="gray">Created Date</Text>
                    <Text size="3">{new Date(quote.createdAt).toLocaleDateString()}</Text>
                  </Flex>
                </Flex>

                {quote.estimatedCost && (
                  <Flex align="center" gap="3">
                    <Text size="3">💰</Text>
                    <Flex direction="column" gap="1">
                      <Text size="2" color="gray">Estimated Cost</Text>
                      <Text size="3" weight="medium" color="green">
                        {formatCurrency(quote.estimatedCost)}
                      </Text>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Card>
        </Grid>

        {/* Notes Section */}
        {(quote.adminNotes || quote.customerNotes) && (
          <Card size="3">
            <Flex direction="column" gap="4">
              <Text size={{ initial: "4", md: "5" }} weight="bold">Notes</Text>
              <Separator size="4" />
              
              <Grid columns={{ initial: "1", md: "2" }} gap="4">
                {quote.adminNotes && (
                  <Flex direction="column" gap="2">
                    <Text size="3" weight="medium">Admin Notes</Text>
                    <Box p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '8px' }}>
                      <Text size="2">{quote.adminNotes}</Text>
                    </Box>
                  </Flex>
                )}
                
                {quote.customerNotes && (
                  <Flex direction="column" gap="2">
                    <Text size="3" weight="medium">Customer Notes</Text>
                    <Box p="3" style={{ backgroundColor: 'var(--blue-2)', borderRadius: '8px' }}>
                      <Text size="2">{quote.customerNotes}</Text>
                    </Box>
                  </Flex>
                )}
              </Grid>
            </Flex>
          </Card>
        )}

        {/* Status Update Section */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Text size={{ initial: "4", md: "5" }} weight="bold">Update Status</Text>
            <Separator size="4" />
            <UpdateQuoteStatus quote={quote} />
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
} 