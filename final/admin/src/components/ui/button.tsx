import React, { useState } from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "signup" | "none";
};

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  className = "",
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const base =
    "inline-flex items-center justify-center px-4 py-1.5 text-sm transition-all duration-300 border relative overflow-hidden backdrop-blur-md rounded-[2rem] shadow-[inset_0_-2px_4px_rgba(255,255,255,0.1),_0_6px_12px_rgba(0,0,0,0.5)]";

  const variantStyles: Record<string, string> = {
    default:
      "bg-transparent text-white border-white/30 hover:bg-red-600/40 hover:border-red-700/40 hover:text-white",
    signup:
      "bg-[rgba(255,255,255,0.05)] text-white border-white/20 hover:bg-[rgba(255,0,0,0.25)] hover:border-[rgba(255,0,0,0.35)] hover:text-white",
    none: "bg-transparent text-white border-white/30", // no hover color; className handles it
  };

  const decorativeRing =
    "before:absolute before:inset-0 before:border before:border-white/10 before:pointer-events-none before:rounded-[2rem]";

  const glassDepth =
    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-2 after:bg-white/5 after:blur-sm after:rounded-b-[2rem] after:shadow-[0_4px_6px_rgba(255,255,255,0.05),_inset_0_2px_2px_rgba(255,255,255,0.1)]";

  const fontWeight = isClicked ? "font-bold" : "font-light";
  const pressEffect = isClicked ? "translate-y-[2px]" : "translate-y-0";

  return (
    <button
      className={clsx(
        base,
        fontWeight,
        pressEffect,
        variantStyles[variant],
        decorativeRing,
        glassDepth,
        className // overrides hover styles if needed
      )}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onMouseLeave={() => setIsClicked(false)}
      suppressHydrationWarning={true}
      {...props}
    />
  );
};
