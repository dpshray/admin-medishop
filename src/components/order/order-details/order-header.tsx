import {memo} from "react";
import {Button} from "@/components/ui/button";
import {Check, Copy, Download, Printer} from "lucide-react";

const OrderHeader = memo(({
                              orderCode,
                              copied,
                              onCopy,
                              onPrint
                          }: {
    orderCode: string
    copied: boolean
    onCopy: () => void
    onPrint: () => void
}) => (
    <div className="border-b bg-gradient-to-br from-primary/5 to-purple-50/50 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary to-[#6b4fc0] bg-clip-text text-transparent">
                    Order Details
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <code
                        className="text-xs sm:text-sm bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-primary/20 font-mono font-semibold shadow-sm break-all">
                        #{orderCode}
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCopy}
                        className="border border-transparent hover:border-primary/10 transition-all h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg flex-shrink-0"
                        aria-label="Copy order code"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true"/>
                        ) : (
                            <Copy className="h-3.5 w-3.5 text-primary" aria-hidden="true"/>
                        )}
                    </Button>
                </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap items-start print:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrint}
                    className="border hover:bg-muted/50 hover:border-primary/40 transition-all text-xs sm:text-sm"
                    aria-label="Print order"
                >
                    <Printer className="h-3.5 w-3.5" aria-hidden="true"/>
                    <span className="font-medium">Print</span>
                </Button>
                <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/80 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                    disabled
                    aria-label="Download order"
                >
                    <Download className="h-3.5 w-3.5" aria-hidden="true"/>
                    <span className="font-medium">Download</span>
                </Button>
            </div>
        </div>
    </div>
))

OrderHeader.displayName = 'OrderHeader'

export default OrderHeader