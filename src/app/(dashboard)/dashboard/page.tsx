import { Text, Heading, Card } from "@radix-ui/themes";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  // Basic stats
  const totalQuotes = await db.quote.count();
  const pendingQuotes = await db.quote.count({
    where: { status: "PENDING" }
  });
  const totalCustomers = await db.customer.count();

  return (
    <div className="space-y-6">
      <Heading size="6">Dashboard</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Text size="2" color="gray">Total Quotes</Text>
          <Text size="6" weight="bold">{totalQuotes}</Text>
        </Card>
        
        <Card className="p-6">
          <Text size="2" color="gray">Pending Quotes</Text>
          <Text size="6" weight="bold">{pendingQuotes}</Text>
        </Card>
        
        <Card className="p-6">
          <Text size="2" color="gray">Total Customers</Text>
          <Text size="6" weight="bold">{totalCustomers}</Text>
        </Card>
      </div>
      
      <Card className="p-6">
        <Heading size="4" className="mb-4">Recent Activity</Heading>
        <Text color="gray">No recent activity to display.</Text>
      </Card>
    </div>
  );
} 