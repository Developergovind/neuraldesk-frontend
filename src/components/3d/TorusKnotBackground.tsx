"use client";

import dynamic from "next/dynamic";

export const TorusKnotBackground = dynamic(
  () => import("./Luminous3DBackground").then((mod) => mod.Luminous3DBackground),
  { ssr: false }
);

export default TorusKnotBackground;

