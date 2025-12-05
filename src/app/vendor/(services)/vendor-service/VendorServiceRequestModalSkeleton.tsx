const VendorServiceRequestModalSkeleton = () => {
    return (
        <div className="space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-5 w-10 rounded bg-muted" />
                    <div className="h-5 w-40 rounded bg-muted" />
                </div>
                <div className="h-5 w-32 rounded bg-muted" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="h-3 w-20 rounded bg-muted mb-1" />
                    <div className="h-4 w-24 rounded bg-muted" />
                </div>
                <div>
                    <div className="h-3 w-20 rounded bg-muted mb-1" />
                    <div className="h-5 w-20 rounded bg-muted" />
                </div>
                <div>
                    <div className="h-3 w-20 rounded bg-muted mb-1" />
                    <div className="h-5 w-20 rounded bg-muted" />
                </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="flex flex-wrap gap-2">
                    <div className="h-5 w-16 rounded bg-muted" />
                    <div className="h-5 w-20 rounded bg-muted" />
                    <div className="h-5 w-14 rounded bg-muted" />
                </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
                <div className="h-3 w-10 rounded bg-muted" />
                <div className="flex flex-wrap gap-2">
                    <div className="h-5 w-14 rounded bg-muted" />
                    <div className="h-5 w-20 rounded bg-muted" />
                    <div className="h-5 w-16 rounded bg-muted" />
                </div>
            </div>

            <div className="pt-3 border-t border-border space-y-1">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-5 w-32 rounded bg-muted" />
            </div>

            <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
};

export default VendorServiceRequestModalSkeleton;
