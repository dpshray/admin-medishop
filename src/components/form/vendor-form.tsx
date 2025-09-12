"use client";

import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {AnimatePresence, motion} from "framer-motion";
import {
    AlertCircle,
    Building2,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    FileCheck,
    FileText,
    Globe,
    Landmark,
    Loader2,
    Mail,
    MapPin,
    MapPinIcon,
    Phone,
    Store,
    User,
} from "lucide-react";
import {createVendorSchema} from "@/lib/schema";
import TextInputField from "@/components/field/text-input";
import FileInputField from "@/components/field/file-input";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

type VendorFormValues = z.infer<typeof createVendorSchema>;

const steps = [
    {
        id: 1,
        title: "Personal Info",
        icon: User,
        description: "Enter your personal contact details",
        color: "from-blue-500 to-blue-600"
    },
    {
        id: 2,
        title: "Store Details",
        icon: Store,
        description: "Provide details about your business",
        color: "from-purple-500 to-purple-600"
    },
    {
        id: 3,
        title: "Banking Info",
        icon: CreditCard,
        description: "Add your payment information to receive earnings",
        color: "from-green-500 to-green-600"
    },
    {
        id: 4,
        title: "Location",
        icon: MapPin,
        description: "Specify your business location details",
        color: "from-orange-500 to-orange-600"
    },
    {
        id: 5,
        title: "Documents",
        icon: FileText,
        description: "Upload documents for verification purposes",
        color: "from-indigo-500 to-indigo-600"
    },
];

const stepFields: Record<number, (keyof VendorFormValues)[]> = {
    1: ["name", "email", "alternate_email", "mobile_number"],
    2: ["store_name", "store_description", "website"],
    3: ["bank_account_holder_name", "bank_name", "bank_account_number"],
    4: ["district", "state", "municipality", "location", "country", "postal_code"],
    5: ["vendor_citizenship_card", "vendor_tax_certificate", "vendor_business_license"],
};

export default function VendorRegistrationForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const {register, handleSubmit, formState: {errors, isSubmitting}, trigger} = useForm<VendorFormValues>({
        resolver: zodResolver(createVendorSchema) as any,
        mode: "onChange",
    });

    const validateCurrentStep = async (): Promise<boolean> => {
        const fieldsToValidate = stepFields[currentStep];
        return await trigger(fieldsToValidate as any);
    };

    const handleNext = async (): Promise<void> => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            if (!completedSteps.includes(currentStep)) setCompletedSteps(prev => [...prev, currentStep]);
            if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = (): void => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleStepClick = (step: number): void => {
        if (step <= currentStep || completedSteps.includes(step - 1)) setCurrentStep(step);
    };

    const getStepProgress = (): number => Math.round((completedSteps.length / steps.length) * 100);

    const renderStepContent = () => {
        const step = steps.find(s => s.id === currentStep);

        switch (currentStep) {
            case 1:
                return (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step?.color} mb-4 shadow-lg`}>
                                <User className="w-8 h-8 text-white"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{step?.title}</CardTitle>
                            <CardDescription className="text-gray-600">{step?.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInputField label="Full Name" {...register("name")} error={errors.name?.message}
                                                autoComplete="name" placeholder="Enter your full name"
                                                icon={User}/>
                                <TextInputField label="Email Address" type="email" {...register("email")}
                                                error={errors.email?.message} autoComplete="email"
                                                placeholder="your@email.com" icon={Mail}/>
                                <TextInputField label="Alternate Email" type="email" {...register("alternate_email")}
                                                error={errors.alternate_email?.message} autoComplete="email"
                                                placeholder="alternate@email.com" icon={Mail}/>
                                <TextInputField label="Mobile Number" {...register("mobile_number")}
                                                error={errors.mobile_number?.message} autoComplete="tel"
                                                placeholder="+1 (555) 000-0000" icon={Phone}/>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step?.color} mb-4 shadow-lg`}>
                                <Store className="w-8 h-8 text-white"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{step?.title}</CardTitle>
                            <CardDescription className="text-gray-600">{step?.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInputField label="Store Name" {...register("store_name")}
                                                error={errors.store_name?.message} autoComplete="organization"
                                                placeholder="Your Store Name" icon={Building2}/>
                                <TextInputField label="Website URL" type="url" {...register("website")}
                                                error={errors.website?.message} autoComplete="url"
                                                placeholder="https://yourstore.com"
                                                icon={Globe }/>
                            </div>
                            <TextInputField label="Store Description"
                                            {...register("store_description")}
                                            error={errors.store_description?.message}
                                            placeholder="Describe your business..." textarea rows={4}/>
                        </CardContent>
                    </Card>
                );

            case 3:
                return (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step?.color} mb-4 shadow-lg`}>
                                <CreditCard className="w-8 h-8 text-white"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{step?.title}</CardTitle>
                            <CardDescription className="text-gray-600">{step?.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                                <Landmark className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"/>
                                <div>
                                    <p className="text-green-700 font-medium text-sm">Secure Banking Information</p>
                                    <p className="text-green-600 text-sm">Your banking details are encrypted and
                                        secured.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInputField label="Account Holder Name" {...register("bank_account_holder_name")}
                                                error={errors.bank_account_holder_name?.message} autoComplete="username"
                                                placeholder="Account holder's full name"
                                                icon={User }/>
                                <TextInputField label="Bank Name" {...register("bank_name")}
                                                error={errors.bank_name?.message} autoComplete="organization"
                                                placeholder="Bank name" icon={Landmark }/>
                                <TextInputField label="Bank Account Number" {...register("bank_account_number")}
                                                error={errors.bank_account_number?.message} autoComplete="off"
                                                placeholder="Enter your account number"
                                                icon={CreditCard }/>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 4:
                return (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step?.color} mb-4 shadow-lg`}>
                                <MapPin className="w-8 h-8 text-white"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{step?.title}</CardTitle>
                            <CardDescription className="text-gray-600">{step?.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <TextInputField label="District" {...register("district")}
                                                error={errors.district?.message} autoComplete="address-level2"
                                                placeholder="District" icon={MapPinIcon }/>
                                <TextInputField label="State/Province" {...register("state")}
                                                error={errors.state?.message} autoComplete="address-level1"
                                                placeholder="State or Province"
                                                icon={MapPinIcon}/>
                                <TextInputField label="Municipality" {...register("municipality")}
                                                error={errors.municipality?.message} placeholder="Municipality"
                                                icon={MapPinIcon }/>
                                <TextInputField label="Location/Address" {...register("location")}
                                                error={errors.location?.message} placeholder="Street address"
                                                icon={MapPinIcon }/>
                                <TextInputField label="Country" {...register("country")} error={errors.country?.message}
                                                autoComplete="country-name" placeholder="Country"
                                                icon={Globe}/>
                                <TextInputField label="Postal Code" {...register("postal_code")}
                                                error={errors.postal_code?.message} autoComplete="postal-code"
                                                placeholder="Postal/ZIP code" icon={MapPinIcon }/>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 5:
                return (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step?.color} mb-4 shadow-lg`}>
                                <FileText className="w-8 h-8 text-white"/>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{step?.title}</CardTitle>
                            <CardDescription className="text-gray-600">{step?.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                                <FileCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"/>
                                <div>
                                    <p className="text-blue-700 font-medium text-sm">Document Requirements</p>
                                    <p className="text-blue-600 text-sm">Upload clear images or PDFs of your documents.
                                        Multiple files accepted.</p>
                                </div>
                            </div>
                            <FileInputField label="Citizenship Card" multiple accept="image/*,application/pdf"
                                            error={errors.vendor_citizenship_card?.message}/>
                            <FileInputField label="Tax Certificate" multiple accept="image/*,application/pdf"
                                            error={errors.vendor_tax_certificate?.message}/>
                            <FileInputField label="Business License" multiple accept="image/*,application/pdf"
                                            error={errors.vendor_business_license?.message}/>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    const onSubmit = async (data: VendorFormValues): Promise<void> => {
        try {
            console.log(' Vendor FormData',data)
            setSubmitStatus("idle");
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSubmitStatus("success");
        } catch {
            setSubmitStatus("error");
        }
    };

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-xl">
                        <Store className="w-10 h-10 text-white"/>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Vendor
                        Registration</h1>
                    <p className="text-xl text-gray-600 mb-4">Join our marketplace and start growing your business</p>
                    <div className="flex items-center justify-center space-x-4">
                        <Badge variant="outline" className="px-3 py-1">Step {currentStep} of {steps.length}</Badge>
                        <Badge variant="secondary" className="px-3 py-1">{getStepProgress()}% Complete</Badge>
                    </div>
                </div>

                <AnimatePresence>
                    {submitStatus === "success" && (
                        <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -20}}
                                    className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 shadow-sm">
                            <CheckCircle className="w-5 h-5 text-green-600"/>
                            <div>
                                <p className="text-green-700 font-semibold">Registration Submitted Successfully!</p>
                                <p className="text-green-600 text-sm">We&#39;ll review your application and get back to you
                                    soon.</p>
                            </div>
                        </motion.div>
                    )}
                    {submitStatus === "error" && (
                        <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -20}}
                                    className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-600"/>
                            <div>
                                <p className="text-red-700 font-semibold">Submission Failed</p>
                                <p className="text-red-600 text-sm">Please check your information and try again.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = completedSteps.includes(step.id);
                            const isClickable = step.id <= currentStep || completedSteps.includes(step.id - 1);
                            return (
                                <div key={step.id} className="flex-1 flex items-center">
                                    <div onClick={() => isClickable && handleStepClick(step.id)}
                                         className={`flex flex-col items-center transition-all duration-200 group ${isClickable ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"}`}>
                                        <div
                                            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2 shadow-lg transition-all duration-300 ${isCompleted || isActive ? `bg-gradient-to-r ${step.color} border-transparent text-white` : "border-gray-300 text-gray-500 bg-white group-hover:border-gray-400"}`}>
                                            <Icon className="w-5 h-5"/>
                                        </div>
                                        <p className={`text-sm font-medium transition-colors ${isActive || isCompleted ? "text-gray-900" : "text-gray-500"}`}>{step.title}</p>
                                    </div>
                                    {index < steps.length - 1 &&
                                        <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full overflow-hidden">
                                            <div
                                                className={`h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${completedSteps.includes(step.id) ? "w-full" : "w-0"}`}/>
                                        </div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep} initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -50}} transition={{duration: 0.3}}>
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-6">
                        <div>{currentStep > 1 && <Button type="button" onClick={handlePrevious} variant="outline"
                                                         className="flex items-center space-x-2 px-6 py-3 hover:bg-gray-50"><ChevronLeft
                            className='w-4 h-4'/><span>Previous</span></Button>}</div>
                        <div className="flex space-x-4">
                            {currentStep < steps.length ? (
                                <Button type="button" onClick={handleNext}
                                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                                    <span>Next Step</span>
                                    <ChevronRight className="w-4 h-4"/>
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}
                                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg disabled:opacity-50">
                                    {isSubmitting ? <><Loader2
                                        className="w-4 h-4 animate-spin"/><span>Submitting...</span></> : <><CheckCircle
                                        className="w-4 h-4"/><span>Submit Registration</span></>}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
