import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4.5" aria-hidden>
        <path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-base font-semibold tracking-tight">Stockly</span>
    </div>
  );
}
