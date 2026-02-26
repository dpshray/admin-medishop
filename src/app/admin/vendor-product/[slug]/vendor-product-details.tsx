"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  DollarSign,
  Loader2,
  Mail,
  Package,
  Store,
  User,
  Warehouse,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ActionModal from "@/components/modal/ConfirmModal";
import vendorProductService from "@/service/product/vendor-product.service";
import { FormatCurrency, StatusBadge } from "@/lib/helper";
import { STATUS_TYPE } from "@/types/enum";
import { QUERY_STALE_TIME } from "@/config/app-constant";

interface ProductVariation {
  variation_id: number;
  variation_name: string;
  variant_stock: number;
  variant_unit: string;
  units_in_stock: number;
  price: number;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
}

interface VendorProductData {
  product_uuid: string;
  product_name: string;
  is_approved: boolean | null;
  product_image: string;
  vendor: Vendor;
  product_variations: ProductVariation[];
}

interface ActionDialog {
  open: boolean;
  action: "accept" | "reject" | null;
}

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: "blue" | "green" | "purple" | "orange";
  truncate?: boolean;
}

const DetailCard = ({
  icon,
  label,
  value,
  color = "blue",
  truncate = false,
}: DetailCardProps) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg flex-shrink-0 ${colorClasses[color]}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
          {label}
        </p>
        <p
          className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${truncate ? "truncate" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default function VendorProductDetails({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [actionDialog, setActionDialog] = useState<ActionDialog>({
    open: false,
    action: null,
  });
  const [selectedVariation, setSelectedVariation] = useState<number>(0);

  const { data, isLoading, error } = useQuery<VendorProductData>({
    queryKey: ["vendor-product", slug],
    queryFn: () => vendorProductService.vendorProductDetails(slug),
    enabled: Boolean(slug),
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: true,
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      vendorProductService.acceptAndRejectVendorProduct(slug, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-product", slug] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product accepted successfully");
      setActionDialog({ open: false, action: null });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to accept product");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      vendorProductService.acceptAndRejectVendorProduct(slug, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-product", slug] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product rejected successfully");
      setActionDialog({ open: false, action: null });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reject product");
    },
  });

  const handleAction = useCallback((action: "accept" | "reject") => {
    setActionDialog({ open: true, action });
  }, []);

  const confirmAction = useCallback(() => {
    if (actionDialog.action === "accept") {
      acceptMutation.mutate();
    } else if (actionDialog.action === "reject") {
      rejectMutation.mutate();
    }
  }, [actionDialog.action, acceptMutation, rejectMutation]);

  const handleModalClose = useCallback((open: boolean) => {
    setActionDialog({ open, action: null });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Alert variant="destructive" role="alert">
            <AlertDescription>
              {(error as any)?.message || "Failed to load product details"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (
    !data ||
    !data.product_variations ||
    data.product_variations.length === 0
  ) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Alert role="status">
            <AlertDescription>No product details found.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const {
    product_name,
    product_image,
    vendor,
    product_variations,
    is_approved,
  } = data;
  const currentVariation = product_variations[selectedVariation];
  const isPending = acceptMutation.isPending || rejectMutation.isPending;
  const showActionButtons = is_approved === null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href="/admin/vendor-product"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6 transition-colors"
          aria-label="Back to vendor products list"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Products
        </Link>

        <article className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              <Image
                src={product_image}
                alt={`${product_name} ${currentVariation.variation_name}`}
                fill
                className="object-contain p-8"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="p-6 sm:p-8 flex flex-col">
              <header className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Product Name
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {product_name}
                    </h1>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Variation
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {currentVariation.variation_name}
                    </h2>
                  </div>
                </div>
                {is_approved !== null && (
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Status
                    </span>
                    <StatusBadge
                      status={
                        is_approved
                          ? STATUS_TYPE.ACCEPTED
                          : STATUS_TYPE.REJECTED
                      }
                    />
                  </div>
                )}
              </header>

              {product_variations.length > 1 && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Select Variation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product_variations.map((variation, index) => (
                      <button
                        key={variation.variation_id}
                        onClick={() => setSelectedVariation(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedVariation === index
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                        aria-pressed={selectedVariation === index}
                      >
                        {variation.variation_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6 flex-1">
                <section aria-labelledby="product-details-heading">
                  <h2
                    id="product-details-heading"
                    className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider"
                  >
                    Product Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailCard
                      icon={<DollarSign className="w-5 h-5" />}
                      label="Price"
                      value={FormatCurrency(currentVariation.price)}
                      color="blue"
                    />
                    <DetailCard
                      icon={<Warehouse className="w-5 h-5" />}
                      label="Stock"
                      value={`${currentVariation.units_in_stock} units`}
                      color="green"
                    />
                    <DetailCard
                      icon={<Box className="w-5 h-5" />}
                      label="Size"
                      value={`${currentVariation.variant_stock} ${currentVariation.variant_unit}`}
                      color="purple"
                    />
                    <DetailCard
                      icon={<Package className="w-5 h-5" />}
                      label="Variation ID"
                      value={`#${currentVariation.variation_id}`}
                      color="orange"
                    />
                  </div>
                </section>

                <section
                  aria-labelledby="vendor-info-heading"
                  className="border-t border-slate-200 dark:border-slate-800 pt-6"
                >
                  <h2
                    id="vendor-info-heading"
                    className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2"
                  >
                    <Store className="w-4 h-4" aria-hidden="true" />
                    Vendor Information
                  </h2>
                  <div className="space-y-3">
                    <DetailCard
                      icon={<User className="w-5 h-5" />}
                      label="Name"
                      value={vendor.name}
                    />
                    <DetailCard
                      icon={<Mail className="w-5 h-5" />}
                      label="Email"
                      value={vendor.email}
                      truncate
                    />
                    <DetailCard
                      icon={<Store className="w-5 h-5" />}
                      label="Vendor ID"
                      value={`#${vendor.id}`}
                    />
                  </div>
                </section>
              </div>

              {showActionButtons && (
                <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleAction("accept")}
                      disabled={isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                      aria-label="Accept product"
                    >
                      {acceptMutation.isPending ? (
                        <>
                          <Loader2
                            className="w-4 h-4 mr-2 animate-spin"
                            aria-hidden="true"
                          />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            className="w-4 h-4 mr-2"
                            aria-hidden="true"
                          />
                          Accept Product
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleAction("reject")}
                      disabled={isPending}
                      variant="destructive"
                      className="flex-1 transition-colors"
                      aria-label="Reject product"
                    >
                      {rejectMutation.isPending ? (
                        <>
                          <Loader2
                            className="w-4 h-4 mr-2 animate-spin"
                            aria-hidden="true"
                          />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle
                            className="w-4 h-4 mr-2"
                            aria-hidden="true"
                          />
                          Reject Product
                        </>
                      )}
                    </Button>
                  </div>
                </footer>
              )}
            </div>
          </div>
        </article>
      </div>

      <ActionModal
        open={actionDialog.open}
        setOpen={handleModalClose}
        title={
          actionDialog.action === "accept" ? "Accept Product" : "Reject Product"
        }
        description={
          actionDialog.action === "accept"
            ? "Are you sure you want to accept this product? It will be marked as active."
            : "Are you sure you want to reject this product? It will be marked as inactive."
        }
        confirmLabel="Confirm"
        confirmVariant={
          actionDialog.action === "accept" ? "default" : "destructive"
        }
        loading={isPending}
        onConfirm={confirmAction}
      />
    </div>
  );
}
