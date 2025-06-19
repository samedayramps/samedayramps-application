import { auth } from "@/lib/auth";
import MobileLayout from "@/components/dashboard/MobileLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <MobileLayout user={session?.user}>
      {children}
    </MobileLayout>
  );
} 