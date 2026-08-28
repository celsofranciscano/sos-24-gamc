import Link from "next/link";

import { APP_NAME } from "@/constants/org";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PagePlaceholderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function PagePlaceholder({
  title,
  description = "Este módulo está en construcción. La estructura de rutas ya está lista para el equipo de desarrollo.",
  icon,
  className,
}: PagePlaceholderProps) {
  return (
    <Card
      className={cn("border-dashed bg-muted/30 shadow-none", className)}
      data-slot="page-placeholder"
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
              {icon}
            </div>
          ) : null}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Separator />
        <p className="text-xs text-muted-foreground">
          {APP_NAME} · Plataforma central de coordinación de emergencias
        </p>
      </CardContent>
    </Card>
  )
}

export function PlaceholderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}
