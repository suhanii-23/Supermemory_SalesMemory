import { cn } from "../../lib/utils";

type SectionCardProps = {
  title: string;
  icon?: string;
  className?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, icon, className, children }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-navy/10 bg-white/80 p-5 shadow-[0_1px_2px_rgba(43,49,58,0.04)]",
        className,
      )}
    >
      <h3 className="font-serif-caps mb-4 flex items-center gap-2 text-sm text-navy">
        {icon && <span className="text-terracotta">{icon}</span>}
        {title}
      </h3>
      {children}
    </section>
  );
}
