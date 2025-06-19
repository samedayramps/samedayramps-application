"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import AutocompleteInput from "@/components/ui/AutocompleteInput";

interface Settings {
  warehouseAddress: string;
  costPerMile: number;
  installFeePerFoot: number;
  rentalPricePerFoot: number;
  googleMapsApiKey: string | null;
  deliveryFlatFee: number;
  installFlatFee: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save settings");
      }
      const data = await res.json();
      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide after 3s
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="p-4 md:p-6 text-red-600 bg-red-50 rounded-md">
        Error loading settings: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage the variables used in the pricing calculator and other parts of the application.
        </p>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Pricing Variables */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Pricing Calculator</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="warehouseAddress" className="block text-sm font-medium text-gray-700">
                  Warehouse Address
                </label>
                <AutocompleteInput
                  value={settings?.warehouseAddress || ""}
                  onChange={(value) => setSettings(prev => prev ? { ...prev, warehouseAddress: value } : null)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Used as the starting point for delivery distance calculations.</p>
                {error && error.includes("warehouse address") && (
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="costPerMile" className="block text-sm font-medium text-gray-700">
                    Cost Per Mile ($)
                  </label>
                  <input
                    type="number"
                    id="costPerMile"
                    name="costPerMile"
                    step="0.01"
                    value={settings?.costPerMile || 0}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="deliveryFlatFee" className="block text-sm font-medium text-gray-700">
                    Delivery Flat Fee ($)
                  </label>
                  <input
                    type="number"
                    id="deliveryFlatFee"
                    name="deliveryFlatFee"
                    step="0.01"
                    value={settings?.deliveryFlatFee || 0}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="installFeePerFoot" className="block text-sm font-medium text-gray-700">
                    Install Fee / Foot ($)
                  </label>
                  <input
                    type="number"
                    id="installFeePerFoot"
                    name="installFeePerFoot"
                    step="0.01"
                    value={settings?.installFeePerFoot || 0}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="installFlatFee" className="block text-sm font-medium text-gray-700">
                    Install Flat Fee ($)
                  </label>
                  <input
                    type="number"
                    id="installFlatFee"
                    name="installFlatFee"
                    step="0.01"
                    value={settings?.installFlatFee || 0}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="rentalPricePerFoot" className="block text-sm font-medium text-gray-700">
                    Rental Price / Foot ($)
                  </label>
                  <input
                    type="number"
                    id="rentalPricePerFoot"
                    name="rentalPricePerFoot"
                    step="0.01"
                    value={settings?.rentalPricePerFoot || 0}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            {success && <div className="text-sm text-green-600">Settings saved successfully!</div>}
            {error && !error.includes("warehouse address") && <div className="text-sm text-red-600">Error: {error}</div>}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              <span className="ml-2">{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 