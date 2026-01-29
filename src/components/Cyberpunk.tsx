import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface CyberpunkCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "alert" | "success";
}

export function CyberpunkCard({ children, className, variant = "default", ...props }: CyberpunkCardProps) {
  const borderColor = variant === "alert" ? "border-destructive" : variant === "success" ? "border-accent" : "border-primary";
  const glowColor = variant === "alert" ? "shadow-destructive/50" : variant === "success" ? "shadow-accent/50" : "shadow-primary/50";

  return (
    <div
      className={cn(
        "relative bg-card border-2 p-6 overflow-hidden group transition-all duration-300",
        borderColor,
        "hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]",
        `hover:${glowColor}`,
        className
      )}
      {...props}
    >
      {/* Corner Accents */}
      <div className={cn("absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4", borderColor)} />
      <div className={cn("absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4", borderColor)} />
      <div className={cn("absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4", borderColor)} />
      <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4", borderColor)} />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
      
      {children}
    </div>
  );
}

interface CyberpunkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "destructive";
}

export function CyberpunkButton({ children, className, variant = "primary", ...props }: CyberpunkButtonProps) {
  const baseStyles = "relative px-6 py-3 font-bold uppercase tracking-widest transition-all duration-200 clip-path-polygon hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[1px] active:translate-y-[1px]";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[4px_4px_0px_var(--color-secondary)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-[4px_4px_0px_var(--color-primary)]",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[4px_4px_0px_var(--color-primary)]",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
      {...props}
    >
      {children}
    </button>
  );
}

export function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("relative inline-block group", className)}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-secondary opacity-0 group-hover:opacity-70 group-hover:animate-pulse translate-x-[2px]">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-accent opacity-0 group-hover:opacity-70 group-hover:animate-pulse translate-x-[-2px]">
        {text}
      </span>
    </div>
  );
}
