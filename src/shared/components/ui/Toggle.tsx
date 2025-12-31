import { type FC } from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Toggle switch reutilizable
 * Ubicar en: src/shared/components/ui/Toggle.tsx
 */
export const Toggle: FC<ToggleProps> = ({
                                            checked,
                                            onChange,
                                            label,
                                            description,
                                            disabled = false,
                                            className = ''
                                        }) => {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <div className="flex-1">
                {label && (
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {label}
                    </label>
                )}
                {description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                )}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          focus:ring-offset-white dark:focus:ring-offset-gray-800
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}
        `}
            >
        <span
            className={`
            inline-block h-4 w-4 transform rounded-full
            bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
            </button>
        </div>
    );
};