import OrderDetailsClient from "@/app/admin/(order)/orders/[slug]/OrderDetailsPage"

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params
    return <OrderDetailsClient orderUuid={slug} />
}
