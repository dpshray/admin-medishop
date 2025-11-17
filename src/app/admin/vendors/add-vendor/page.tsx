'use client'
import VendorForm from "@/components/vendor/admin/VendorForm";

export default function AddVendor() {
    return <div>
        <VendorForm
            mode="create"
            onSuccess={(data) => {
                console.log("Vendor updated:", data);
            }}
            onCancel={() => {
                window.history.back();
            }}
        />
    </div>
}