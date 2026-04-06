import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FilterCard({
  title = "Filtros",
  description,
  children,
  className,
  actionLabel = "Aplicar Filtros",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actionLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
          {children}
          <div className="md:col-span-2 xl:col-span-4">
            <Button className="w-full sm:w-auto">{actionLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
