import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    loading,
    ...props
}) {
    const baseStyles = "relative font-bold text-white uppercase tracking-wider transition-all active:translate-y-1 active:shadow-3d-active disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-neon-blue text-black shadow-3d hover:bg-white",
        secondary: "bg-gray-800 text-white shadow-3d border border-gray-700 hover:bg-gray-700",
        danger: "bg-red-500 text-white shadow-3d hover:bg-red-400",
        outline: "bg-transparent border-2 border-neon-blue text-neon-blue shadow-none hover:bg-neon-blue/10"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Yuklanmoqda...
                </span>
            ) : children}
        </motion.button>
    );
}
