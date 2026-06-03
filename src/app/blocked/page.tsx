"use client";

import { useRouter } from "next/navigation";

export default function BlockedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6 text-center -mt-8">


      <div className="relative z-10 flex flex-col items-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl border border-white/8 bg-white/[0.03] flex items-center justify-center mb-10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {/* Eyebrow */}
        <p className="text-[11px] font-medium tracking-widest uppercase text-violet-400/60 mb-4">
          Aniwatsu Security
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-white mb-4 tracking-tight">
          Developer tools detected
        </h1>

        {/* Divider */}
        <div className="w-8 h-px bg-white/10 mb-5" />

        {/* Description */}
        <p className="text-slate-500 text-sm leading-7 max-w-sm mb-12">
          Close your developer tools to continue.
        </p>

        {/* Button */}
        <button
          onClick={() => router.push("/")}
          className="group flex items-center gap-2.5 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 text-white/70 hover:text-white px-7 py-3 rounded-xl text-sm font-medium transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity -translate-x-0.5 group-hover:-translate-x-1 transition-transform duration-200">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to home
        </button>

      </div>
    </main>
  );
}
