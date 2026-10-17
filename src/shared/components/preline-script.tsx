"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type HSWindow = Window & {
  HSStaticMethods?: { autoInit: (collection?: string | string[]) => void };
};

export function PrelineScript() {
  const pathname = usePathname();

  useEffect(() => {
    import("preline").then(() => {
      (window as HSWindow).HSStaticMethods?.autoInit();
    });
  }, [pathname]);

  return null;
}
