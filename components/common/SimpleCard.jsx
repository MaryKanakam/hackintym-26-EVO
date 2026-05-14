import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`px-6 py-4 border-b border-[var(--border-color)] ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold text-[var(--text-primary)] ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
