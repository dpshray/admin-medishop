import BookingServiceDetailsClientPage
    from "@/app/admin/(services)/booked-services/[slug]/BookingServiceDetailsClientPage";

interface Props {
    params: Promise<{ slug: string }>
}

export default async function BookedServicesPage({params}: Props) {
    const {slug} = await params
    return (
       <BookingServiceDetailsClientPage slug={slug}/>
    )
}