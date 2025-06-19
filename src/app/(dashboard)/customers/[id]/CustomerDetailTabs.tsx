"use client";

import { useState } from "react";
import { Plus, Mail, ClipboardList, MessageCircle, FileText } from "lucide-react";

interface Quote {
  id: string;
  status: string;
  createdAt: string;
}

interface Communication {
  id: string;
  type: string;
  date: string;
  summary?: string;
  notes?: string;
}

interface Task {
  id: string;
  status: string;
  dueDate?: string;
  description: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  quotes: Quote[];
  communications: Communication[];
  tasks: Task[];
}

const tabs = [
  { key: "quotes", label: "Quotes", icon: FileText },
  { key: "rentals", label: "Rentals", icon: ClipboardList },
  { key: "communications", label: "Communications", icon: MessageCircle },
  { key: "tasks", label: "Tasks", icon: Mail },
];

export default function CustomerDetailTabs({ customer }: { customer: Customer }) {
  const [activeTab, setActiveTab] = useState("quotes");

  return (
    <div>
      {/* Tabs Navigation */}
      <div role="tablist" aria-label="Customer detail tabs" className="flex gap-2 border-b border-gray-200 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              tabIndex={activeTab === tab.key ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" className="mt-4">
        {activeTab === "quotes" && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Quotes</h2>
            {customer.quotes && customer.quotes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.quotes.map((quote: Quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-blue-700">{quote.id}</td>
                        <td className="px-4 py-2 text-sm">{quote.status}</td>
                        <td className="px-4 py-2 text-sm">{new Date(quote.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">No quotes found.</div>
            )}
          </div>
        )}

        {activeTab === "rentals" && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Rentals</h2>
            <div className="text-gray-500">No rentals yet.</div>
          </div>
        )}

        {activeTab === "communications" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Communications</h2>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Plus className="h-4 w-4" /> Add Communication
              </button>
            </div>
            {customer.communications && customer.communications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.communications.map((comm: Communication) => (
                      <tr key={comm.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{comm.type}</td>
                        <td className="px-4 py-2 text-sm">{new Date(comm.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-sm">{comm.summary || comm.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">No communications found.</div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Plus className="h-4 w-4" /> Add Task
              </button>
            </div>
            {customer.tasks && customer.tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.tasks.map((task: Task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{task.status}</td>
                        <td className="px-4 py-2 text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-2 text-sm">{task.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">No tasks found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 