import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'toggle';
    isLoading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    ...props
}: ButtonProps) => {
    const variantClass = variant === 'primary' ? 'btn-primary'
        : variant === 'secondary' ? 'btn-secondary'
            : 'btn-toggle';

    return (
        <button
            className={`btn ${variantClass} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <span className="anim-pulse">⏳</span> : null}
            {children}
        </button>
    );
};
