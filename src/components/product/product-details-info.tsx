// 'use client'
// import {
//     Archive,
//     BarChart3,
//     Building2,
//     Copy,
//     DollarSign,
//     Edit,
//     Eye,
//     Globe,
//     MoreVertical,
//     Package,
//     Settings,
//     Share2,
//     Star,
//     Tag,
//     Trash2,
//     Users,
//     Zap
// } from "lucide-react";
// import {FormatCurrency, StatusBadge} from "@/lib/helper";
// import Image from "next/image";
// import React, {Suspense, useCallback, useState, useMemo} from "react";
// import {Skeleton} from "@/components/ui/skeleton";
// import ImageGallery from "@/components/product/image-gallery";
// import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
// import ProductMetricCard from "@/components/product/product-metric-card";
// import {ProductData} from "@/app/admin/products/view-product/[slug]/ProductDetailsClient";
// import ProductActionButton from "@/components/product/product-action-button";
// import {useRouter} from "next/navigation";
// import ActionModal from "@/components/modal/ConfirmModal";
// import productService from "@/service/product/product.service";
// import {toast} from "sonner";
//
// const AdminProductInfo = React.memo(({product}: { product: ProductData }) => {
//     const [copySuccess, setCopySuccess] = useState(false);
//
//     const handleCopySlug = useCallback(async () => {
//         try {
//             await navigator.clipboard.writeText(product.slug);
//             setCopySuccess(true);
//             setTimeout(() => setCopySuccess(false), 2000);
//         } catch (err) {
//             toast.error("Failed to copy slug");
//         }
//     }, [product.slug]);
//
//     const handleViewImage = useCallback(() => {
//         window.open(product.featured_image.url, '_blank', 'noopener,noreferrer');
//     }, [product.featured_image.url]);
//
//     const handleShareProduct = useCallback(async () => {
//         const shareUrl = `${window.location.origin}/products/${product.slug}`;
//
//         if (navigator.share) {
//             try {
//                 await navigator.share({
//                     title: product.name,
//                     url: shareUrl
//                 });
//             } catch (err) {
//                 if (err instanceof Error && err.name !== 'AbortError') {
//                     await navigator.clipboard.writeText(shareUrl);
//                     toast.success("Link copied to clipboard");
//                 }
//             }
//         } else {
//             await navigator.clipboard.writeText(shareUrl);
//             toast.success("Link copied to clipboard");
//         }
//     }, [product.name, product.slug]);
//
//     const formattedDate = useMemo(() =>
//         new Date(product.added_date).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         }), [product.added_date]
//     );
//
//     return (
//         <div className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
//                 <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
//                     <div className="flex items-start justify-between gap-4">
//                         <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-3 mb-3">
//                                 <div className="p-2 rounded-lg bg-blue-50">
//                                     <Package className="h-5 w-5 text-blue-600" aria-hidden="true"/>
//                                 </div>
//                                 <h2 className="text-lg font-semibold text-slate-900">Product Overview</h2>
//                             </div>
//                             <div className="flex flex-wrap items-center gap-3">
//                                 {product.status && <StatusBadge status={product.status}/>}
//                                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                                     <Globe className="h-4 w-4" aria-hidden="true"/>
//                                     <span>Live since {formattedDate}</span>
//                                 </div>
//                             </div>
//                         </div>
//                         <button
//                             className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                             aria-label="More options"
//                         >
//                             <MoreVertical className="h-5 w-5 text-slate-500" aria-hidden="true"/>
//                         </button>
//                     </div>
//                 </div>
//
//                 <div className="p-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                         <div className="space-y-4">
//                             <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 group ring-1 ring-slate-200/60">
//                                 <Image
//                                     src={product.featured_image.url}
//                                     alt={`${product.name} - Featured image`}
//                                     fill
//                                     className="object-cover group-hover:scale-105 transition-transform duration-500"
//                                     priority
//                                     sizes="(max-width: 1024px) 100vw, 45vw"
//                                 />
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                                 <div className="absolute top-4 right-4 flex gap-2">
//                                     <button
//                                         onClick={handleViewImage}
//                                         className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all duration-200"
//                                         aria-label="View full size image"
//                                     >
//                                         <Eye className="h-4 w-4 text-slate-700" aria-hidden="true"/>
//                                     </button>
//                                     <button
//                                         onClick={handleShareProduct}
//                                         className="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all duration-200"
//                                         aria-label="Share product"
//                                     >
//                                         <Share2 className="h-4 w-4 text-slate-700" aria-hidden="true"/>
//                                     </button>
//                                 </div>
//                             </div>
//                             {product.gallery_images.length > 0 && (
//                                 <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg"/>}>
//                                     <ImageGallery images={product.gallery_images}/>
//                                 </Suspense>
//                             )}
//                         </div>
//
//                         <div className="space-y-6">
//                             <div>
//                                 <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
//                                     <Building2 className="h-4 w-4" aria-hidden="true"/>
//                                     <span className="font-medium">{product.brand.name}</span>
//                                 </div>
//                                 <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
//                                     {product.name}
//                                 </h1>
//
//                                 <div className="flex items-center gap-2 mb-6 flex-wrap">
//                                     <code className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono">
//                                         /{product.slug}
//                                     </code>
//                                     <button
//                                         onClick={handleCopySlug}
//                                         className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors relative group"
//                                         aria-label={copySuccess ? "Slug copied" : "Copy slug"}
//                                     >
//                                         <Copy className="h-4 w-4 text-slate-500 group-hover:text-slate-700" aria-hidden="true"/>
//                                         {copySuccess && (
//                                             <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
//                                                 Copied!
//                                             </span>
//                                         )}
//                                     </button>
//                                 </div>
//
//                                 <div
//                                     className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
//                                     dangerouslySetInnerHTML={{__html: product.description}}
//                                 />
//                             </div>
//
//                             <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
//                                 <div className="space-y-2">
//                                     <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
//                                         Active Vendors
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <div className="p-2 rounded-lg bg-blue-50">
//                                             <Users className="h-4 w-4 text-blue-600" aria-hidden="true"/>
//                                         </div>
//                                         <div>
//                                             <div className="font-semibold text-slate-900 text-lg">
//                                                 {product.no_of_vendors}
//                                             </div>
//                                             <div className="text-xs text-slate-500">vendors</div>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="space-y-2">
//                                     <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
//                                         Customer Rating
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <div className="p-2 rounded-lg bg-amber-50">
//                                             <Star className="h-4 w-4 text-amber-500 fill-amber-500" aria-hidden="true"/>
//                                         </div>
//                                         <div>
//                                             <div className="font-semibold text-slate-900 text-lg">
//                                                 {product.rating || 4.5}
//                                             </div>
//                                             <div className="text-xs text-slate-500">128 reviews</div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
//                 <Tabs defaultValue="variations" className="w-full">
//                     <div className="border-b border-slate-100 px-6 pt-6">
//                         <TabsList className="h-10 p-1 bg-slate-100 rounded-xl">
//                             <TabsTrigger
//                                 value="variations"
//                                 className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium px-4"
//                             >
//                                 Pricing & Stock
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="taxonomy"
//                                 className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium px-4"
//                             >
//                                 Categories
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="health-conditions"
//                                 className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium px-4"
//                             >
//                                 Health
//                             </TabsTrigger>
//                         </TabsList>
//                     </div>
//
//                     <TabsContent value="variations" className="p-6 space-y-3">
//                         {product.variations.map((variation) => (
//                             <div
//                                 key={variation.variation_id}
//                                 className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 rounded-xl transition-all duration-200 border border-slate-200/60 gap-4"
//                             >
//                                 <div className="flex items-center gap-4 flex-wrap">
//                                     <div className="flex items-center gap-2">
//                                         <div className="w-2 h-2 rounded-full bg-blue-500"/>
//                                         <span className="text-sm text-slate-600">Size:</span>
//                                         <span className="font-semibold text-slate-900">
//                                             {variation.size_value}{variation.size_unit}
//                                         </span>
//                                     </div>
//                                     {variation.status && <StatusBadge status={variation.status}/>}
//                                     <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
//                                         <span className="text-sm text-green-700 font-medium">
//                                             {variation.units_in_stock} in stock
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-6">
//                                     {variation.stock_quantity !== undefined && (
//                                         <div className="text-right">
//                                             <div className="text-xs text-slate-500 mb-1">Total Stock</div>
//                                             <div className="font-semibold text-slate-900">
//                                                 {variation.stock_quantity}
//                                             </div>
//                                         </div>
//                                     )}
//                                     <div className="text-right">
//                                         <div className="text-xs text-slate-500 mb-1">Price</div>
//                                         <div className="text-lg font-bold text-blue-600">
//                                             {FormatCurrency(variation.admin_price)}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </TabsContent>
//
//                     <TabsContent value="taxonomy" className="p-6 space-y-6">
//                         <div>
//                             <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
//                                 <Tag className="h-4 w-4 text-blue-600" aria-hidden="true"/>
//                                 Categories
//                             </h4>
//                             <div className="flex flex-wrap gap-2">
//                                 {product.categories.map((category) => (
//                                     <div
//                                         key={category.id}
//                                         className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:shadow-md transition-shadow"
//                                     >
//                                         <span>{category.name}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                         <div>
//                             <h4 className="text-sm font-semibold text-slate-900 mb-4">Tags</h4>
//                             <div className="flex flex-wrap gap-2">
//                                 {product.tags.map((tag) => (
//                                     <div
//                                         key={tag.id}
//                                         className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 hover:shadow-sm transition-all cursor-pointer"
//                                     >
//                                         {tag.name}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </TabsContent>
//
//                     <TabsContent value="health-conditions" className="p-6">
//                         <div>
//                             <h4 className="text-sm font-semibold text-slate-900 mb-4">Associated Health Conditions</h4>
//                             <div className="flex flex-wrap gap-2">
//                                 {product.health_conditions?.map((health_condition, index) => (
//                                     <div
//                                         key={index}
//                                         className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200 hover:shadow-md transition-all"
//                                     >
//                                         {health_condition.name}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </TabsContent>
//                 </Tabs>
//             </div>
//         </div>
//     );
// });
//
// AdminProductInfo.displayName = 'AdminProductInfo';
//
// const AdminProductSidebar = React.memo(({product}: { product: ProductData }) => {
//     const router = useRouter();
//     const [openDeleteModal, setOpenDeleteModal] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);
//
//     const handleEdit = useCallback(() => {
//         router.push(`/admin/products/edit-product/${product.uuid}`);
//     }, [router, product.uuid]);
//
//     const handlePreview = useCallback(() => {
//         window.open(`/products/${product.slug}`, '_blank', 'noopener,noreferrer');
//     }, [product.slug]);
//
//     const handleShare = useCallback(async () => {
//         const shareUrl = `${window.location.origin}/products/${product.slug}`;
//
//         if (navigator.share) {
//             try {
//                 await navigator.share({
//                     title: product.name,
//                     url: shareUrl
//                 });
//             } catch (err) {
//                 if (err instanceof Error && err.name !== 'AbortError') {
//                     await navigator.clipboard.writeText(shareUrl);
//                     toast.success("Link copied to clipboard");
//                 }
//             }
//         } else {
//             await navigator.clipboard.writeText(shareUrl);
//             toast.success("Link copied to clipboard");
//         }
//     }, [product.name, product.slug]);
//
//     const handleArchive = useCallback(() => {
//         toast.info("Archive functionality coming soon");
//     }, []);
//
//     const handleDeleteClick = useCallback(() => {
//         setOpenDeleteModal(true);
//     }, []);
//
//     const handleConfirmDelete = useCallback(async () => {
//         setIsDeleting(true);
//         try {
//             const res = await productService.deleteProduct(product.uuid);
//             toast.success(res.message || "Product deleted successfully");
//             router.push('/admin/products');
//         } catch (error: any) {
//             toast.error(error?.message || "Failed to delete product");
//         } finally {
//             setIsDeleting(false);
//             setOpenDeleteModal(false);
//         }
//     }, [product.uuid, router]);
//
//     return (
//         <aside className="space-y-6">
//             <div className="grid gap-4">
//                 <ProductMetricCard
//                     title="Total Revenue"
//                     value={FormatCurrency(200)}
//                     icon={DollarSign}
//                     trend={{value: 12.5, isPositive: true}}
//                     description="This month"
//                 />
//                 <ProductMetricCard
//                     title="Units Sold"
//                     value={product.total_sales || 1284}
//                     icon={BarChart3}
//                     trend={{value: 8.2, isPositive: true}}
//                     description="This month"
//                 />
//                 <ProductMetricCard
//                     title="Conversion Rate"
//                     value={`${product.conversion_rate || 3.2}%`}
//                     icon={Zap}
//                     trend={{value: 2.1, isPositive: true}}
//                     description="Last 30 days"
//                 />
//                 <ProductMetricCard
//                     title="Page Views"
//                     value={(product.views || 12450).toLocaleString()}
//                     icon={Eye}
//                     trend={{value: 15.3, isPositive: true}}
//                     description="This month"
//                 />
//             </div>
//
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
//                 <div className="flex items-center gap-3 mb-6">
//                     <div className="p-2 rounded-lg bg-slate-100">
//                         <Settings className="h-4 w-4 text-slate-600" aria-hidden="true"/>
//                     </div>
//                     <h3 className="font-semibold text-slate-900">Quick Actions</h3>
//                 </div>
//
//                 <div className="space-y-2">
//                     <ProductActionButton
//                         icon={Edit}
//                         label="Edit Product"
//                         variant="primary"
//                         onClickAction={handleEdit}
//                     />
//                     <ProductActionButton
//                         icon={Eye}
//                         label="Preview Live"
//                         variant="secondary"
//                         onClickAction={handlePreview}
//                     />
//                     <ProductActionButton
//                         icon={Share2}
//                         label="Share Product"
//                         variant="secondary"
//                         onClickAction={handleShare}
//                     />
//
//                     <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
//                         <ProductActionButton
//                             icon={Archive}
//                             label="Archive"
//                             variant="secondary"
//                             onClickAction={handleArchive}
//                         />
//                         <ProductActionButton
//                             icon={Trash2}
//                             label="Delete Product"
//                             variant="danger"
//                             onClickAction={handleDeleteClick}
//                             disabled={isDeleting}
//                         />
//                     </div>
//                 </div>
//             </div>
//
//             <ActionModal
//                 open={openDeleteModal}
//                 setOpen={setOpenDeleteModal}
//                 title="Delete Product"
//                 description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
//                 onConfirm={handleConfirmDelete}
//             />
//         </aside>
//     );
// });
//
// AdminProductSidebar.displayName = 'AdminProductSidebar';
//
// export {AdminProductInfo, AdminProductSidebar};