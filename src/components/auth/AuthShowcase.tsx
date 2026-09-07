"use client";

import React from "react";
import Image from "next/image";

export function AuthShowcase() {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden select-none border-r border-[#4F4F51]/30 bg-[#1E1D22]">
      <Image
        src="/images/auth-bg.jpg"
        alt="Executive Office Workspace"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-center"
        quality={90}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#2C2B30]/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#19181C]/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
