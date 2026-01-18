import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(({ label, error, className, ...props }, ref) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-medium text-gray-400">{label}</label>}
            <input
                ref={ref}
                className={twMerge(
                    "bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all w-full",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
    );
});

export const Select = forwardRef(({ label, error, children, className, ...props }, ref) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-medium text-gray-400">{label}</label>}
            <select
                ref={ref}
                className={twMerge(
                    "bg-gray-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all w-full appearance-none",
                    error && "border-red-500",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
    );
});
