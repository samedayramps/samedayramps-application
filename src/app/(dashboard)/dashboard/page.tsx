import { Text, Heading, Card, Flex, Box, Grid, Badge, Separator } from "@radix-ui/themes";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  // Enhanced stats
  const totalQuotes = await db.quote.count();
  const pendingQuotes = await db.quote.count({
    where: { status: "PENDING" }
  });
  const reviewingQuotes = await db.quote.count({
    where: { status: "REVIEWING" }
  });
  const quotedQuotes = await db.quote.count({
    where: { status: "QUOTED" }
  });
  const convertedQuotes = await db.quote.count({
    where: { status: "CONVERTED" }
  });
  const totalCustomers = await db.customer.count();

  // Recent quotes for activity
  const recentQuotes = await db.quote.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const conversionRate = totalQuotes > 0 ? ((convertedQuotes / totalQuotes) * 100).toFixed(1) : "0";

  return (
    <Box p={{ initial: "4", md: "6" }}>
      <Flex direction="column" gap={{ initial: "4", md: "6" }}>
        {/* Header */}
        <Flex direction="column" gap="2">
          <Heading size={{ initial: "6", md: "8" }} weight="bold">Dashboard</Heading>
          <Text size={{ initial: "2", md: "3" }} color="gray">Welcome to your Same Day Ramps admin panel</Text>
        </Flex>

        {/* Stats Grid */}
        <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap={{ initial: "3", md: "4" }}>
          <Card size="3">
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium" color="gray">Total Quotes</Text>
                <Text size="5">📊</Text>
              </Flex>
              <Text size="7" weight="bold">{totalQuotes}</Text>
              <Text size="1" color="gray">All time</Text>
            </Flex>
          </Card>

          <Card size="3">
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium" color="gray">Pending Review</Text>
                <Badge color="orange" size="1">New</Badge>
              </Flex>
              <Text size="7" weight="bold" color="orange">{pendingQuotes}</Text>
              <Text size="1" color="gray">Needs attention</Text>
            </Flex>
          </Card>

          <Card size="3">
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium" color="gray">Conversion Rate</Text>
                <Text size="5">📈</Text>
              </Flex>
              <Text size="7" weight="bold" color="green">{conversionRate}%</Text>
              <Text size="1" color="gray">Quotes to sales</Text>
            </Flex>
          </Card>

          <Card size="3">
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium" color="gray">Total Customers</Text>
                <Text size="5">👥</Text>
              </Flex>
              <Text size="7" weight="bold">{totalCustomers}</Text>
              <Text size="1" color="gray">Active customers</Text>
            </Flex>
          </Card>
        </Grid>

        {/* Status Breakdown */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size={{ initial: "4", md: "5" }} weight="medium">Quote Status Breakdown</Heading>
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Badge color="gray" variant="soft">Pending</Badge>
                    <Text size="2" color="gray">{pendingQuotes}</Text>
                  </Flex>
                </Flex>
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Badge color="blue" variant="soft">Reviewing</Badge>
                    <Text size="2" color="gray">{reviewingQuotes}</Text>
                  </Flex>
                </Flex>
              </Flex>
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Badge color="yellow" variant="soft">Quoted</Badge>
                    <Text size="2" color="gray">{quotedQuotes}</Text>
                  </Flex>
                </Flex>
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Badge color="green" variant="soft">Converted</Badge>
                    <Text size="2" color="gray">{convertedQuotes}</Text>
                  </Flex>
                </Flex>
              </Flex>
            </Grid>
          </Flex>
        </Card>

        {/* Recent Activity */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size={{ initial: "4", md: "5" }} weight="medium">Recent Quotes</Heading>
            {recentQuotes.length > 0 ? (
              <Flex direction="column" gap="3">
                {recentQuotes.map((quote, index) => (
                  <Box key={quote.id}>
                    <Flex justify="between" align="center" py="2">
                      <Flex direction="column" gap="1">
                        <Text size="3" weight="medium">
                          {quote.customer.firstName} {quote.customer.lastName}
                        </Text>
                        <Text size="2" color="gray">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </Text>
                      </Flex>
                      <Badge 
                        color={
                          quote.status === 'PENDING' ? 'gray' :
                          quote.status === 'REVIEWING' ? 'blue' :
                          quote.status === 'QUOTED' ? 'yellow' :
                          quote.status === 'CONVERTED' ? 'green' :
                          quote.status === 'ACCEPTED' ? 'green' : 'red'
                        }
                        variant="soft"
                      >
                        {quote.status.toLowerCase()}
                      </Badge>
                    </Flex>
                    {index < recentQuotes.length - 1 && <Separator size="4" />}
                  </Box>
                ))}
              </Flex>
            ) : (
              <Flex align="center" justify="center" py="8">
                <Text color="gray" size="3">No recent quotes to display</Text>
              </Flex>
            )}
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
} 