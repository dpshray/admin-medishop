import ProductDetailsClient from "@/app/admin/products/view-product/ProductDetailsClient";
import {Suspense} from "react";
import LoadingSkeleton from "@/app/admin/vendors/view-vendor/[slug]/loading";

interface ViewProductProps {
    params: Promise<{
        slug: string
    }>
}

export default async function ViewProduct({params}: ViewProductProps) {
    const {slug} = await params
    return (
        <Suspense fallback={<LoadingSkeleton/>}>
            <ProductDetailsClient slug={slug}/>
        </Suspense>
    )
}