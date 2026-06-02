import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  icon?: ReactNode;
  href?: string;
};

export default function SectionHeader({ title, icon, href }: Props) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-violet-500" />
        {icon && <span className="text-violet-400">{icon}</span>}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          aria-label={`View all ${title}`}
          className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
        >
          View all
          <ChevronRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
