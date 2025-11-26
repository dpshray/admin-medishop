import VendorAssignedOrderDetailsPage from "@/app/vendor/vendor-orders/[slug]/vendorOrderDetails";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({params}: PageProps) {
    const {slug} = await params;
    return <VendorAssignedOrderDetailsPage slug={slug}/>;
}
