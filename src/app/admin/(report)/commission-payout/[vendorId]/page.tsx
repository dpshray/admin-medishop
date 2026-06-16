import ClientVendorCommissionPayout from "./ClientVendorCommissionPayout";

interface PageProps {
  params: Promise<{ vendorId: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { vendorId } = await params;

  return (
    <div>
      <ClientVendorCommissionPayout vendorId={Number(vendorId)} />
    </div>
  );
}
