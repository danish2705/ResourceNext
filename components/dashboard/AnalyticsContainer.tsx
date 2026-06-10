interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AnalyticsContainer({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}