'use client'

import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {getInitials} from "@/lib/utils";
import vendorService from "@/service/vendor.service";
import {
    Building2,
    Calendar,
    CheckCircle2,
    CreditCard,
    Download,
    Edit3,
    FileText,
    Globe,
    Mail,
    MapPin,
    Phone
} from "lucide-react";
import LoadingSkeleton from "@/app/admin/vendors/view-vendor/[slug]/loading";
import {
    DocumentSection,
    FormatAccountNumber as formatAccountNumber,
    GetTotalDocuments,
    GetVerificationStatus,
    InfoField,
    VendorStatCard as StatCard,
    VerificationBadge
} from "@/components/vendor/page";
import {ErrorFallback} from "@/components/Error/error-fallback";

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

interface VendorClientPageProps {
    slug: string;
}

export default function VendorClientPage({slug}: VendorClientPageProps) {
    const {data, isError, isPending} = useQuery<ApiResponse>({
        queryKey: ["vendor", slug],
        queryFn: () => vendorService.getVendor(slug),
        staleTime: 5 * 60 * 1000,
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
            label: "Verification Status",
            value: verificationStatus.text,
            bgColor: "bg-gradient-to-r from-blue-50/80 to-indigo-50/80",
            iconColor: "text-blue-600"
        },
        {
            icon: FileText,
            label: "Documents",
            value: `${totalDocuments} Files`,
            bgColor: "bg-gradient-to-r from-green-50/80 to-emerald-50/80",
            iconColor: "text-green-600"
        },
        {
            icon: MapPin,
            label: "Location",
            value: vendor_details.country,
            bgColor: "bg-gradient-to-r from-purple-50/80 to-pink-50/80",
            iconColor: "text-purple-600"
        },
        {
            icon: Calendar,
            label: "Status",
            value: "Active",
            bgColor: "bg-gradient-to-r from-orange-50/80 to-red-50/80",
            iconColor: "text-orange-600"
        }
    ];

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/20 to-indigo-50/30 animate-in fade-in-0 duration-500">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                <header className="mb-8 sm:mb-12">
                    <div
                        className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                                    <AvatarFallback
                                        className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                        {getInitials(vendor.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                            <Building2 className="w-4 h-4 text-white"/>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                            {vendor_details.store_name}
                                        </h1>
                                    </div>
                                    <h2 className="text-lg font-semibold text-slate-700 mb-1">{vendor.name}</h2>
                                    <p className="text-sm text-slate-500 mb-2">Business Owner</p>
                                    <div className="flex items-center gap-1">
                                        <Globe className="w-3 h-3 text-slate-400"/>
                                        <span className="text-xs text-slate-500">{vendor_details.country}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <VerificationBadge isVerified={vendor_details.is_verified}/>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 shadow-lg">
                                        <Edit3 className="w-4 h-4 mr-2"/> Edit Profile
                                    </Button>
                                    <Button size="sm" variant="outline" className="shadow-sm">
                                        <Download className="w-4 h-4 mr-2"/> Export
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                            {statCards.map((card, index) => (
                                <StatCard key={index} {...card} />
                            ))}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3 space-y-6">
                        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-md">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-blue-600"/>
                                    </div>
                                    Business Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <InfoField label="Store Name" value={vendor_details.store_name} copyable/>
                                    <InfoField label="Owner Name" value={vendor.name} copyable/>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Business Description
                                    </label>
                                    <div
                                        className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                                        <p className="text-sm leading-relaxed text-slate-700">{vendor_details.store_description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-md">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-green-600"/>
                                    </div>
                                    Location & Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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

                        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-md">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-purple-600"/>
                                    </div>
                                    Banking & Financial Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                        <InfoField label="Bank Name" value={vendor_details.bank_name}/>
                                        <InfoField label="Account Holder Name"
                                                   value={vendor_details.bank_account_holder_name}/>
                                    </div>
                                    <div className="space-y-3">
                                        <label
                                            className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Account Number
                                        </label>
                                        <div
                                            className="bg-white/80 p-4 rounded-xl border border-slate-200 backdrop-blur-sm">
                                            <p className="text-lg font-mono text-center tracking-widest text-slate-800">
                                                {formatAccountNumber(vendor_details.bank_account_number)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-md">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-orange-600"/>
                                        </div>
                                        <span className="text-xl">Document Library</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">{totalDocuments} Total Files</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <DocumentSection title="Identity Documents"
                                                 documents={vendor_details.documents.citizenship_card} icon={FileText}/>
                                <Separator className="bg-slate-200"/>
                                <DocumentSection title="Tax Certificates"
                                                 documents={vendor_details.documents.tax_certificate} icon={FileText}/>
                                <Separator className="bg-slate-200"/>
                                <DocumentSection title="Business Licenses"
                                                 documents={vendor_details.documents.business_license} icon={FileText}/>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-md sticky top-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-xl">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                                        <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                            {getInitials(vendor.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                            {vendor.name}
                                        </h3>

                                        <p className="text-sm text-slate-500">Business Owner</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <Globe className="w-3 h-3 text-slate-400" />
                                            <span className="text-xs text-slate-500">{vendor_details.country}</span>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="bg-slate-200" />
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500 font-medium">Email Address</p>
                                            <a
                                                href={`mailto:${vendor.email}`}
                                                className="block text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors break-words"
                                            >
                                                {vendor.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                                            <a
                                                href={`tel:${vendor.mobile_number}`}
                                                className="block text-sm font-medium text-slate-900 hover:text-green-600 transition-colors break-words"
                                            >
                                                {vendor.mobile_number}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}
