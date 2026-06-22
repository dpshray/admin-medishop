"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, getInitials } from "@/lib/utils";
import vendorService from "@/service/vendor.service";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit3,
  FileText,
  Globe,
  Home,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  Store,
  XCircle,
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
import { ErrorFallback } from "@/components/Error/error-fallback";
import { useRouter } from "next/navigation";
import { QUERY_STALE_TIME } from "@/config/app-constant";
import VendorProductPage from "@/components/vendor/admin/vendor-product-page";
import { StatusBadge } from "@/lib/helper";
import { STATUS_TYPE } from "@/types/enum";

interface VendorDocument {
  citizenship_card: string[];
  tax_certificate: string[];
  business_license: string[];
}

interface VendorDetails {
  email_verified: boolean;
  account_status: boolean;
  store_name: string;
  store_description: string | null;
  location: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  municipality: string | null;
  postal_code: string | null;
  bank_name: string | null;
  bank_account_holder_name: string | null;
  bank_account_number: string | null;
  documents: VendorDocument;
}

interface VendorData {
  name: string;
  email: string;
  mobile_number: string;
  commission_percentage: string | null;
  vendor_details: VendorDetails;
}

interface ApiResponse {
  success: boolean;
  data: VendorData;
}

interface VendorClientPageProps {
  slug: string;
}

export default function VendorClientPage({ slug }: VendorClientPageProps) {
  const router = useRouter();

  const { data, isError, isPending } = useQuery<ApiResponse>({
    queryKey: ["vendor", slug],
    queryFn: async () => {
      const res = await vendorService.getVendor(slug);
      // console.log('Vendor Details:', res)
      return res;
    },
    staleTime: QUERY_STALE_TIME,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  const memoizedData = useMemo(() => {
    if (!data?.success || !data.data) return null;
    const vendor = data.data;
    const totalDocuments = GetTotalDocuments(vendor.vendor_details.documents);
    const verificationStatus = GetVerificationStatus(
      vendor.vendor_details.account_status,
    );
    return { vendor, totalDocuments, verificationStatus };
  }, [data]);

  if (isPending) return <LoadingSkeleton />;
  if (isError || !memoizedData) return <ErrorFallback />;

  const { vendor, totalDocuments } = memoizedData;
  const { vendor_details } = vendor;

  const statCards = [
    {
      icon: vendor_details.account_status ? CheckCircle2 : XCircle,
      label: "Account Status",
      value: vendor_details.account_status ? "Active" : "Inactive",
      bgColor: vendor_details.account_status
        ? "bg-gradient-to-br from-green-50 to-emerald-50"
        : "bg-gradient-to-br from-red-50 to-rose-50",
      iconColor: vendor_details.account_status
        ? "text-green-600"
        : "text-red-600",
    },
    {
      icon: vendor_details.email_verified ? Shield : XCircle,
      label: "Email Status",
      value: vendor_details.email_verified ? "Verified" : "Unverified",
      bgColor: vendor_details.email_verified
        ? "bg-gradient-to-br from-blue-50 to-indigo-50"
        : "bg-gradient-to-br from-amber-50 to-orange-50",
      iconColor: vendor_details.email_verified
        ? "text-blue-600"
        : "text-amber-600",
    },
    {
      icon: FileText,
      label: "Documents",
      value: `${totalDocuments} Files`,
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      iconColor: "text-purple-600",
    },
    {
      icon: MapPin,
      label: "Location",
      value: vendor_details.country ?? "Not set",
      bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
      iconColor: "text-slate-600",
    },
    {
      icon: Briefcase,
      label: "Commission",
      value:
        vendor.commission_percentage &&
        parseFloat(vendor.commission_percentage) > 0
          ? `${parseFloat(vendor.commission_percentage)}%`
          : "No Commission",
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
      iconColor: "text-amber-600",
    },
  ];

  const tabs = [
    { label: "Overview", value: "overview", icon: Home },
    { label: "Business", value: "business", icon: Store },
    { label: "Documents", value: "documents", icon: FileText },
    { label: "Products", value: "products", icon: ShoppingBag },
  ];

  const handleVendorEdit = () =>
    router.push(`/admin/vendors/edit-vendor/${slug}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <Card className="border shadow-lg bg-white mb-6">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-slate-200 shadow-md flex-shrink-0">
                  <AvatarFallback className="text-lg sm:text-xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    {getInitials(vendor.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 break-words">
                    {vendor_details.store_name}
                  </h1>
                  <p className="text-base sm:text-lg font-semibold text-slate-700 mb-1">
                    {vendor.name}
                  </p>
                  <p className="text-sm text-slate-500 mb-3">
                    Business Owner & Vendor
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                      <Globe
                        className="w-3.5 h-3.5 text-slate-500 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-slate-700 font-medium">
                        {vendor_details.country}
                      </span>
                    </div>
                    <StatusBadge
                      status={
                        vendor_details.account_status
                          ? STATUS_TYPE.ACTIVE
                          : STATUS_TYPE.INACTIVE
                      }
                    />
                    <Badge
                      variant={
                        vendor_details.email_verified ? "secondary" : "outline"
                      }
                      className={cn(
                        "px-3 py-1",
                        vendor_details.email_verified
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200",
                      )}
                    >
                      {vendor_details.email_verified ? (
                        <Shield className="w-3 h-3 mr-1.5" aria-hidden="true" />
                      ) : (
                        <Mail className="w-3 h-3 mr-1.5" aria-hidden="true" />
                      )}
                      {vendor_details.email_verified
                        ? "Email Verified"
                        : "Email Unverified"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={handleVendorEdit}
                    className="flex-1 sm:flex-none"
                    aria-label="Edit vendor details"
                  >
                    <Edit3 className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {statCards.map((card, index) => (
                  <StatCard key={index} {...card} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={tabs[0].value} className="w-full">
          <TabsList className="w-full mb-6 bg-white border shadow-sm p-1 h-auto rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-1">
            {tabs.map(({ label, value, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-md",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600",
                  "data-[state=active]:text-white data-[state=active]:shadow-md",
                  "transition-all duration-200 hover:bg-slate-50",
                  "text-sm font-medium",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.slice(0, 4)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="overview"
            className="space-y-6 focus-visible:outline-none"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-md border bg-white">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Briefcase
                          className="w-5 h-5 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Quick Overview
                      </h2>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <InfoField
                          label="Store Name"
                          value={vendor_details.store_name}
                          copyable
                        />
                        <InfoField
                          label="Owner Name"
                          value={vendor.name}
                          copyable
                        />
                        <InfoField
                          label="Municipality"
                          value={vendor_details.municipality}
                        />
                        <InfoField
                          label="District"
                          value={vendor_details.district}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                          Business Description
                        </label>
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-200">
                          <p className="text-sm leading-relaxed text-slate-700">
                            {vendor_details.store_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border bg-white">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <CreditCard
                          className="w-5 h-5 text-purple-600"
                          aria-hidden="true"
                        />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Banking Information
                      </h2>
                    </div>
                    <div className="bg-purple-50 p-4 sm:p-6 rounded-lg border border-purple-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        <InfoField
                          label="Bank Name"
                          value={vendor_details.bank_name}
                        />
                        <InfoField
                          label="Account Holder"
                          value={vendor_details.bank_account_holder_name}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                          Account Number
                        </label>
                        <div className="bg-white p-4 sm:p-5 rounded-lg border border-purple-200 shadow-sm">
                          <p className="text-base sm:text-lg font-mono text-center tracking-wider text-slate-800 break-all">
                            {formatAccountNumber(
                              vendor_details.bank_account_number ?? "",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-md border bg-white lg:sticky lg:top-6 h-fit">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">
                    Contact Information
                  </h2>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4 pb-5 border-b border-slate-200">
                      <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-slate-200 shadow-sm flex-shrink-0">
                        <AvatarFallback className="text-base sm:text-lg font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                          {getInitials(vendor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                          {vendor.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-2">
                          Business Owner
                        </p>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full w-fit">
                          <Globe
                            className="w-3 h-3 text-slate-500 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            {vendor_details.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    <nav className="space-y-3" aria-label="Contact methods">
                      <a
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Send email to ${vendor.email}`}
                      >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                          <Mail
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs text-blue-900/70 font-semibold uppercase tracking-wide">
                              Email
                            </p>
                            {vendor_details.email_verified && (
                              <Shield
                                className="w-3 h-3 text-blue-600"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="text-sm font-medium text-blue-900 truncate group-hover:text-blue-700 transition-colors">
                            {vendor.email}
                          </p>
                        </div>
                      </a>

                      <a
                        href={`tel:${vendor.mobile_number}`}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        aria-label={`Call ${vendor.mobile_number}`}
                      >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                          <Phone
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-green-900/70 font-semibold uppercase tracking-wide mb-0.5">
                            Phone
                          </p>
                          <p className="text-sm font-medium text-green-900 group-hover:text-green-700 transition-colors">
                            {vendor.mobile_number}
                          </p>
                        </div>
                      </a>
                    </nav>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="business"
            className="space-y-6 focus-visible:outline-none"
          >
            <Card className="shadow-md border bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2
                      className="w-5 h-5 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Business Details
                  </h2>
                </div>
                <div className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    <InfoField
                      label="Store Name"
                      value={vendor_details.store_name}
                      copyable
                    />
                    <InfoField
                      label="Owner Name"
                      value={vendor.name}
                      copyable
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                      Business Description
                    </label>
                    <div className="bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200">
                      <p className="text-sm leading-relaxed text-slate-700">
                        {vendor_details.store_description ??
                          "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <MapPin
                      className="w-5 h-5 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Location Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <InfoField
                    label="Full Address"
                    value={vendor_details.location}
                    className="sm:col-span-2 lg:col-span-3"
                    copyable
                  />
                  <InfoField
                    label="Municipality"
                    value={vendor_details.municipality}
                  />
                  <InfoField label="District" value={vendor_details.district} />
                  <InfoField
                    label="State/Province"
                    value={vendor_details.state}
                  />
                  <InfoField label="Country" value={vendor_details.country} />
                  <InfoField
                    label="Postal Code"
                    value={vendor_details.postal_code}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CreditCard
                      className="w-5 h-5 text-purple-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Banking Information
                  </h2>
                </div>
                <div className="bg-purple-50 p-4 sm:p-6 rounded-lg border border-purple-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    <InfoField
                      label="Bank Name"
                      value={vendor_details.bank_name}
                    />
                    <InfoField
                      label="Account Holder Name"
                      value={vendor_details.bank_account_holder_name}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                      Account Number
                    </label>
                    <div className="bg-white p-4 sm:p-5 rounded-lg border border-purple-200 shadow-sm">
                      <p className="text-base sm:text-lg font-mono text-center tracking-wider text-slate-800 break-all">
                        {formatAccountNumber(
                          vendor_details.bank_account_number ?? "",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="focus-visible:outline-none">
            <Card className="shadow-md border bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <FileText
                        className="w-5 h-5 text-orange-600"
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Document Library
                    </h2>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-100 w-fit"
                  >
                    {totalDocuments} Files
                  </Badge>
                </div>
                <div className="space-y-6 sm:space-y-8">
                  <DocumentSection
                    title="Identity Documents"
                    documents={vendor_details.documents.citizenship_card}
                    icon={FileText}
                  />
                  <Separator className="bg-slate-200" />
                  <DocumentSection
                    title="Tax Certificates"
                    documents={vendor_details.documents.tax_certificate}
                    icon={FileText}
                  />
                  <Separator className="bg-slate-200" />
                  <DocumentSection
                    title="Business Licenses"
                    documents={vendor_details.documents.business_license}
                    icon={FileText}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="focus-visible:outline-none">
            <VendorProductPage slug={slug} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
