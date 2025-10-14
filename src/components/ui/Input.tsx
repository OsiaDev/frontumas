// src/components/ui/Input.tsx
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="sr-only">{label}</label>
                )}
                <input
                    ref={ref}
                    className="w-full px-4 py-3 bg-black/20 border-2 border-[#004599]/30 rounded-lg placeholder-gray-400 text-white focus:ring-2 focus:ring-[#004599] focus:border-transparent transition-all duration-300"
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';