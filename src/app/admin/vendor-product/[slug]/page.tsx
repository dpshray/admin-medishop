import VendorProductDetails from "@/app/admin/vendor-product/[slug]/vendor-product-details";


interface PageProps{
    params: Promise<{slug:string}>
}

export default async function VendorProductPage( {params}:PageProps) {
   const {slug} = await params
    return <VendorProductDetails slug={slug}/>
}