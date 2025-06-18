import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { Badge } from "../../../components/ui/Badge";
import { Button, Heading } from "@radix-ui/themes";
import Link from "next/link";
import { Quote, Customer } from "@prisma/client";

type QuoteWithCustomer = Quote & {
  customer: Customer;
};

export default async function QuotesPage() {
  const quotes: QuoteWithCustomer[] = await db.quote.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Heading>Quotes</Heading>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell>
                {quote.customer.firstName} {quote.customer.lastName}
              </TableCell>
              <TableCell>
                <Badge>{quote.status}</Badge>
              </TableCell>
              <TableCell>
                {new Date(quote.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button asChild>
                  <Link href={`/quotes/${quote.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 