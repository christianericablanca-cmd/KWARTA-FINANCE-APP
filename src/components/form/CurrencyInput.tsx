"use client";

import { useState, useEffect } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  required?: boolean;
  min?: number;
  placeholder?: string;
}

function formatWithCommas(val: number): string {
  if (!val && val !== 0) return "";
  return val.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function stripCommas(s: string): string {
  return s.replace(/,/g, "");
}

function filterMultipleDecimals(s: string): string {
  const dotIndex = s.indexOf(".");
  if (dotIndex === -1) return s;
  const afterFirstDot = s.slice(dotIndex + 1).replace(/\./g, "");
  return s.slice(0, dotIndex + 1) + afterFirstDot;
}

export default function CurrencyInput({ value, onChange, className, required, min, placeholder }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!focused && value) {
      setText(formatWithCommas(value));
    }
  }, [value, focused]);

  const handleFocus = () => {
    setFocused(true);
    if (value) {
      setText(String(value));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = stripCommas(e.target.value);
    raw = filterMultipleDecimals(raw);

    if (min !== undefined && min >= 0) {
      raw = raw.replace(/-/g, "");
    }

    setText(raw);

    if (raw === "" || raw === ".") {
      onChange(0);
      return;
    }

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    let raw = stripCommas(text);
    raw = filterMultipleDecimals(raw);

    if (min !== undefined && min >= 0) {
      raw = raw.replace(/-/g, "");
    }

    if (raw === "" || raw === ".") {
      const fallback = min !== undefined && min > 0 ? min : 0;
      onChange(fallback);
      setText(fallback === 0 ? "" : formatWithCommas(fallback));
      return;
    }

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      let clamped = parsed;
      if (min !== undefined && clamped < min) {
        clamped = min;
      }
      onChange(clamped);
      setText(formatWithCommas(clamped));
    } else {
      const fallback = min !== undefined && min > 0 ? min : 0;
      onChange(fallback);
      setText(fallback === 0 ? "" : formatWithCommas(fallback));
    }
  };

  const displayValue = focused ? text : (value ? formatWithCommas(value) : "");

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      className={className}
      required={required}
      placeholder={placeholder}
    />
  );
}
