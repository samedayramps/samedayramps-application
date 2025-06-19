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

export default function PricingCalculatorPage() {
  const [customerAddress, setCustomerAddress] = useState("");
  const [rampLength, setRampLength] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState<CalculatedPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCalculatedPrice(null);
    try {
      const res = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerAddress, rampLength: parseFloat(rampLength) }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Calculation failed");
      }
      const data = await res.json();
      setCalculatedPrice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Pricing Calculator</h1>
        <p className="text-sm text-gray-600 mb-6">
          Quickly calculate the estimated costs for a new ramp installation.
        </p>

        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">
                Customer Address
              </label>
              <AutocompleteInput
                value={customerAddress}
                onChange={setCustomerAddress}
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
              disabled={loading || !customerAddress || !rampLength}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calculator className="h-5 w-5" />}
              <span className="ml-2">{loading ? "Calculating..." : "Calculate Price"}</span>
            </button>
          </form>

          {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          
          {calculatedPrice && (
            <div className="mt-6 border-t pt-6 space-y-3">
              <h2 className="text-xl font-semibold">Estimated Price:</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium text-gray-600">Delivery Fee:</div>
                <div className="text-right text-gray-900">${calculatedPrice.deliveryFee}</div>
                
                <div className="font-medium text-gray-600">Installation Fee:</div>
                <div className="text-right text-gray-900">${calculatedPrice.installFee}</div>

                <div className="col-span-2 border-b my-1"></div>

                <div className="font-bold text-gray-800">Total Upfront Cost:</div>
                <div className="text-right font-bold text-gray-900">${calculatedPrice.upfrontCost}</div>
                
                <div className="font-bold text-gray-800">Monthly Rental Rate:</div>
                <div className="text-right font-bold text-gray-900">${calculatedPrice.monthlyRate}</div>
              </div>
              <p className="text-xs text-gray-500 text-center pt-2">
                Based on a distance of {calculatedPrice.distance} miles. This is an estimate and subject to change.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 