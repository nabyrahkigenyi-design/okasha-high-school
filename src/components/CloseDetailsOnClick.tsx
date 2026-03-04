"use client";

import { ReactNode } from "react";

export default function CloseDetailsOnClick({ children }: { children: ReactNode }) {
  function handleClick(e: React.MouseEvent) {
    const details = (e.currentTarget as HTMLElement).closest("details");
    if (details) {
      details.removeAttribute("open");
    }
  }

  return <div onClick={handleClick}>{children}</div>;
}