import { cn } from "@/lib/utils";
import React from "react";

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glass";
}

export function ModernCard({ children, className, variant = "default", ...props }: ModernCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        variant === "default" 
          ? "bg-card text-card-foreground shadow-sm hover:shadow-md border-border/50" 
          : "bg-background/60 backdrop-blur-md border-white/20 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function ModernButton({ 
  children, 
  className, 
  variant = "primary", 
  size = "md",
  ...props 
}: ModernButtonProps) {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-8 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ModernText({ text, className, gradient = false }: { text: string; className?: string; gradient?: boolean }) {
  return (
    <span 
      className={cn(
        "font-sans tracking-tight",
        gradient ? "bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600" : "text-foreground",
        className
      )}
    >
      {text}
    </span>
  );
}
