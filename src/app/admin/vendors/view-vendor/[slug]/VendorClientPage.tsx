'use client'

import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {cn, getInitials} from "@/lib/utils";
import vendorService from "@/service/vendor.service";
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    CreditCard,
    Download,
    Edit3,
    FileText,
    Globe,
    Home,
    Mail,
    MapPin,
    Phone,
    ShoppingBag,
    Store
} from "lucide-react";
import LoadingSkeleton from "@/app/admin/vendors/view-vendor/[slug]/loading";
import {
    DocumentSection,
    FormatAccountNumber as formatAccountNumber,
    GetTotalDocuments,
    GetVerificationStatus,
    InfoField,
    VendorStatCard as StatCard,
} from "@/components/vendor/page";
import {ErrorFallback} from "@/components/Error/error-fallback";
import {useRouter} from "next/navigation";
import {QUERY_STALE_TIME} from "@/config/app-constant";
import {StatusBadge} from "@/lib/helper";
import {STATUS_TYPE} from "@/types/enum";
import VendorProductPage from "@/components/vendor/vendor-product-page";


interface VendorDocument {
    citizenship_card: string[];
    tax_certificate: string[];
    business_license: string[];
}

interface VendorDetails {
    is_verified: boolean | null;
    store_name: string;
    store_description: string;
    location: string;
    country: string;
    state: string;
    district: string;
    municipality: string;
    postal_code: string;
    bank_name: string;
    bank_account_holder_name: string;
    bank_account_number: string;
    documents: VendorDocument;
}

interface VendorData {
    name: string;
    email: string;
    mobile_number: string;
    vendor_details: VendorDetails;
}

interface ApiResponse {
    success: boolean;
    data: VendorData;
}

interface ProductVariant {
    price: number;
    units_in_stock: number;
    variation_name: string;
    variation_size_value: number;
    variation_size_unit: string;
}

interface Product {
    id: string;
    vendor_status: boolean;
    approved: boolean;
    product_name: string;
    product_variants: ProductVariant[];
}


interface VendorClientPageProps {
    slug: string;
}

export default function VendorClientPage({slug}: VendorClientPageProps) {
    const router = useRouter();


    const {data, isError, isPending} = useQuery<ApiResponse>({
        queryKey: ["vendor", slug],
        queryFn: async () => {
            const res =  await vendorService.getVendor(slug)
            console.log('Vendor response:', res)
            return res
        },
        staleTime: QUERY_STALE_TIME,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: 1000
    });


    const memoizedData = useMemo(() => {
        if (!data?.success || !data.data) return null;
        const vendor = data.data;
        const totalDocuments = GetTotalDocuments(vendor.vendor_details.documents);
        const verificationStatus = GetVerificationStatus(vendor.vendor_details.is_verified);
        return {vendor, totalDocuments, verificationStatus};
    }, [data]);

    if (isPending) return <LoadingSkeleton/>;
    if (isError || !memoizedData) return <ErrorFallback/>;

    const {vendor, totalDocuments, verificationStatus} = memoizedData;
    const {vendor_details} = vendor;

    const statCards = [
        {
            icon: CheckCircle2,
            label: "Verification",
            value: verificationStatus.text,
            bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100/60",
            iconColor: "text-blue-600"
        },
        {
            icon: FileText,
            label: "Documents",
            value: `${totalDocuments} Files`,
            bgColor: "bg-gradient-to-br from-emerald-50 to-green-100/60",
            iconColor: "text-emerald-600"
        },
        {
            icon: MapPin,
            label: "Location",
            value: vendor_details.country,
            bgColor: "bg-gradient-to-br from-purple-50 to-violet-100/60",
            iconColor: "text-purple-600"
        },
        {
            icon: Calendar,
            label: "Status",
            value: vendor_details.is_verified ? "Verified" : "Not Verified",
            bgColor: "bg-gradient-to-br from-amber-50 to-orange-100/60",
            iconColor: "text-amber-600"
        }
    ];

    const tabs = [
        {label: "Overview", value: "overview", icon: Home},
        {label: "Business", value: "business", icon: Store},
        {label: "Documents", value: "documents", icon: FileText},
        {label: "Products", value: "products", icon: ShoppingBag}
    ];


    const handleVendorEdit = () => router.push(`/admin/vendors/edit-vendor/${slug}`);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none"/>
                    <CardContent className="p-6 sm:p-8 relative">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <Avatar
                                    className="h-20 w-20 border-4 border-white shadow-lg ring-2 ring-slate-100 flex-shrink-0">
                                    <AvatarFallback
                                        className="text-xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                                        {getInitials(vendor.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                            <Building2 className="w-5 h-5 text-white"/>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                                            {vendor_details.store_name}
                                        </h1>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-700 mb-1">{vendor.name}</h2>
                                    <p className="text-sm text-slate-500 mb-3">Business Owner & Vendor</p>
                                    <div
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full w-fit">
                                        <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0"/>
                                        <span
                                            className="text-sm text-slate-700 font-medium">{vendor_details.country}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
                                <StatusBadge
                                    status={vendor_details.is_verified ? STATUS_TYPE.VERIFIED : STATUS_TYPE.UNVERIFIED}/>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={handleVendorEdit}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2"/>
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shadow-sm hover:shadow-md hover:border-slate-400 transition-all duration-300"
                                    >
                                        <Download className="w-4 h-4 mr-2"/>
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {statCards.map((card, index) => (
                                <StatCard key={index} {...card} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue={tabs[0].value} className="w-full">
                    <TabsList
                        className="w-full mb-6 bg-white/80 backdrop-blur-sm border shadow-sm p-1 h-auto rounded-xl">
                        {tabs.map(({label, value, icon: Icon}) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className={cn(
                                    'flex items-center gap-2 flex-1 py-3 px-4 rounded-lg',
                                    'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600',
                                    'data-[state=active]:text-white data-[state=active]:shadow-lg',
                                    'transition-all duration-300 hover:bg-slate-50'
                                )}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0"/>
                                <span className="hidden sm:inline font-medium">{label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-6">
                                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div
                                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-blue-600"/>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">Quick Overview</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InfoField label="Store Name" value={vendor_details.store_name}
                                                           copyable/>
                                                <InfoField label="Owner Name" value={vendor.name} copyable/>
                                                <InfoField label="Municipality" value={vendor_details.municipality}/>
                                                <InfoField label="District" value={vendor_details.district}/>
                                            </div>
                                            <div>
                                                <label
                                                    className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                                                    Business Description
                                                </label>
                                                <div
                                                    className="bg-gradient-to-br from-slate-50 to-slate-100/80 p-5 rounded-xl border border-slate-200">
                                                    <p className="text-sm leading-relaxed text-slate-700">{vendor_details.store_description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div
                                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-purple-600"/>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">Banking Information</h3>
                                        </div>
                                        <div
                                            className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <InfoField label="Bank Name" value={vendor_details.bank_name}/>
                                                <InfoField label="Account Holder"
                                                           value={vendor_details.bank_account_holder_name}/>
                                            </div>
                                            <div>
                                                <label
                                                    className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                                                    Account Number
                                                </label>
                                                <div
                                                    className="bg-white/90 p-5 rounded-xl border border-purple-200 shadow-sm">
                                                    <p className="text-lg sm:text-xl font-mono text-center tracking-widest text-slate-800 break-all">
                                                        {formatAccountNumber(vendor_details.bank_account_number)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card
                                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-6 h-fit overflow-hidden">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-5">Contact Information</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4 pb-5 border-b border-slate-200">
                                            <Avatar
                                                className="h-16 w-16 border-4 border-white shadow-md ring-2 ring-slate-100 flex-shrink-0">
                                                <AvatarFallback
                                                    className="text-lg font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                                                    {getInitials(vendor.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-bold text-slate-900 truncate">{vendor.name}</h4>
                                                <p className="text-sm text-slate-500 mb-2">Business Owner</p>
                                                <div
                                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full w-fit">
                                                    <Globe className="w-3 h-3 text-slate-500 flex-shrink-0"/>
                                                    <span
                                                        className="text-xs text-slate-700 font-medium">{vendor_details.country}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <a
                                                href={`mailto:${vendor.email}`}
                                                className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:shadow-lg transition-all duration-300 group"
                                            >
                                                <div
                                                    className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                                                    <Mail className="w-5 h-5 text-white"/>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-blue-900/70 font-bold uppercase tracking-wide mb-0.5">Email</p>
                                                    <p className="text-sm font-medium text-blue-900 truncate group-hover:text-blue-700 transition-colors">
                                                        {vendor.email}
                                                    </p>
                                                </div>
                                            </a>

                                            <a
                                                href={`tel:${vendor.mobile_number}`}
                                                className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-xl hover:shadow-lg transition-all duration-300 group"
                                            >
                                                <div
                                                    className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                                                    <Phone className="w-5 h-5 text-white"/>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-green-900/70 font-bold uppercase tracking-wide mb-0.5">Phone</p>
                                                    <p className="text-sm font-medium text-green-900 group-hover:text-green-700 transition-colors">
                                                        {vendor.mobile_number}
                                                    </p>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="business" className="focus-visible:outline-none focus-visible:ring-0">
                        <div className="space-y-6">
                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-blue-600"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Business Details</h3>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <InfoField label="Store Name" value={vendor_details.store_name} copyable/>
                                            <InfoField label="Owner Name" value={vendor.name} copyable/>
                                        </div>
                                        <div>
                                            <label
                                                className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                                                Business Description
                                            </label>
                                            <div
                                                className="bg-gradient-to-br from-slate-50 to-slate-100/80 p-6 rounded-xl border border-slate-200">
                                                <p className="text-sm leading-relaxed text-slate-700">{vendor_details.store_description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-green-600"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Location Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <InfoField label="Full Address" value={vendor_details.location}
                                                   className="sm:col-span-2 lg:col-span-3" copyable/>
                                        <InfoField label="Municipality" value={vendor_details.municipality}/>
                                        <InfoField label="District" value={vendor_details.district}/>
                                        <InfoField label="State/Province" value={vendor_details.state}/>
                                        <InfoField label="Country" value={vendor_details.country}/>
                                        <InfoField label="Postal Code" value={vendor_details.postal_code}/>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-purple-600"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Banking Information</h3>
                                    </div>
                                    <div
                                        className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                            <InfoField label="Bank Name" value={vendor_details.bank_name}/>
                                            <InfoField label="Account Holder Name"
                                                       value={vendor_details.bank_account_holder_name}/>
                                        </div>
                                        <div>
                                            <label
                                                className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                                                Account Number
                                            </label>
                                            <div
                                                className="bg-white/90 p-5 rounded-xl border border-purple-200 shadow-sm">
                                                <p className="text-lg sm:text-xl font-mono text-center tracking-widest text-slate-800 break-all">
                                                    {formatAccountNumber(vendor_details.bank_account_number)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="documents" className="focus-visible:outline-none focus-visible:ring-0">
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-orange-600"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Document Library</h3>
                                    </div>
                                    <Badge variant="secondary" className="text-xs font-bold px-3 py-1.5 bg-slate-100">
                                        {totalDocuments} Files
                                    </Badge>
                                </div>
                                <div className="space-y-8">
                                    <DocumentSection
                                        title="Identity Documents"
                                        documents={vendor_details.documents.citizenship_card}
                                        icon={FileText}
                                    />
                                    <Separator className="bg-slate-200"/>
                                    <DocumentSection
                                        title="Tax Certificates"
                                        documents={vendor_details.documents.tax_certificate}
                                        icon={FileText}
                                    />
                                    <Separator className="bg-slate-200"/>
                                    <DocumentSection
                                        title="Business Licenses"
                                        documents={vendor_details.documents.business_license}
                                        icon={FileText}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="focus-visible:outline-none focus-visible:ring-0">
                        <VendorProductPage slug={slug}/>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}