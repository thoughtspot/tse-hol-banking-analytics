import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  icon,
}: PageHeaderProps) {
  return (
    <section className="bg-gradient-to-br from-navy-900 to-navy-700 text-white">
      <div className="mx-auto flex max-w-7xl items-start gap-4 px-4 py-10 sm:px-6">
        <div className="hidden rounded-xl bg-white/10 p-3 ring-1 ring-white/15 sm:block">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-brand-100/90">{description}</p>
        </div>
      </div>
    </section>
  );
}
