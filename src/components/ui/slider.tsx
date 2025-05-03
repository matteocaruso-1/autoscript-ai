// src/components/ui/slider.tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Whether to show the floating tooltip above the thumb */
  showTooltip?: boolean;
  /**
   * Render function for tooltip content.
   * Receives the rounded value (benchmark) and should return ReactNode.
   */
  tooltipContent?: (value: number) => React.ReactNode;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showTooltip = true, tooltipContent, ...props }, ref) => {
  // Internal state holds current slider values (array for multi-thumb support)
  const [internalValue, setInternalValue] = React.useState<number[]>(
    (props.defaultValue as number[]) ??
      (props.value as number[]) ??
      [50]
  );

  // Round value to nearest benchmark (multiples of 10 between 50 and 250)
  const roundToBenchmark = (v: number) => {
    const min = 50;
    const max = 250;
    const step = 10;
    const rounded = Math.round(v / step) * step;
    return Math.max(min, Math.min(max, rounded));
  };

  // Sync external `value` prop into internal state, rounding to benchmarks
  React.useEffect(() => {
    if (props.value !== undefined) {
      const vals = (props.value as number[]).map(roundToBenchmark);
      setInternalValue(vals);
    }
  }, [props.value]);

  // Handle value changes: round to benchmarks, update state, notify parent
  const handleValueChange = (newVals: number[]) => {
    const rounded = newVals.map(roundToBenchmark);
    setInternalValue(rounded);
    props.onValueChange?.(rounded);
  };

  // Render each thumb, optionally wrapped in a tooltip
  const renderThumb = (rawValue: number, idx: number) => {
    const value = roundToBenchmark(rawValue);

    const thumbEl = (
      <SliderPrimitive.Thumb
        key={idx}
        className={cn(
          "block h-5 w-5 rounded-full bg-[#222] border-2 border-purple-600",
          "shadow-[0_0_6px_rgba(168,85,247,0.8)] hover:shadow-[0_0_10px_rgba(168,85,247,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
          "transition-all duration-200 hover:scale-110"
        )}
      />
    );

    if (!showTooltip) return thumbEl;

    return (
      <TooltipProvider key={idx}>
        <Tooltip>
          <TooltipTrigger asChild>{thumbEl}</TooltipTrigger>
          <TooltipContent
            sideOffset={8}
            side={props.orientation === "vertical" ? "right" : "top"}
            className="px-3 py-1 text-sm bg-[#222] text-white rounded-lg shadow-lg border border-purple-500/20"
          >
            {tooltipContent ? tooltipContent(value) : `${value} chars`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      {...props}
      min={50}
      max={250}
      step={10}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:w-auto",
        className
      )}
      onValueChange={handleValueChange}
      value={internalValue}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative grow overflow-hidden rounded-full bg-[#111] ring-1 ring-gray-800",
          "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=vertical]:h-full"
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "absolute bg-gradient-to-r from-purple-600 to-purple-800",
            "shadow-[0_0_10px_rgba(168,85,247,0.7)]",
            "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {internalValue.map((val, i) => renderThumb(val, i))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = "Slider";

export { Slider };