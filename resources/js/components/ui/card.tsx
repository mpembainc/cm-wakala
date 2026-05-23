import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  as?: React.ElementType;
}

function Card({ className, as: Component = "div", ...props }: CardProps) {
  return (
    <Component
      data-slot="card"
      className={cn(
        "bg-white rounded-lg border border-gray-200/80 p-5 shadow-xs",
        className
      )}
      {...props}
    />
  );
}

export { Card };
