'use client'
import {use} from "react";
import VendorManageForm from "@/components/vendor/VendorEditForm";

interface EditVendorProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function EditVendor({params}: EditVendorProps) {
    const {slug} = use(params);

    return (
        <VendorManageForm
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
