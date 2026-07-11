type EmptyStateProps = {
  icon?: string;
  message: string;
};

export function EmptyState({ icon = "—", message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-navy/15 py-8 text-center">
      <span className="text-lg text-navy-soft/50">{icon}</span>
      <p className="text-sm text-navy-soft/70">{message}</p>
    </div>
  );
}
