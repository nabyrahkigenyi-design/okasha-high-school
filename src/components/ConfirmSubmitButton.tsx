"use client";

import * as React from "react";

export function ConfirmSubmitButton({
  children,
  confirmText = "Are you sure?",
  className = "",
  title,
}: {
  children: React.ReactNode;
  confirmText?: string;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      title={title}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}