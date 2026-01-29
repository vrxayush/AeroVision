import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  inset?: boolean;
}

export function NeumorphicCard({ children, className, inset = false, ...props }: NeumorphicCardProps) {
  return (
    <div
      className={cn(
        "bg-background rounded-3xl transition-all duration-300",
        inset 
          ? "shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)]" 
          : "shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "destructive";
  isActive?: boolean;
}

export function NeumorphicButton({ children, className, variant = "primary", isActive = false, ...props }: NeumorphicButtonProps) {
  const baseStyles = "px-6 py-3 font-semibold rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center";
  
  const variants = {
    primary: "text-primary hover:text-primary/80",
    secondary: "text-foreground hover:text-foreground/80",
    destructive: "text-destructive hover:text-destructive/80",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        isActive 
          ? "shadow-[inset_5px_5px_10px_var(--shadow-dark),inset_-5px_-5px_10px_var(--shadow-light)]" 
          : "shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function NeumorphicText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("font-sans tracking-tight text-foreground/80 drop-shadow-sm", className)}>
      {text}
    </span>
  );
}
