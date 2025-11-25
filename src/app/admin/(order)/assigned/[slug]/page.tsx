import AssignedOrderDetailsPage from "@/app/admin/(order)/assigned/[slug]/AssignedOrderDetails";

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function AssignedOrder({params}: PageProps) {
    const {slug} = await params
    return <AssignedOrderDetailsPage slug={slug}/>
}