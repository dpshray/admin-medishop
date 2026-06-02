"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Building2,
  CheckCircle2,
  Copy,
  Edit,
  Eye,
  Globe,
  MoreVertical,
  Package,
  Share2,
  Star,
  Tag,
  Trash2,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import productService from "@/service/product/product.service";
import { ErrorFallback } from "@/components/Error/error-fallback";
import AdminProductDetailsSkeleton from "@/app/admin/products/view-product/[slug]/loading";
import ProductActionButton from "@/components/product/product-action-button";
import ProductMetricCard from "@/components/product/product-metric-card";
import { FormatCurrency, StatusBadge } from "@/lib/helper";
import { toast } from "sonner";
import ActionModal from "@/components/modal/ConfirmModal";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductVendorTab from "@/components/product/ProductVendorTab";
import { QUERY_STALE_TIME } from "@/config/app-constant";

interface Brand {
  id: number;
  name: string;
}

interface GenericProduct {
  generic_product_name: string;
  generic_product_id: number;
}

interface Category {
  id: number;
  name: string;
}

interface ProductTag {
  id: number;
  name: string;
}

interface ProductVariation {
  variant_id: number;
  variant_size_value: number;
  variant_size_unit: string;
  variant_admin_price: number;
  variant_units_in_stock: number;
  variant_form_type: string;
  variant_package_type: string;
  variant_package_size: string;
  variant_strength: string;
  batch_number: string;
  expiry_date: string;
  status?: string;
  stock_quantity?: number;
  variant_image?: string;
}

interface HealthCondition {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  url: string;
}

interface ProductData {
  name: string;
  uuid: string;
  slug: string;
  brand: Brand;
  generic_product: GenericProduct;
  description: string;
  added_date: string;
  prescription_required: boolean;
  no_of_vendors: number;
  total_units_in_stock: number;
  categories: Category[];
  tags: ProductTag[];
  variations: ProductVariation[];
  health_conditions: HealthCondition[];
  featured_image: ProductImage;
  //   gallery_images: ProductImage[];
  status?: string;
  rating?: number;
  discount_percent?: string;
}

interface AdminProductDetailsProps {
  slug: string;
}

const VALID_TABS = [
  "variations",
  "health",
  "categories-tags",
  "vendors",
] as const;
type ValidTab = (typeof VALID_TABS)[number];

const AdminProductDetailsContent: React.FC<AdminProductDetailsProps> =
  React.memo(({ slug }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const tabFromUrl = searchParams.get("tab");
    const initialTab =
      tabFromUrl && VALID_TABS.includes(tabFromUrl as ValidTab)
        ? (tabFromUrl as ValidTab)
        : "variations";

    const [activeTab, setActiveTab] = useState<ValidTab>(initialTab);

    useEffect(() => {
      const tabParam = searchParams.get("tab");
      if (tabParam && VALID_TABS.includes(tabParam as ValidTab)) {
        setActiveTab(tabParam as ValidTab);
      }
    }, [searchParams]);

    const { data, isPending, isError, refetch } = useQuery({
      queryKey: ["admin-product", slug],
      queryFn: async (): Promise<ProductData> => {
        const response = await productService.getSingleProduct(slug);
        if (!response?.data) throw new Error("Product not found");
        return response.data;
      },
      staleTime: QUERY_STALE_TIME,
      retry: 2,
      refetchOnWindowFocus: true,
    });

    const updateUrlWithTab = useCallback(
      (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`?${params.toString()}`, { scroll: false });
      },
      [router, searchParams],
    );

    const handleTabChange = useCallback(
      (value: string) => {
        if (VALID_TABS.includes(value as ValidTab)) {
          setActiveTab(value as ValidTab);
          updateUrlWithTab(value);
        }
      },
      [updateUrlWithTab],
    );

    const handlePreview = useCallback(() => {
      if (!data) return;
      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
      if (websiteUrl)
        window.open(
          `${websiteUrl}/product/${data.slug}`,
          "_blank",
          "noopener,noreferrer",
        );
    }, [data]);

    const handleShare = useCallback(async () => {
      if (!data) return;
      const shareUrl = `${window.location.origin}/products/${data.slug}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: data.name, url: shareUrl });
        } catch (err) {
          if (err instanceof Error && err.name !== "AbortError") {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard");
          }
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      }
    }, [data]);

    const handleCopySlug = useCallback(async () => {
      if (!data) return;
      try {
        await navigator.clipboard.writeText(data.slug);
        setCopySuccess(true);
        toast.success("Slug copied to clipboard");
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        toast.error("Failed to copy slug");
      }
    }, [data]);

    const handleDeleteClick = useCallback(() => {
      setOpenDeleteModal(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (!data) return;
      setIsDeleting(true);
      try {
        const res = await productService.deleteProduct(data.uuid);
        toast.success(res.message || "Product deleted successfully");
        router.push("/admin/products");
      } catch (error) {
        toast.error("Failed to delete product");
        setIsDeleting(false);
        setOpenDeleteModal(false);
      }
    }, [data, router]);

    const handleEdit = useCallback(() => {
      if (data?.uuid) router.push(`/admin/products/edit-product/${data.uuid}`);
    }, [router, data]);

    const handleBack = useCallback(() => {
      router.back();
    }, [router]);

    const formattedDate = data?.added_date
      ? new Date(data.added_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

    if (isPending) return <AdminProductDetailsSkeleton />;

    const tabs = [
      { label: "Variations", value: "variations" },
      { label: "Health Conditions", value: "health" },
      { label: "Categories & Tags", value: "categories-tags" },
      { label: "Vendors", value: "vendors" },
    ];

    if (isError || !data) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <ErrorFallback
            title="Failed to load product"
            message="Unable to fetch product details. Please check your connection and try again."
            primaryAction={{ label: "Retry", onClick: () => refetch() }}
            secondaryAction={{ label: "Back to Products", onClick: handleBack }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -ml-2"
            aria-label="Go back to products list"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Products</span>
          </button>

          <header className="flex flex-col gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 break-words">
                  {data.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                    ID: {data.uuid}
                  </span>
                  <span className="hidden sm:inline" aria-hidden="true">
                    •
                  </span>
                  <time className="flex items-center gap-1">
                    <Globe className="h-3 w-3" aria-hidden="true" />
                    Added {formattedDate}
                  </time>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ProductActionButton
                icon={Edit}
                label="Edit Product"
                variant="primary"
                onClickAction={handleEdit}
                className="flex-1 sm:flex-none"
              />
              <ProductActionButton
                icon={Eye}
                label="Preview"
                variant="secondary"
                onClickAction={handlePreview}
                className="flex-1 sm:flex-none"
              />
              <ProductActionButton
                icon={Share2}
                label="Share"
                variant="secondary"
                onClickAction={handleShare}
                className="flex-1 sm:flex-none"
              />
              <ProductActionButton
                icon={Trash2}
                label="Delete"
                variant="danger"
                onClickAction={handleDeleteClick}
                disabled={isDeleting}
                className="flex-1 sm:flex-none"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ProductMetricCard
              title="Total Revenue"
              value={FormatCurrency(200)}
              icon={Wallet}
              trend={{ value: 12.5, isPositive: true }}
              description="This month"
            />
            <ProductMetricCard
              title="Units Sold"
              value={1284}
              icon={BarChart3}
              trend={{ value: 8.2, isPositive: true }}
              description="This month"
            />
            <ProductMetricCard
              title="Conversion Rate"
              value="3.2%"
              icon={Zap}
              trend={{ value: 2.1, isPositive: true }}
              description="Last 30 days"
            />
            <ProductMetricCard
              title="Page Views"
              value="12,450"
              icon={Eye}
              trend={{ value: 15.3, isPositive: true }}
              description="This month"
            />
          </div>

          <div className="bg-white rounded-md overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 rounded-lg bg-blue-50"
                      aria-hidden="true"
                    >
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                      Product Details
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {data.status && <StatusBadge status={data.status} />}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <Globe className="h-4 w-4" aria-hidden="true" />
                      <span>Live since {formattedDate}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="More options"
                >
                  <MoreVertical
                    className="h-5 w-5 text-slate-500"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 group ring-1 ring-slate-200/60">
                    <Image
                      src={data.featured_image.url}
                      alt={`${data.name} - Featured product image`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-hidden="true"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={handlePreview}
                        className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="View full size image"
                      >
                        <Eye
                          className="h-4 w-4 text-slate-700"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Share product"
                      >
                        <Share2
                          className="h-4 w-4 text-slate-700"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                  {/* {data.gallery_images.length > 0 && (
                    <Suspense
                      fallback={
                        <Skeleton className="h-20 sm:h-24 w-full rounded-lg" />
                      }
                    >
                      <ImageGallery images={data.gallery_images} />
                    </Suspense>
                  )} */}
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                      <span className="font-medium">{data.brand.name}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 leading-tight">
                      {data.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      <code className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono break-all">
                        /{data.slug}
                      </code>
                      <button
                        onClick={handleCopySlug}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors relative group focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={copySuccess ? "Slug copied" : "Copy slug"}
                      >
                        {copySuccess ? (
                          <CheckCircle2
                            className="h-4 w-4 text-green-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <Copy
                            className="h-4 w-4 text-slate-500 group-hover:text-slate-700"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>

                    <div
                      className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: data.description }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Active Vendors
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg bg-blue-50"
                          aria-hidden="true"
                        >
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-lg">
                            {data.no_of_vendors}
                          </div>
                          <div className="text-xs text-slate-500">vendors</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Customer Rating
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg bg-amber-50"
                          aria-hidden="true"
                        >
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-lg">
                            {data.rating || 4.5}
                          </div>
                          <div className="text-xs text-slate-500">
                            128 reviews
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="h-10 p-1 bg-slate-100 rounded-xl w-full sm:w-auto grid grid-cols-4 sm:inline-grid mb-6">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm font-medium px-2 sm:px-4 whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="variations" className="space-y-3">
                  {data.variations.map((variation) => (
                    <article
                      key={variation.variant_id}
                      className="flex flex-col justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 rounded-xl transition-all duration-200 border border-slate-200/60 gap-4"
                    >
                      {variation.variant_image && (
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <Image
                            src={variation.variant_image}
                            alt={`${variation.variant_form_type} variant image`}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      )}
                      {/* Row 1: Form info + status + stock */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div
                          className="w-2 h-2 rounded-full bg-blue-500 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-slate-900">
                          {variation.variant_form_type}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-sm text-slate-600">
                          {variation.variant_package_type}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-sm text-slate-600">
                          {variation.variant_size_value}
                          {variation.variant_size_unit}
                        </span>
                        {variation.status && (
                          <StatusBadge status={variation.status} />
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-700 font-medium">
                            {variation.variant_units_in_stock} in stock
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Package size, strength, batch, expiry + price */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 flex-wrap text-sm">
                          <div>
                            <span className="text-slate-500">
                              Package Size:{" "}
                            </span>
                            <span className="font-medium text-slate-800">
                              {variation.variant_package_size}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Strength: </span>
                            <span className="font-medium text-slate-800">
                              {variation.variant_strength}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Batch: </span>
                            <span className="font-medium text-slate-800">
                              {variation.batch_number}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Expiry: </span>
                            <span className="font-medium text-slate-800">
                              {variation.expiry_date}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-slate-500 mb-1">
                            Price
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {FormatCurrency(variation.variant_admin_price)}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </TabsContent>

                <TabsContent value="categories-tags" className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Tag
                        className="h-4 w-4 text-blue-600"
                        aria-hidden="true"
                      />
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.categories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:shadow-md transition-shadow"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 hover:shadow-sm transition-all"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="health">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                      Associated Health Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.health_conditions?.map((healthCondition) => (
                        <span
                          key={healthCondition.id}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200 hover:shadow-md transition-all"
                        >
                          {healthCondition.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vendors">
                  <ProductVendorTab productUuid={data.uuid} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <ActionModal
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          title="Delete Product"
          description={`Are you sure you want to delete "${data.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  });

AdminProductDetailsContent.displayName = "AdminProductDetailsContent";

export default AdminProductDetailsContent;
