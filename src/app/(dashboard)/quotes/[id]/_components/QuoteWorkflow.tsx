"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import PricingCalculator from "./PricingCalculator";
import { Quote } from "@/types";

interface QuoteWorkflowProps {
  quote: Quote;
  onUpdate: (updatedQuote: Quote) => void;
}

const stages = [
  { key: "PENDING", label: "Quote Requested" },
  { key: "INFORMATION_GATHERING", label: "Info Gathering" },
  { key: "QUOTED", label: "Price Provided" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "CONVERTED", label: "Rental Created" },
];

interface CalculatedPrice {
  deliveryFee: string;
  installFee: string;
  monthlyRate: string;
  upfrontCost: string;
  distance: string;
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
};

export default function QuoteWorkflow({ quote, onUpdate }: QuoteWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [calculatedPrice, setCalculatedPrice] = useState<CalculatedPrice | null>(null);
  const [rampLengthForQuote, setRampLengthForQuote] = useState<number | null>(null);

  // Reset calculator when quote status changes
  useEffect(() => {
    setCalculatedPrice(null);
    setRampLengthForQuote(null);
  }, [quote.status]);

  const currentStageIdx = stages.findIndex(s => s.key === quote.status);

  let nextAction: { label: string; action: string; show: boolean } = { label: "", action: "", show: false };
  if (quote.status === "PENDING") {
    nextAction = { label: "Mark Info Gathered", action: "markInfoGathered", show: true };
  } else if (quote.status === "INFORMATION_GATHERING") {
    nextAction = { label: "Provide Price", action: "providePrice", show: true };
  } else if (quote.status === "QUOTED") {
    nextAction = { label: "Mark as Accepted", action: "acceptQuote", show: true };
  } else if (quote.status === "ACCEPTED") {
    nextAction = { label: "Convert to Rental", action: "convertToRental", show: true };
  }

  const handlePriceCalculated = (price: CalculatedPrice, rampLength: number) => {
    setCalculatedPrice(price);
    setRampLengthForQuote(rampLength);
    setError(null);
  };

  const handleWorkflowAction = async (action: string) => {
    setLoading(true);
    setError(null);
    try {
      const body: {
        action: string;
        upfrontCost?: number;
        monthlyRate?: number;
        totalEstimatedCost?: number;
        rampLength?: number;
        deliveryFee?: number;
        installFee?: number;
      } = { action };
      
      if (action === "providePrice" && calculatedPrice && rampLengthForQuote) {
        body.upfrontCost = parseFloat(calculatedPrice.upfrontCost);
        body.monthlyRate = parseFloat(calculatedPrice.monthlyRate);
        body.totalEstimatedCost = parseFloat(calculatedPrice.upfrontCost) + parseFloat(calculatedPrice.monthlyRate);
        body.rampLength = rampLengthForQuote;
        body.deliveryFee = parseFloat(calculatedPrice.deliveryFee);
        body.installFee = parseFloat(calculatedPrice.installFee);
      }

      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      onUpdate(updated);
      setCalculatedPrice(null); 
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error advancing workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      {/* Stage Tracker */}
      <div className="flex items-center gap-2 mb-4">
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
            {idx < stages.length - 1 && <div className="w-full h-0.5 bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>
      
      <hr className="my-4"/>

      {/* Next Action */}
      <div className="mt-4">
        {nextAction.show && (
            <div>
              {nextAction.action === 'providePrice' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <PricingCalculator
                      customerAddress={quote.installationAddress}
                      onPriceCalculated={handlePriceCalculated}
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Calculated Quote</h3>
                      {calculatedPrice ? (
                        <div className="space-y-2 text-sm">
                          <p><strong>Distance:</strong> {calculatedPrice.distance} miles</p>
                          <p><strong>Ramp Length:</strong> {rampLengthForQuote} ft</p>
                          <hr className="my-2"/>
                          <p><strong>Delivery Fee:</strong> {formatCurrency(calculatedPrice.deliveryFee)}</p>
                          <p><strong>Standard Install Fee:</strong> {formatCurrency(calculatedPrice.installFee)}</p>
                          <p><strong>Monthly Rate:</strong> {formatCurrency(calculatedPrice.monthlyRate)}</p>
                          <hr className="my-2"/>
                          <p className="font-bold text-base">Upfront Cost: {formatCurrency(calculatedPrice.upfrontCost)}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Use the calculator to generate a price.</p>
                      )}
                    </div>
                    <button
                        onClick={() => handleWorkflowAction('providePrice')}
                        disabled={loading || !calculatedPrice}
                        className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                        Set Price & Mark as Quoted
                      </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleWorkflowAction(nextAction.action)}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin h-4 w-4" />} {nextAction.label}
                </button>
              )}
            </div>
        )}

        {currentStageIdx > 0 && quote.status !== 'CONVERTED' && (
           <button
            onClick={() => handleWorkflowAction('revertStage')}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 mt-4"
          >
            Revert to previous stage
          </button>
        )}
        
        {error && <div className="text-red-600 mt-2 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
      </div>

      {quote.status === "CONVERTED" && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200">
          Quote successfully converted to a rental!
        </div>
      )}
    </div>
  );
} 