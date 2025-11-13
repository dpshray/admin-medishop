'use client'

import {Badge} from "@/components/ui/badge";
import {AlertCircle, Package, TrendingDown, TrendingUp} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import vendorService from "@/service/vendor.service";
import {useMemo, useState} from "react";
import {QUERY_STALE_TIME} from "@/config/app-constant";
import CustomPagination from "@/components/custom-pagination";
import {cn} from "@/lib/utils";
import {StatusBadge} from "@/lib/helper";
import {STATUS_TYPE} from "@/types/enum";
import VendorProductSkeleton from "@/components/vendor/VendorProductSkeleton";

interface ProductVariant {
    price: number;
    units_in_stock: number;
    variation_name: string;
    variation_size_value: number;
    variation_size_unit: string;
}

interface VendorProduct {
    vendor_status: boolean;
    approved: boolean;
    product_name: string;
    product_variants: ProductVariant[];
}

interface VendorProductCardProps {
    slug: string;
}

const VendorProductPage = ({slug}: VendorProductCardProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const {data: productsResponse, isLoading, isError} = useQuery<VendorProduct[]>({
        queryKey: ["vendor", slug, "products", currentPage],
        queryFn: async () => {
            const res = await vendorService.getAllProductOfVendor(slug, {
                page: currentPage,
                per_page: 10,
            });
            setTotalPages(res.total_pages);
            setCurrentPage(res.page);
            return res.items || [];
        },
        staleTime: QUERY_STALE_TIME,
        retry: 2,
        retryDelay: 1000,
        enabled: !!slug,
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const productStats = useMemo(() => {
        if (!productsResponse) return null;

        return productsResponse.map(product => {
            const totalStock = product.product_variants?.reduce(
                (sum, v) => sum + v.units_in_stock,
                0
            ) || 0;
            const avgPrice = product.product_variants?.length > 0
                ? product.product_variants.reduce((sum, v) => sum + v.price, 0) / product.product_variants.length
                : 0;
            const isAvailable = product.vendor_status && product.approved && totalStock > 0;
            const lowestPrice = product.product_variants?.length > 0
                ? Math.min(...product.product_variants.map(v => v.price))
                : 0;
            const highestPrice = product.product_variants?.length > 0
                ? Math.max(...product.product_variants.map(v => v.price))
                : 0;

            return {
                totalStock,
                avgPrice,
                isAvailable,
                lowestPrice,
                highestPrice,
                variantCount: product.product_variants?.length || 0
            };
        });
    }, [productsResponse]);

    if (isLoading) {
        return (
           <VendorProductSkeleton/>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-3 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto"/>
                    <p className="text-gray-900 font-semibold text-lg">Failed to load products</p>
                    <p className="text-gray-600">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    if (!productsResponse || productsResponse.length === 0) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-3 max-w-md">
                    <Package className="w-16 h-16 text-gray-400 mx-auto"/>
                    <p className="text-gray-900 font-semibold text-lg">No products found</p>
                    <p className="text-gray-600">This vendor hasn&#39;t listed any products yet</p>
                </div>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <div className="space-y-4">
                {productsResponse.map((product, idx) => {
                    const stats = productStats?.[idx];
                    if (!stats) return null;

                    return (
                        <article
                            key={`${product.product_name}-${idx}`}
                            className={cn(
                                'group relative bg-white border rounded-xl overflow-hidden transition-all duration-300',
                                stats.isAvailable
                                    ? 'border-gray-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1'
                                    : 'border-gray-200 opacity-75',
                                'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
                            )}
                            aria-label={`${product.product_name} - ${stats.isAvailable ? 'Available' : 'Unavailable'}`}
                        >
                            {!stats.isAvailable && (
                                <div className="absolute inset-0 bg-gray-50/80 z-10 flex items-center justify-center">
                                    <Badge variant="outline" className="bg-white shadow-lg px-4 py-2 text-base">
                                        Currently Unavailable
                                    </Badge>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row">
                                <div
                                    className="w-full sm:w-40 h-40 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl"></div>
                                    <Package className="w-16 h-16 text-blue-600 relative z-10 drop-shadow-sm"
                                             aria-hidden="true"/>
                                </div>

                                <div className="flex-1 p-5 sm:p-6 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1 min-w-0 leading-tight">
                                            {product.product_name}
                                        </h2>
                                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                            <StatusBadge
                                                status={product.approved ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.PENDING}
                                            />
                                            {!product.approved && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                                                    aria-label="Product pending approval"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" aria-hidden="true"/>
                                                    Pending Review
                                                </Badge>
                                            )}
                                            <StatusBadge
                                                status={product.vendor_status ? STATUS_TYPE.ACTIVE : STATUS_TYPE.INACTIVE}
                                            />
                                        </div>
                                    </div>

                                    {stats.variantCount > 0 && (
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600 font-medium">Price Range:</span>
                                                    <span className="text-gray-900 font-semibold">
                                                        Rs. {stats.lowestPrice.toLocaleString()}
                                                        {stats.lowestPrice !== stats.highestPrice && (
                                                            <> - Rs. {stats.highestPrice.toLocaleString()}</>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600 font-medium">Total Stock:</span>
                                                    <span className={cn(
                                                        "font-semibold",
                                                        stats.totalStock > 20 ? "text-green-600" :
                                                            stats.totalStock > 0 ? "text-amber-600" : "text-red-600"
                                                    )}>
                                                        {stats.totalStock} units
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {stats.variantCount > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                                Available Variants ({stats.variantCount})
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {product.product_variants.map((variant, variantIdx) => (
                                                    <div
                                                        key={`${variant.variation_name}-${variantIdx}`}
                                                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {variant.variation_size_value} {variant.variation_size_unit}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-xs",
                                                                    variant.units_in_stock > 10
                                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                                        : variant.units_in_stock > 0
                                                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                            : "bg-red-50 text-red-700 border-red-200"
                                                                )}
                                                            >
                                                                {variant.units_in_stock > 0 ? (
                                                                    <TrendingUp className="w-3 h-3 mr-1"/>
                                                                ) : (
                                                                    <TrendingDown className="w-3 h-3 mr-1"/>
                                                                )}
                                                                {variant.units_in_stock} in stock
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Rs. {variant.price.toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChangeAction={handlePageChange}
                    />
                </div>
            )}
        </section>
    );
};

export default VendorProductPage;