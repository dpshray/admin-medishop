'use client'
import {use} from "react";
import VendorForm from "@/components/vendor/admin/VendorForm";


interface EditVendorProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function EditVendor({params}: EditVendorProps) {
    const {slug} = use(params);

    return (
        <VendorForm
            mode="edit"
            vendorId={slug}
            onSuccess={(data) => {
                console.log("Vendor updated:", data);
            }}
            onCancel={() => {
                window.history.back();
            }}
        />
    );
}
