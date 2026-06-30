"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2 } from "lucide-react";
import BrandProductTable from "@/components/table/BrandProductTable";
import { useGetBrandBySlug } from "@/hooks/use-brands";
import Link from "next/link";

interface ProductDetailClientProps {
  brandSlug: string;
}

export default function ProductDetailClient({
  brandSlug,
}: ProductDetailClientProps) {
  const { data: brandData, isLoading } = useGetBrandBySlug(brandSlug);

  const brand = brandData?.data;

  return (
    <div className="p-4 space-y-4">
      <Link
        href="/admin/brands"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Back to Brands
      </Link>
      <div className="flex items-center gap-2 sm:gap-4 rounded-lg border border-border bg-white p-2 sm:p-4">
        <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {brand?.image ? (
            <Image
              src={brand.image}
              alt={brand.name}
              width={64}
              height={64}
              className="object-contain w-full h-full"
            />
          ) : (
            <Building2 size={24} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {isLoading ? (
            <span className="text-sm text-muted-foreground">
              Loading brand...
            </span>
          ) : (
            <>
              <h1 className="text-lg font-bold text-foreground">
                {brand?.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {brand?.slug}
                </Badge>
                <Badge
                  className={
                    brand?.is_featured
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-400 hover:bg-gray-500 text-white"
                  }
                >
                  {brand?.is_featured ? "Featured" : "Standard"}
                </Badge>
                <Badge
                  className={
                    brand?.is_popular
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-400 hover:bg-gray-500 text-white"
                  }
                >
                  {brand?.is_popular ? "Popular" : "Standard"}
                </Badge>
              </div>
            </>
          )}
        </div>
      </div>

      <BrandProductTable brand_slug={brandSlug} />
    </div>
  );
}
