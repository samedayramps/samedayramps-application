import { Decimal } from "@prisma/client/runtime/library";

// You can define your shared types here.
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export interface Customer {
  id: string;
  firstName: string;
  lastName:string;
  email: string;
  phone: string;
  alternatePhone?: string | null;
}

export interface Quote {
  id: string;
  status: string;
  installationAddress: string;
  adminNotes?: string | null;
  customerNotes?: string | null;
  createdAt: Date;
  totalEstimatedCost?: Decimal | null;
  customer: Customer;
}

export interface Rental {
  id: string;
  status: string;
  startDate: Date;
  monthlyRate: Decimal;
  customer: Customer;
  quote?: Quote | null;
  upfrontCost: Decimal;
  totalPaid: Decimal;
  nextPaymentDate?: Date | null;
} 