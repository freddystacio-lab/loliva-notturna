"use client";

import {ChevronDown} from "lucide-react";
import {useEffect, useId, useRef, useState} from "react";

export type SelectOption = {value: string; label: string; icon?: React.ReactNode};

type RefinedSelectProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  ariaLabel: string;
  onChange?: (value: string) => void;
  compact?: boolean;
  className?: string;
};

export function RefinedSelect({name, value, defaultValue = "", options, ariaLabel, onChange, compact = false, className = ""}: RefinedSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const currentValue = value ?? internalValue;
  const selected = options.find((option) => option.value === currentValue) ?? options[0];

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    if (value === undefined) setInternalValue(option.value);
    onChange?.(option.value);
    setActiveIndex(index);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex); else setOpen(true);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const selectedIndex = Math.max(0, options.findIndex((option) => option.value === currentValue));
      const base = open ? activeIndex : selectedIndex;
      setActiveIndex((base + direction + options.length) % options.length);
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className={`refined-select ${compact ? "refined-select--compact" : ""} ${className}`}>
      {name && <input type="hidden" name={name} value={currentValue}/>}
      <button
        type="button"
        className="refined-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          setActiveIndex(Math.max(0, options.findIndex((option) => option.value === currentValue)));
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="refined-select__value">{selected?.icon}<span>{selected?.label}</span></span>
        <ChevronDown aria-hidden="true" size={compact ? 14 : 16}/>
      </button>
      {open && (
        <div id={listboxId} className="refined-select__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button
              type="button"
              key={option.value}
              role="option"
              aria-selected={option.value === currentValue}
              className={`refined-select__option ${index === activeIndex ? "is-active" : ""}`}
              onPointerEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
            >
              {option.icon}<span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
