'use client'
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

export default function VendorPage() {
    const router = useRouter();
    return (
        <div>
            Vendor Page
            <Button onClick={() => router.push('/admin/vendors/add-vendor')}>Add Vendor</Button>
        </div>
    )
}