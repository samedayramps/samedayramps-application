"use client";

import { useState } from "react";
import { Rental } from "@/types";
import { CheckCircle, Loader2 } from "lucide-react";

interface RentalWorkflowProps {
  rental: Rental;
  onUpdate: (rental: Rental) => void;
}

const stages = [
  { key: "PENDING", label: "Pending" },
  { key: "AGREEMENT_SENT", label: "Agreement Sent" },
  { key: "AGREEMENT_SIGNED", label: "Agreement Signed" },
  { key: "INSTALLATION_SCHEDULED", label: "Installation Scheduled" },
  { key: "ACTIVE", label: "Active" },
  { key: "REMOVAL_SCHEDULED", label: "Removal Scheduled" },
  { key: "COMPLETED", label: "Completed" },
];

export default function RentalWorkflow({ rental, onUpdate }: RentalWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStageIdx = stages.findIndex(s => s.key === rental.status);

  const getNextAction = () => {
    switch (rental.status) {
      case "PENDING":
        return { label: "Send Agreement", action: "sendAgreement" };
      case "AGREEMENT_SENT":
        return { label: "Mark Agreement Signed", action: "markAgreementSigned" };
      case "AGREEMENT_SIGNED":
        return { label: "Schedule Installation", action: "scheduleInstallation" };
      case "INSTALLATION_SCHEDULED":
        return { label: "Mark Installed", action: "markInstalled" };
      case "ACTIVE":
        return { label: "Schedule Removal", action: "scheduleRemoval" };
      case "REMOVAL_SCHEDULED":
         return { label: "Mark Complete", action: "completeRemoval" };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  const handleWorkflowAction = async (action: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rentals/${rental.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update rental status");
      }

      const updatedRental = await res.json();
      onUpdate(updatedRental);

    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Rental Progress</h3>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {stages.map((stage, idx) => (
          <div key={stage.key} className="flex items-center gap-1.5 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
              idx < currentStageIdx ? "bg-green-500 text-white border-green-500" :
              idx === currentStageIdx ? "bg-blue-600 text-white border-blue-600 animate-pulse" :
              "bg-gray-200 text-gray-400 border-gray-200"
            }`}>
              {idx < currentStageIdx ? <CheckCircle className="h-4 w-4" /> : idx + 1}
            </div>
            <span className={`text-sm ${idx === currentStageIdx ? "font-semibold text-blue-700" : "text-gray-500"}`}>{stage.label}</span>
            {idx < stages.length - 1 && <div className="w-full h-0.5 bg-gray-200 mx-2 flex-1" />}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center gap-4">
        {nextAction && (
            <button
              onClick={() => handleWorkflowAction(nextAction.action)}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin h-4 w-4" />} {nextAction.label}
            </button>
        )}

        {currentStageIdx > 0 && rental.status !== 'COMPLETED' && (
           <button
            onClick={() => handleWorkflowAction('revertStage')}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Revert
          </button>
        )}
      </div>

      {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}

       {rental.status === "COMPLETED" && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200">
          This rental is complete. You can revert it to &apos;Removal Scheduled&apos; if needed.
           <button
            onClick={() => handleWorkflowAction('revertStage')}
            disabled={loading}
            className="ml-4 px-4 py-1 bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500 disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Revert'}
          </button>
        </div>
      )}
    </div>
  );
} 