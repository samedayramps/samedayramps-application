import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Heading, Text, Card, Flex, Inset, Strong } from "@radix-ui/themes";
import UpdateQuoteStatus from "./_components/UpdateQuoteStatus";

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
    <div>
      <Heading mb="4">Quote Details</Heading>
      <Card>
        <Inset>
          <Flex direction="column" p="4">
            <Text>
              <Strong>Customer:</Strong> {quote.customer.firstName}{" "}
              {quote.customer.lastName}
            </Text>
            <Text>
              <Strong>Email:</Strong> {quote.customer.email}
            </Text>
            <Text>
              <Strong>Phone:</Strong> {quote.customer.phone}
            </Text>
            <Text>
              <Strong>Installation Address:</Strong> {quote.installationAddress}
            </Text>
            <Text>
              <Strong>Status:</Strong> {quote.status}
            </Text>
            <Text>
              <Strong>Notes:</Strong> {quote.notes || "N/A"}
            </Text>
          </Flex>
        </Inset>
      </Card>

      <div className="mt-6">
        <UpdateQuoteStatus quote={quote} />
      </div>
    </div>
  );
} 