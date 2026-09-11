import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

// Omit framer-motion props to avoid type conflicts if spread directly
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden';
    
    const variants = {
      primary: 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-[0_0_20px_rgba(245,143,124,0.35)] hover:shadow-[0_0_30px_rgba(245,143,124,0.55)] border border-coral-400/50',
      secondary: 'bg-obsidian-700 text-white hover:bg-obsidian-600 border border-white/10 shadow-[0_0_20px_rgba(242,196,206,0.2)]',
      outline: 'border border-white/20 bg-transparent hover:bg-white/5 text-white',
      ghost: 'bg-transparent hover:bg-white/10 text-white',
      glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 shadow-glass',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-6 text-sm',
      lg: 'h-14 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...(props as unknown as HTMLMotionProps<"button">)}
      >
        {isLoading && (
          <div className="relative w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[1.5px] border-t-white border-r-transparent border-b-white/20 border-l-transparent animate-spin" />
            <div className="absolute inset-0.5 rounded-full border border-r-blush-200 border-t-transparent border-b-transparent border-l-transparent animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          </div>
        )}
        {children}
        
        {/* Shimmer effect for primary button */}
        {variant === 'primary' && !disabled && !isLoading && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-shimmer" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
