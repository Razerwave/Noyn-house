import type { SelectHTMLAttributes } from "react";

type CustomSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function CustomSelect({ className = "", children, ...props }: CustomSelectProps) {
  return <select {...props} className={`custom-select ${className}`.trim()}>{children}</select>;
}
