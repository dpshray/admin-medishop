import React, {memo, useCallback, useMemo, useState} from "react";
import {AlertTriangle, CheckCircle2, Copy, ExternalLink, Shield, XCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

export interface VendorDocument {
    citizenship_card: string[];
    tax_certificate: string[];
    business_license: string[];
}

interface InfoFieldProps {
    label: string;
    value: string;
    className?: string;
    copyable?: boolean;
}

interface DocumentSectionProps {
    title: string;
    documents: string[];
    icon: React.ComponentType<{ className?: string }>;
}

interface VerificationBadgeProps {
    isVerified: boolean | null;
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    bgColor: string;
    iconColor: string;
}


export const VerificationBadge: React.FC<VerificationBadgeProps> = memo(({isVerified}) => {
    const badgeConfig = useMemo(() => {
        if (isVerified === true)
            return {
                className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                icon: CheckCircle2,
                text: "Verified Partner",
                showTrust: true,
            };
        if (isVerified === false)
            return {
                className: "bg-red-50 text-red-700 border-red-200",
                icon: XCircle,
                text: "Not Verified",
                showTrust: false,
            };
        return {
            className: "bg-amber-50 text-amber-700 border-amber-200",
            icon: AlertTriangle,
            text: "Under Review",
            showTrust: false,
        };
    }, [isVerified]);

    const IconComponent = badgeConfig.icon;
    return (
        <div className="flex items-center gap-3">
            <Badge className={`${badgeConfig.className} px-3 py-1.5 font-medium`}>
                <IconComponent className="w-3.5 h-3.5 mr-1.5"/> {badgeConfig.text}
            </Badge>
            {badgeConfig.showTrust && (
                <div
                    className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3"/> <span>Trusted</span>
                </div>
            )}
        </div>
    );
});

export const VendorStatCard: React.FC<StatCardProps> = memo(({icon: Icon, label, value, bgColor, iconColor}) => (
    <div
        className={`${bgColor} p-5 rounded-2xl border border-white/40 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]`}>
        <div className="flex items-center justify-between mb-3">
            <Icon className={`w-5 h-5 ${iconColor}`}/>
        </div>
        <p className="text-xs text-slate-600 mb-1 font-medium tracking-wide">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
));

export const DocumentSection: React.FC<DocumentSectionProps> = memo(({title, documents, icon: Icon}) => {
    const handleDocumentClick = useCallback((docUrl: string) => {
        window.open(docUrl, "_blank", "noopener,noreferrer");
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600"/>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
                        <p className="text-xs text-slate-500">{documents.length} document{documents.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-xs">{documents.length > 0 ? "Available" : "Missing"}</Badge>
            </div>
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {documents.map((doc, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-10 justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                            onClick={() => handleDocumentClick(doc)}
                        >
                            <span className="text-xs font-medium">Document {index + 1}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400"/>
                        </Button>
                    ))}
                </div>
            ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                    No documents uploaded
                </div>
            )}
        </div>
    );
});

export const InfoField: React.FC<InfoFieldProps> = memo(({label, value, className = "", copyable = false}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        if (!copyable) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
        }
    }, [copyable, value]);

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
            <div className="flex items-center justify-between group">
                <p className="text-sm font-medium text-slate-900 break-words">{value}</p>
                {copyable && navigator.clipboard && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={handleCopy}
                    >
                        <Copy className="w-3 h-3"/>
                    </Button>
                )}
            </div>
            {copied && (
                <p className="text-xs text-green-600 font-medium animate-in fade-in-0 duration-200">
                    Copied to clipboard
                </p>
            )}
        </div>
    );
});

export const FormatAccountNumber = (accountNumber: string) => accountNumber.replace(/(\d{4})/g, "$1 ").trim();

export const GetTotalDocuments = (documents: VendorDocument) =>
    documents.citizenship_card.length + documents.tax_certificate.length + documents.business_license.length;

export const GetVerificationStatus = (isVerified: boolean | null) => {
    if (isVerified === true) return {text: "Verified", color: "text-green-600"};
    if (isVerified === false) return {text: "Unverified", color: "text-red-600"};
    return {text: "Under Review", color: "text-amber-600"};
};


VerificationBadge.displayName = "VerificationBadge";
VendorStatCard.displayName = "VendorStatCard";
DocumentSection.displayName = "DocumentSection";
InfoField.displayName = "InfoField";
FormatAccountNumber.displayName = "FormatAccountNumber";
GetTotalDocuments.displayName = "GetTotalDocuments";
GetVerificationStatus.displayName = "GetVerificationStatus";
