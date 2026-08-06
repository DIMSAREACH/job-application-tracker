"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tag, Check, Plus, X, ChevronDown } from "lucide-react";

interface TagSelectDropdownProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const PRESET_TAGS = [
  "Remote",
  "Hybrid",
  "On-site",
  "Full-time",
  "Contract",
  "Part-time",
  "Internship",
  "Referral",
  "LinkedIn",
  "Recruiter",
  "Company Site",
  "High Priority",
  "Wishlist",
  "Frontend",
  "Backend",
  "Fullstack",
];

export function TagSelectDropdown({
  value = "",
  onChange,
  placeholder = "Select or type tags...",
}: TagSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse comma-separated value into array of trimmed tags
  const selectedTags = value
    ? value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateTags = (newTags: string[]) => {
    // Unique tags
    const unique = Array.from(new Set(newTags));
    onChange(unique.join(", "));
  };

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      updateTags([...selectedTags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    updateTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Filter preset suggestions by input
  const filteredPresets = PRESET_TAGS.filter((preset) =>
    preset.toLowerCase().includes(inputValue.toLowerCase().trim())
  );

  const isCustomNew =
    inputValue.trim() &&
    !PRESET_TAGS.some((p) => p.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !selectedTags.some((s) => s.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Outer Input Box */}
      <div
        onClick={() => setOpen(true)}
        className="group min-h-[44px] w-full flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-sm text-slate-900 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus-within:border-indigo-500 dark:focus-within:bg-slate-950 transition-all cursor-text"
      >
        {/* Render Selected Tag Badges */}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/30 transition-all"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="rounded-md p-0.5 hover:bg-indigo-500/20 hover:text-indigo-900 dark:hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Input element */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : "Add tag..."}
          className="flex-1 min-w-[120px] border-none bg-transparent p-0.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-0 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        {/* Dropdown Chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="ml-auto p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Popover Dropdown Menu */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-800 dark:bg-slate-950 backdrop-blur-xl">
          {/* Custom tag add prompt */}
          {isCustomNew && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add custom tag &quot;{inputValue.trim()}&quot;</span>
            </button>
          )}

          {/* Preset Suggestions */}
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Suggested Tags
          </div>

          <div className="flex flex-col gap-0.5">
            {filteredPresets.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className={`h-3.5 w-3.5 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    <span>{tag}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
