import * as React from "react"
import styles from "./styles/Button.module.css"
import Link from "next/link";

type ButtonVariant = 'full' | 'outline' | 'text' | 'full-white' | 'soft-red';
type ButtonAlign = 'left' | 'center' | 'right';

interface ButtonProps extends React.ComponentProps<"button"> {
    visible?: boolean;
    available?: boolean;
    variant?: ButtonVariant
    align?: ButtonAlign
    iconLeft?: React.ReactNode
    iconRight?: React.ReactNode
    children: React.ReactNode
    href?: string
}

function Button({
    visible = true,
    available = true,
    variant = 'full',
    className,
    align = 'center',
    iconLeft,
    iconRight,
    children,
    href,
    ...props
    }: ButtonProps) {

    if (!visible) return null;

    const getVariantStyle = (variant: ButtonVariant) => {
        if (variant === 'outline') return styles.button_outline;
        if (variant === 'text') return styles.button_text;
        if (variant === 'full-white') return styles.button_full_white;
        if (variant === 'soft-red') return styles.button_soft_red;
        else return styles.button
    }

    const getAlignStyle = (align: ButtonAlign) => {
        if (align === 'left') return styles.button_left;
        if (align === 'right') return styles.button_right;
        else return styles.button_center;
    }

    const getAvailableStyle = (available: boolean) => {
        if (!available) return styles.not_available;
    }

    const buttonClassName = `
        ${styles.button} 
        ${getVariantStyle(variant)} 
        ${getAlignStyle(align)} 
        ${getAvailableStyle(available)} 
        ${className || ''}
    `;

    if (href) {
        return (
            <Link
                href={href}
                className={buttonClassName}
            >
                {iconLeft && <div className={styles.icon}>{iconLeft}</div>}
                {children}
                {iconRight && <div className={styles.icon}>{iconRight}</div>}
            </Link>
        );
    }

    return (
        <button
            className={buttonClassName}
            onClick={available ? props.onClick : undefined}
            {...props}
        >
            {iconLeft && <div className={styles.icon}>{iconLeft}</div>}
            {children}
            {iconRight && <div className={styles.icon}>{iconRight}</div>}
        </button>
    );
}

export { Button }
