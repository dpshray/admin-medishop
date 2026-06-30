import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ brandSlug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { brandSlug } = await params;

  return <ProductDetailClient brandSlug={brandSlug} />;
}
