"use client";

import React, { useRef, useEffect, useState } from "react";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  className?: string;
  disabled?: boolean;
}

export default function AutocompleteInput({ value, onChange, onPlaceSelected, className, disabled = false }: AutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (window.google && window.google.maps && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" }, // Optional: restrict to US
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
          if (onPlaceSelected) {
            onPlaceSelected(place);
          }
        }
      });
    }
  }, [onChange, onPlaceSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  }

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleChange}
      className={className}
      placeholder="Start typing an address..."
      disabled={disabled}
    />
  );
} 