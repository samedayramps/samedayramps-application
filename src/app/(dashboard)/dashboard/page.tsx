import { db } from "@/lib/db";

// Add this type at the top of your file (or import from your types)
type RecentQuote = {
  id: string;
  status: string;
  createdAt: Date | string;
  customer: {
    firstName: string;
    lastName: string;
  };
};

export default async function DashboardPage() {
  // Enhanced stats
  const totalQuotes = await db.quote.count();
  const pendingQuotes = await db.quote.count({
    where: { status: "PENDING" }
  });
  const infoGatheringQuotes = await db.quote.count({
    where: { status: "INFORMATION_GATHERING" }
  });
  const quotedQuotes = await db.quote.count({
    where: { status: "QUOTED" }
  });
  const acceptedQuotes = await db.quote.count({
    where: { status: "ACCEPTED" }
  });
  const convertedQuotes = await db.quote.count({
    where: { status: "CONVERTED" }
  });
  const totalCustomers = await db.customer.count();

  // Recent quotes for activity
  const recentQuotes: RecentQuote[] = await db.quote.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const conversionRate = totalQuotes > 0 ? ((convertedQuotes / totalQuotes) * 100).toFixed(1) : "0";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'INFORMATION_GATHERING': return 'bg-blue-100 text-blue-800';
      case 'QUOTED': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-orange-100 text-orange-800';
      case 'CONVERTED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Welcome to your Same Day Ramps admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">{totalQuotes}</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  New
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-orange-600">{pendingQuotes}</p>
              <p className="text-xs text-gray-500">Needs attention</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-green-600">{conversionRate}%</p>
              <p className="text-xs text-gray-500">Quotes to sales</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">{totalCustomers}</p>
              <p className="text-xs text-gray-500">Active customers</p>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-medium text-gray-900">Quote Status Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Pending
                    </span>
                    <span className="text-sm text-gray-600">{pendingQuotes}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Info Gathering
                    </span>
                    <span className="text-sm text-gray-600">{infoGatheringQuotes}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Quoted
                    </span>
                    <span className="text-sm text-gray-600">{quotedQuotes}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Accepted
                    </span>
                    <span className="text-sm text-gray-600">{acceptedQuotes}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Converted
                    </span>
                    <span className="text-sm text-gray-600">{convertedQuotes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-medium text-gray-900">Recent Quotes</h2>
            {recentQuotes.length > 0 ? (
              <div className="space-y-3">
                {recentQuotes.map((quote: RecentQuote, index: number) => (
                  <div key={quote.id}>
                    <div className="flex justify-between items-center py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm md:text-base font-medium text-gray-900">
                          {quote.customer.firstName} {quote.customer.lastName}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    {index < recentQuotes.length - 1 && <hr className="border-gray-200" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-600 text-sm md:text-base">No recent quotes to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 