import React, {Suspense} from "react";
import VendorClientPage from "@/app/admin/vendors/view-vendor/[slug]/VendorClientPage";
import LoadingSkeleton from "@/app/admin/vendors/view-vendor/[slug]/loading";

interface ViewVendorProps {
    params: Promise<{
        slug: string;
    }>
}

export default function ViewVendorPage({params}: ViewVendorProps) {
    const {slug} = React.use(params);

    return (
        <Suspense fallback={<LoadingSkeleton/>}>
            <VendorClientPage slug={slug}/>
        </Suspense>
    );
}