export function Toast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-navy/10 bg-white/95 px-4 py-2 text-xs font-medium text-navy shadow-[0_4px_16px_rgba(43,49,58,0.12)]">
      <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
      {message}
    </div>
  );
}
