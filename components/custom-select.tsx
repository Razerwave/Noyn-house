"use client";

import { Children, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes } from "react";

type CustomSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & { onChange?: (event: ChangeEvent<HTMLSelectElement>) => void };
type SelectOption = { value: string; label: string; disabled: boolean };

export function CustomSelect({ className = "", children, value, defaultValue, name, onChange, disabled, "aria-label": ariaLabel }: CustomSelectProps) {
  const root = useRef<HTMLDivElement>(null);
  const options = Children.toArray(children).flatMap(child => {
    if (!child || typeof child !== "object" || !("props" in child)) return [];
    const option = child as { props: { value?: string; children?: ReactNode; disabled?: boolean } };
    return [{ value: String(option.props.value ?? option.props.children ?? ""), label: String(option.props.children ?? ""), disabled: Boolean(option.props.disabled) }];
  });
  const controlledValue = value == null ? undefined : String(value);
  const initialValue = controlledValue ?? (defaultValue == null ? options[0]?.value ?? "" : String(defaultValue));
  const [selected, setSelected] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(initialValue);
  const currentValue = controlledValue ?? selected;
  const selectedOption = options.find(option => option.value === currentValue) ?? options[0];

  useEffect(() => {
    function close(event: MouseEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function choose(option: SelectOption) {
    if (option.disabled || disabled) return;
    setSelected(option.value); setHighlighted(option.value); setOpen(false);
    onChange?.({ target: { name: name ?? "", value: option.value }, currentTarget: { name: name ?? "", value: option.value } } as ChangeEvent<HTMLSelectElement>);
  }

  function moveHighlight(direction: 1 | -1) {
    const enabled = options.filter(option => !option.disabled);
    const index = Math.max(0, enabled.findIndex(option => option.value === highlighted));
    setHighlighted(enabled[(index + direction + enabled.length) % enabled.length]?.value ?? "");
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(current => !current); }
    if (event.key === "Escape") setOpen(false);
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); moveHighlight(1); }
    if (event.key === "ArrowUp") { event.preventDefault(); setOpen(true); moveHighlight(-1); }
    if (event.key === "Home") { event.preventDefault(); setHighlighted(options.find(option => !option.disabled)?.value ?? ""); }
    if (event.key === "End") { event.preventDefault(); setHighlighted([...options].reverse().find(option => !option.disabled)?.value ?? ""); }
  }

  return <div ref={root} className={`custom-select-root ${className}`.trim()}>
    <input type="hidden" name={name} value={currentValue} readOnly />
    <button type="button" className="custom-select-trigger" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => setOpen(current => !current)} onKeyDown={onKeyDown}>
      <span>{selectedOption?.label ?? "Сонгоно уу"}</span><i aria-hidden="true" />
    </button>
    {open && <div className="custom-select-menu" role="listbox" aria-label={ariaLabel ?? name}>
      {options.map(option => <button key={option.value} type="button" role="option" aria-selected={option.value === currentValue} disabled={option.disabled} className={option.value === (highlighted || currentValue) ? "is-highlighted" : ""} onMouseEnter={() => setHighlighted(option.value)} onClick={() => choose(option)}>{option.label}{option.value === currentValue && <b aria-hidden="true">✓</b>}</button>)}
    </div>}
  </div>;
}
