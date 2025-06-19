"use client";

import { useState } from "react";
import AutocompleteInput from "@/components/ui/AutocompleteInput";
import { Loader2, Calculator } from "lucide-react";

interface CalculatedPrice {
  deliveryFee: string;
  installFee: string;
  monthlyRate: string;
  upfrontCost: string;
  distance: string;
}

interface PricingCalculatorProps {
  customerAddress: string;
  onPriceCalculated: (price: CalculatedPrice, rampLength: number) => void;
  initialRampLength?: string;
}

export default function PricingCalculator({ customerAddress, onPriceCalculated, initialRampLength = "" }: PricingCalculatorProps) {
  const [address, setAddress] = useState(customerAddress);
  const [rampLength, setRampLength] = useState(initialRampLength);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerAddress: address, rampLength: parseFloat(rampLength) }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Calculation failed");
      }
      const data = await res.json();
      onPriceCalculated(data, parseFloat(rampLength));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
       <h3 className="text-lg font-semibold mb-2">Pricing Calculator</h3>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">
              Customer Address
            </label>
            <AutocompleteInput
              value={address}
              onChange={setAddress}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="rampLength" className="block text-sm font-medium text-gray-700">
              Ramp Length (feet)
            </label>
            <input
              type="number"
              id="rampLength"
              value={rampLength}
              onChange={(e) => setRampLength(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !address || !rampLength}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calculator className="h-5 w-5" />}
            <span className="ml-2">{loading ? "Calculating..." : "Calculate Price"}</span>
          </button>
        </form>

        {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
    </div>
  );
} 