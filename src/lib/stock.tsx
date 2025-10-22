import {memo, useMemo} from "react";
import {AlertCircle, Check, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {LOW_STOCK_THRESHOLD, OUT_OF_STOCK} from "@/config/app-constant";

interface StockCellProps {
    stock: number;
    className?: string;
}

interface StatusCellProps {
    status: string | null;
    onAcceptAction: (id: number) => void;
    onRejectAction: (id: number) => void;
    productId: number;
    isLoading?: boolean;
    className?: string;
}

const StockCell = memo<StockCellProps>(({stock, className}) => {
    const stockStatus = useMemo(() => {
        const isOutOfStock = stock === OUT_OF_STOCK;
        const isLowStock = stock < LOW_STOCK_THRESHOLD && stock > OUT_OF_STOCK;

        return {isOutOfStock, isLowStock};
    }, [stock]);

    const {isOutOfStock, isLowStock} = stockStatus;

    return (
        <div className={cn("flex items-center justify-center gap-2", className)}>
            {isOutOfStock ? (
                <div className="flex items-center gap-1.5">
                    <div
                        className="h-2 w-2 rounded-full bg-red-500 animate-pulse"
                        aria-hidden="true"
                    />
                    <span
                        className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums"
                        aria-label="Out of stock"
                    >
                        {stock}
                    </span>
                </div>
            ) : isLowStock ? (
                <div className="flex items-center gap-1.5">
                    <AlertCircle
                        className="h-3.5 w-3.5 text-amber-500"
                        aria-hidden="true"
                    />
                    <span
                        className="text-sm font-medium text-amber-600 dark:text-amber-400 tabular-nums"
                        aria-label={`${stock} units in stock - low stock warning`}
                    >
                        {stock}
                    </span>
                </div>
            ) : (
                <span
                    className="text-sm font-medium text-foreground tabular-nums"
                    aria-label={`${stock} units in stock`}
                >
                    {stock}
                </span>
            )}
        </div>
    );
});

StockCell.displayName = "StockCell";

const StatusCell = memo<StatusCellProps>(({
                                              status,
                                              onAcceptAction,
                                              onRejectAction,
                                              productId,
                                              isLoading = false,
                                              className
                                          }) => {
    const handleAccept = useMemo(
        () => () => onAcceptAction(productId),
        [onAcceptAction, productId]
    );

    const handleReject = useMemo(
        () => () => onRejectAction(productId),
        [onRejectAction, productId]
    );

    if (status === null) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAccept}
                    disabled={isLoading}
                    className="h-8  text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
                    aria-label="Accept product"
                >
                    <Check className="h-3.5 w-3.5 " aria-hidden="true"/>
                    Accept
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReject}
                    disabled={isLoading}
                    className={cn('h-8  text-xs font-medium bg-red-500 text-white hover:bg-red-600 hover:text-white dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors disabled:opacity-50', isLoading && 'opacity-50 cursor-not-allowed',
                        'border border-red-200 dark:border-red-800 ')}
                    aria-label="Reject product"
                >
                    <X className="h-3.5 w-3.5 " aria-hidden="true"/>
                    Reject
                </Button>
            </div>
        );
    }

    const isApproved = Boolean(status);

    return (
        <Badge
            className={cn(
                "text-xs font-medium  transition-colors inline-flex items-center",
                isApproved
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
                className
            )}
            variant="outline"
            aria-label={isApproved ? "Product approved" : "Product pending approval"}
        >
            {isApproved ? (
                <>
                    Approved
                </>
            ) : (
                <>
                    Pending
                </>
            )}
        </Badge>
    );
});

StatusCell.displayName = "StatusCell";

export {StatusCell, StockCell};
export type {StockCellProps, StatusCellProps};