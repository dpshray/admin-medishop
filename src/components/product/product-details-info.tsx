'use client'
import {
    Archive,
    BarChart3,
    Building2,
    Copy,
    DollarSign,
    Edit,
    Eye,
    Globe,
    MoreVertical,
    Package,
    Settings,
    Share2,
    Shield,
    Star,
    Tag,
    Trash2,
    Users,
    Zap
} from "lucide-react";
import {FormatCurrency, StatusBadge} from "@/lib/helper";
import Image from "next/image";
import React, {Suspense, useCallback, useState} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import ImageGallery from "@/components/product/image-gallery";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ProductMetricCard from "@/components/product/product-metric-card";
import {ProductData} from "@/app/admin/products/view-product/[slug]/ProductDetailsClient";
import ProductActionButton from "@/components/product/product-action-button";
import {useRouter} from "next/navigation";
import ActionModal from "@/components/modal/ConfirmModal";
import productService from "@/service/product/product.service";
import {toast} from "sonner";

const AdminProductInfo = React.memo(({product}: { product: ProductData }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopySlug = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(product.slug);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            toast.error("Failed to copy slug");
        }
    }, [product.slug]);

    const handleViewImage = useCallback(() => {
        window.open(product.featured_image.url, '_blank', 'noopener,noreferrer');
    }, [product.featured_image.url]);

    const handleShareProduct = useCallback(async () => {
        const shareUrl = `${window.location.origin}/products/${product.slug}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    url: shareUrl
                });
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied to clipboard");
                }
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard");
        }
    }, [product.name, product.slug]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 flex-shrink-0">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" aria-hidden="true"/>
                                </div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate">Product
                                    Overview</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {product.status && <StatusBadge status={product.status}/>}
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                                    <Globe className="h-3 w-3 flex-shrink-0" aria-hidden="true"/>
                                    <span className="truncate">
                                        Live since {new Date(product.added_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                            aria-label="More options"
                        >
                            <MoreVertical className="h-4 w-4 text-slate-500" aria-hidden="true"/>
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                                <Image
                                    src={product.featured_image.url}
                                    alt={`${product.name} - Featured image`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    priority
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 40vw"
                                />
                                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
                                    <button
                                        onClick={handleViewImage}
                                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                                        aria-label="View image"
                                    >
                                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" aria-hidden="true"/>
                                    </button>
                                    <button
                                        onClick={handleShareProduct}
                                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                                        aria-label="Share product"
                                    >
                                        <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600"
                                                aria-hidden="true"/>
                                    </button>
                                </div>
                            </div>
                            {product.gallery_images.length > 0 && (
                                <Suspense fallback={<Skeleton className="h-20 w-full rounded-lg"/>}>
                                    <ImageGallery images={product.gallery_images}/>
                                </Suspense>
                            )}
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-2">
                                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true"/>
                                    <span className="font-medium truncate">{product.brand.name}</span>
                                </div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 break-words">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    <code
                                        className="bg-slate-100 text-slate-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono break-all">
                                        /{product.slug}
                                    </code>
                                    <button
                                        onClick={handleCopySlug}
                                        className="p-1.5 hover:bg-slate-100 rounded-md transition-colors flex-shrink-0 relative"
                                        aria-label={copySuccess ? "Copied" : "Copy slug"}
                                    >
                                        <Copy className="h-3 w-3 text-slate-500" aria-hidden="true"/>
                                        {copySuccess && (
                                            <span
                                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                Copied!
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div
                                    className="prose prose-sm max-w-none text-slate-600 leading-relaxed text-xs sm:text-sm"
                                    dangerouslySetInnerHTML={{__html: product.description}}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <div
                                        className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Vendors
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0"
                                               aria-hidden="true"/>
                                        <span
                                            className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {product.no_of_vendors}
                                        </span>
                                        <span className="text-xs sm:text-sm text-slate-500">active</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Rating
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star
                                            className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 fill-current flex-shrink-0"
                                            aria-hidden="true"/>
                                        <span className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {product.rating || 4.5}
                                        </span>
                                        <span className="text-xs sm:text-sm text-slate-500 truncate">
                                            (128 reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60">
                <Tabs defaultValue="variations" className="w-full">
                    <div className="border-b border-slate-100 px-4 sm:px-6 pt-4 sm:pt-6">
                        <TabsList className="h-9 sm:h-10 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
                            <TabsTrigger
                                value="variations"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Pricing & Stock
                            </TabsTrigger>
                            <TabsTrigger
                                value="taxonomy"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Categories
                            </TabsTrigger>
                            <TabsTrigger
                                value="health-conditions"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Health
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="variations" className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="space-y-3">
                            {product.variations.map((variation) => (
                                <div
                                    key={variation.variation_id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60 gap-3"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"/>
                                            <span className="font-semibold text-slate-900 text-sm sm:text-base">
                                                {variation.size_value}{variation.size_unit}
                                            </span>
                                        </div>
                                        {variation.status && <StatusBadge status={variation.status}/>}
                                    </div>
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        {variation.stock_quantity !== undefined && (
                                            <div className="text-left sm:text-right">
                                                <div className="text-xs sm:text-sm text-slate-500">Stock</div>
                                                <div className="font-medium text-slate-900 text-sm sm:text-base">
                                                    {variation.stock_quantity}
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-left sm:text-right">
                                            <div className="text-xs sm:text-sm text-slate-500">Price</div>
                                            <div className="text-sm sm:text-base">
                                                {FormatCurrency(variation.admin_price)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="taxonomy" className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div>
                            <h4 className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
                                Categories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {product.categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium border border-blue-200"
                                    >
                                        <Tag className="h-3 w-3 flex-shrink-0" aria-hidden="true"/>
                                        <span className="truncate">{category.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium hover:bg-slate-200 transition-colors"
                                    >
                                        {tag.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="health-conditions" className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div>
                            <h4 className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
                                Health Conditions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {product.health_conditions?.map((health_condition, index) => (
                                    <div
                                        key={index}
                                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium hover:bg-slate-200 transition-colors"
                                    >
                                        {health_condition.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
});

AdminProductInfo.displayName = 'AdminProductInfo';

const AdminProductSidebar = React.memo(({product}: { product: ProductData }) => {
    const router = useRouter();
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = useCallback(() => {
        router.push(`/admin/products/edit-product/${product.uuid}`);
    }, [router, product.uuid]);

    const handlePreview = useCallback(() => {
        window.open(`/products/${product.slug}`, '_blank', 'noopener,noreferrer');
    }, [product.slug]);


    const handleShare = useCallback(async () => {
        const shareUrl = `${window.location.origin}/products/${product.slug}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    url: shareUrl
                });
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied to clipboard");
                }
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard");
        }
    }, [product.name, product.slug]);

    const handleArchive = useCallback(() => {
        toast.info("Archive functionality coming soon");
    }, []);

    const handleDeleteClick = useCallback(() => {
        setOpenDeleteModal(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            const res = await productService.deleteProduct(product.uuid);
            toast.success(res.message || "Product deleted successfully");
            router.push('/admin/products');
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete product");
        } finally {
            setIsDeleting(false);
            setOpenDeleteModal(false);
        }
    }, [product.uuid, router]);

    return (
        <aside className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4">
                <ProductMetricCard
                    title="Total Revenue"
                    value={FormatCurrency( 2000)}
                    icon={DollarSign}
                    trend={{value: 12.5, isPositive: true}}
                    description="This month"
                />
                <ProductMetricCard
                    title="Units Sold"
                    value={product.total_sales || 1284}
                    icon={BarChart3}
                    trend={{value: 8.2, isPositive: true}}
                    description="This month"
                />
                <ProductMetricCard
                    title="Conversion Rate"
                    value={`${product.conversion_rate || 3.2}%`}
                    icon={Zap}
                    trend={{value: 2.1, isPositive: true}}
                    description="Last 30 days"
                />
                <ProductMetricCard
                    title="Page Views"
                    value={(product.views || 12450).toLocaleString()}
                    icon={Eye}
                    trend={{value: 15.3, isPositive: true}}
                    description="This month"
                />
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-slate-100 flex-shrink-0">
                        <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" aria-hidden="true"/>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Quick Actions</h3>
                </div>

                <div className="space-y-2 sm:space-y-3 space-x-3">
                    <ProductActionButton
                        icon={Edit}
                        label="Edit Product"
                        variant="primary"
                        onClickAction={handleEdit}
                    />
                    <ProductActionButton
                        icon={Eye}
                        label="Preview Live"
                        variant="secondary"
                        onClickAction={handlePreview}
                    />
                    <ProductActionButton
                        icon={Share2}
                        label="Share Product"
                        variant="secondary"
                        onClickAction={handleShare}
                    />

                    <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-2 space-x-3">
                        <ProductActionButton
                            icon={Archive}
                            label="Archive"
                            variant="secondary"
                            onClickAction={handleArchive}
                        />
                        <ProductActionButton
                            icon={Trash2}
                            label="Delete Product"
                            variant="danger"
                            onClickAction={handleDeleteClick}
                            disabled={isDeleting}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" aria-hidden="true"/>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Product Health</h3>
                </div>

                <div className="space-y-4">
                    {[
                        {label: "SEO Score", value: 85, color: "bg-emerald-500"},
                        {label: "Content Quality", value: 78, color: "bg-blue-500"},
                        {label: "Image Optimization", value: 95, color: "bg-emerald-500"}
                    ].map(({label, value, color}) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm text-slate-600 truncate">{label}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div
                                    className="w-12 sm:w-16 h-2 bg-slate-100 rounded-full overflow-hidden"
                                    role="progressbar"
                                    aria-valuenow={value}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`${label} ${value}%`}
                                >
                                    <div className={`h-full ${color} rounded-full`} style={{width: `${value}%`}}/>
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-slate-900">{value}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ActionModal
                open={openDeleteModal}
                setOpen={setOpenDeleteModal}
                title="Delete Product"
                description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
            />
        </aside>
    );
});

AdminProductSidebar.displayName = 'AdminProductSidebar';

export {AdminProductInfo, AdminProductSidebar};