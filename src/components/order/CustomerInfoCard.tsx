'use client'
import {User} from "lucide-react";
interface OrderData{
    name: string;
    email: string;
    mobile: string;
    address: string;
}

export default  function CustomerInfo({ data }: { data: OrderData }) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-bold text-slate-800">Customer Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border">
                <div>
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-xs text-slate-500 mt-3">Email</p>
                    <p className="text-sm">{data.email}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Mobile</p>
                    <p className="font-semibold">{data.mobile}</p>
                    <p className="text-xs text-slate-500 mt-3">Address</p>
                    <p className="text-sm">{data.address}</p>
                </div>
            </div>
        </section>
    );
}