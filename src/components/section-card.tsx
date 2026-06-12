import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[28px] border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900", className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
