import React from "react";
import { Button } from "@/components/ui/button";
import {cn} from "@/lib/utils";

interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    onClickAction?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

const ProductActionButton = React.memo(({
                                            icon: Icon,
                                            label,
                                            variant = 'secondary',
                                            onClickAction,
                                            disabled = false,
                                            type = 'button',
                                            className = ''
                                        }: ActionButtonProps) => {
    const variantStyles = {
        primary: 'bg-primaryColor hover:bg-primaryColor/80 text-white disabled:bg-primaryColor/50 border-0',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm disabled:bg-slate-100 disabled:text-slate-400',
        danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:bg-red-50/50 disabled:text-red-400'
    };

    return (
        <Button
            type={type}
            onClick={onClickAction}
            disabled={disabled}
            className={cn(
                'w-fit justify-start rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 h-auto',
                variantStyles[variant],
                'cursor-pointer',
                className
            )}
            aria-label={label}
        >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate flex-1 text-left">{label}</span>
        </Button>
    );
});

ProductActionButton.displayName = 'ProductActionButton';

export default ProductActionButton;