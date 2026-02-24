import {memo} from "react";
import {Package} from "lucide-react";
import {FormatCurrency, StatusBadge} from "@/lib/helper";
import {Separator} from "@/components/ui/separator";

interface OrderData {
    created_at: string;
    payment_method: string;
    status: string;
    payment_status: string;
    price: number;
    delivery_charge: number;
}

const   OrderSummary = memo(({data}: { data: OrderData }) => (
    <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" aria-hidden="true"/>
            Order Summary
        </h2>
        <div
            className="space-y-2 bg-gradient-to-br from-muted/30 to-purple-50/30 p-4 rounded-xl border border-primary/10 hover:border-primary/20 transition-all">
            <dl className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                    <dt>Order Date</dt>
                    <dd className="font-semibold">{data.created_at}</dd>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <dt>Payment Method</dt>
                    <dd className="capitalize font-semibold">{data.payment_method}</dd>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <dt>Delivery Charge</dt>
                    <dd className="capitalize font-semibold">{FormatCurrency(data.delivery_charge)}</dd>
                </div>

                <div className="flex justify-between text-sm items-center">
                    <dt>Order Status</dt>
                    <dd><StatusBadge status={data.status}/></dd>
                </div>
                <div className="flex justify-between text-sm items-center">
                    <dt>Payment Status</dt>
                    <dd><StatusBadge status={data.payment_status}/></dd>
                </div>
            </dl>
            <Separator/>
            <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">
                    Total Amount
                </p>
                <p className="text-3xl font-bold text-primary break-all">
                    {FormatCurrency(data.price)}
                </p>
            </div>
        </div>
    </section>
))

OrderSummary.displayName = 'OrderSummary'

export default OrderSummary