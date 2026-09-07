"use client";

import React, { useState, useEffect } from "react";
import { Hash, Check, Palette } from "lucide-react";

export interface ColorPreset {
  id: string;
  name: string;
  value: string;
}

export const PRESET_COLORS: ColorPreset[] = [
  { id: "coral", name: "Neural Coral", value: "#F58F7C" },
  { id: "blush", name: "Blush Rose", value: "#F2C4CE" },
  { id: "silver", name: "Platinum Silver", value: "#D6D6D6" },
  { id: "violet", name: "Electric Violet", value: "#A855F7" },
  { id: "emerald", name: "Emerald Neo", value: "#10B981" },
  { id: "amber", name: "Amber Flame", value: "#F97316" },
  { id: "cyan", name: "Cyber Cyan", value: "#06B6D4" },
  { id: "pink", name: "Neon Pink", value: "#EC4899" },
  { id: "indigo", name: "Royal Indigo", value: "#6366F1" },
  { id: "gold", name: "Golden Sun", value: "#EAB308" },
  {
    id: "lgbtq-rainbow",
    name: "LGBTQ+ Rainbow Light",
    value: "linear-gradient(135deg, #FF0018 0%, #FFA52C 20%, #FFFF41 40%, #008018 60%, #0000F9 80%, #8607D0 100%)",
  },
  {
    id: "rgb-chroma",
    name: "RGB Chroma Light",
    value: "linear-gradient(135deg, #FF0055 0%, #7A00FF 25%, #00E5FF 50%, #00FF66 75%, #FFE600 100%)",
  },
];

export const SOLID_PALETTE = PRESET_COLORS;

interface BotColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function BotColorPicker({
  value,
  onChange,
  label = "Accent Color",
  className = "",
}: BotColorPickerProps) {
  const isHex =
    value?.startsWith("#") ||
    (!value?.includes("gradient") &&
      /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value));

  const [hexInput, setHexInput] = useState(() => {
    if (isHex) {
      return value?.startsWith("#") ? value : `#${value || "F58F7C"}`;
    }
    return "#F58F7C";
  });

  useEffect(() => {
    if (
      value &&
      (value.startsWith("#") ||
        (!value.includes("gradient") &&
          /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)))
    ) {
      setHexInput(value.startsWith("#") ? value : `#${value}`);
    }
  }, [value]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value.trim();
    if (!inputVal.startsWith("#")) {
      inputVal = "#" + inputVal;
    }
    setHexInput(inputVal);

    if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(inputVal)) {
      onChange(inputVal);
    }
  };

  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedHex = e.target.value.toUpperCase();
    setHexInput(pickedHex);
    onChange(pickedHex);
  };

  const matchedPreset = PRESET_COLORS.find(
    (p) => p.value.toLowerCase() === value?.toLowerCase()
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Active Color Badge */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white/80">{label}</label>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)] border border-white/20 inline-block shrink-0"
            style={{ background: value || "#F58F7C" }}
          />
          <span className="text-white/80 font-medium truncate max-w-[150px]">
            {matchedPreset
              ? matchedPreset.name
              : value?.startsWith("#")
              ? value
              : "Custom Style"}
          </span>
        </div>
      </div>

      {/* Color Palette Swatches */}
      <div className="flex flex-wrap gap-2.5 items-center">
        {PRESET_COLORS.map((item) => {
          const isSelected = value?.toLowerCase() === item.value.toLowerCase();
          return (
            <button
              key={item.id}
              type="button"
              title={item.name}
              onClick={() => {
                if (item.value.startsWith("#")) {
                  setHexInput(item.value);
                }
                onChange(item.value);
              }}
              className={`relative w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                isSelected
                  ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10 ring-2 ring-offset-2 ring-offset-[#1b1a1e] ring-coral-400"
                  : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
              }`}
              style={{ background: item.value }}
            >
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Hex / Hash Value Input & Native Color Picker */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Hash className="w-3.5 h-3.5 text-white/40" />
            <span>Custom Hex / Hash Value</span>
          </div>
          <span className="text-[11px] text-white/30">Enter #RRGGBB or pick visually</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Visual Picker Trigger Button */}
          <div className="relative group shrink-0">
            <label
              htmlFor="native-color-picker"
              className="w-11 h-11 rounded-xl border border-white/20 flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform overflow-hidden relative"
              style={{
                background: isHex
                  ? hexInput.startsWith("#")
                    ? hexInput
                    : `#${hexInput}`
                  : value,
              }}
              title="Click to open color picker wheel"
            >
              <Palette className="w-4 h-4 text-white drop-shadow-md opacity-80 group-hover:opacity-100" />
            </label>
            <input
              id="native-color-picker"
              type="color"
              value={
                isHex && /^#[A-Fa-f0-9]{6}$/.test(hexInput)
                  ? hexInput
                  : "#F58F7C"
              }
              onChange={handleNativeColorPick}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>

          {/* Hex Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#F58F7C"
              maxLength={9}
              className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm placeholder-white/20 focus:outline-none focus:border-coral-400/60 focus:ring-1 focus:ring-coral-400/30 transition-all uppercase"
            />
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={() => {
              if (
                /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(
                  hexInput
                )
              ) {
                onChange(hexInput);
              }
            }}
            className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all hover:border-coral-400/40 active:scale-95"
          >
            Apply Hex
          </button>
        </div>
      </div>
    </div>
  );
}
