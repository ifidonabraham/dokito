import { Cross, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DokitoLogoProps {
  className?: string;
  showText?: boolean;
  stacked?: boolean;
}

export function DokitoLogo({ className, showText = true, stacked = false }: DokitoLogoProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-foreground",
        stacked && "items-start",
        className
      )}
      aria-label="DOKITO"
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
        <MapPin className="h-6 w-6" strokeWidth={2.4} />
        <Cross className="absolute h-3 w-3 text-white" strokeWidth={3} />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-sky-500" />
      </div>

      {showText && (
        <div className={cn("leading-none", stacked && "pt-0.5")}>
          <span className="block font-black tracking-normal text-foreground">
            DOK<span className="text-emerald-600">ITO</span>
          </span>
          {stacked && (
            <span className="mt-1 block text-[10px] font-medium leading-none text-muted-foreground">
              Local care, fast
            </span>
          )}
        </div>
      )}
    </div>
  );
}
