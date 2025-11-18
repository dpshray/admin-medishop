import {memo} from "react";
import {FileText} from "lucide-react";

const OrderNotes = memo(({description, giftWrap, giftWrapRemarks}: {
    description?: string
    giftWrap?: boolean
    giftWrapRemarks?: string
}) => (
    <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true"/>
            Order Notes
        </h2>
        <div
            className="bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {description}
            </p>
        </div>
        {giftWrap && giftWrapRemarks && (
            <div className="space-y-3 mt-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" aria-hidden="true"/>
                    Gift Wrap
                </h3>
                <div
                    className="bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {giftWrapRemarks}
                    </p>
                </div>
            </div>
        )}
    </section>
))

OrderNotes.displayName = 'OrderNotes'

export default OrderNotes