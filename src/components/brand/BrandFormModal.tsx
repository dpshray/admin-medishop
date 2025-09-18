"use client"

import * as React from "react"
import {Controller, useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useQuery} from "@tanstack/react-query"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {Loader2} from "lucide-react"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import brandService from "@/service/brand.service"

const createBrandSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    image: z.instanceof(File).optional(),
    is_featured: z.boolean().default(false),
    is_popular: z.boolean().default(false),
    slug: z.string().optional(),
})

const updateBrandSchema = z.object({
    name: z.string().max(100, "Name must be less than 100 characters").optional(),
    image: z.instanceof(File).optional(),
    is_featured: z.boolean().optional(),
    is_popular: z.boolean().optional(),
    slug: z.string().optional(),
})

type BrandFormValues = z.infer<typeof createBrandSchema> | z.infer<typeof updateBrandSchema>

interface Brand {
    id: number
    name: string
    slug: string
    image?: string
    is_featured: boolean
    is_popular: boolean
}

interface BrandFormModalProps {
    open: boolean
    onCloseAction: () => void
    onSubmitAction: (data: BrandFormValues) => Promise<void> | void
    slug?: string
    isLoading?: boolean
}

export function BrandFormModal({
                                   open,
                                   onCloseAction,
                                   onSubmitAction,
                                   slug,
                                   isLoading = false,
                               }: BrandFormModalProps) {
    const isEditMode = Boolean(slug)

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: {errors, isSubmitting, isDirty},
    } = useForm<BrandFormValues>({
        resolver: zodResolver(isEditMode ? updateBrandSchema : createBrandSchema) as any,
        defaultValues: {
            name: "",
            image: undefined,
            is_featured: false,
            is_popular: false,
            slug: undefined,
        },
    })

    const {data: brandDetails, isLoading: isFetching} = useQuery<Brand>({
        queryKey: ["brand-details", slug],
        queryFn: async () => {
            if (!slug) throw new Error("Missing slug")
            const res = await brandService.getBrandBySlug(slug)
            return res.data
        },
        enabled: isEditMode,
    })

    React.useEffect(() => {
        if (open && brandDetails) {
            reset({
                name: brandDetails.name,
                image: undefined,
                is_featured: brandDetails.is_featured,
                is_popular: brandDetails.is_popular,
                slug: brandDetails.slug,
            })
        }

        if (!open) {
            reset()
        }
    }, [open, brandDetails, reset])

    const handleFormSubmit = async (data: BrandFormValues) => {
        await onSubmitAction(data)
        reset()
        onCloseAction()
    }

    const handleDialogChange = (value: boolean) => {
        if (!value && !isSubmitting && !isLoading) {
            reset()
            onCloseAction()
        }
    }

    const disabled = isSubmitting || isLoading || isFetching

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="w-full max-w-xl mx-auto px-6 py-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {isEditMode ? "Edit Brand" : "Create New Brand"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <TextInputField
                        {...register("name")}
                        label="Brand Name"
                        placeholder="Enter brand name"
                        error={errors.name?.message}
                        disabled={disabled}
                        required={!isEditMode}
                    />

                    <FileInputField
                        label={`Brand Image${isEditMode ? " (Optional)" : ""}`}
                        accept="image/*"
                        disabled={disabled}
                        onFileChange={(files: File[]) => setValue("image", files[0] || undefined)}
                        error={errors.image?.message as string}
                    />

                    {brandDetails?.image && (
                        <div className="flex items-center gap-2">
                            <img
                                src={brandDetails.image}
                                alt={brandDetails.name}
                                width={100}
                                height={100}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:gap-6 gap-4">
                        <Controller
                            name="is_featured"
                            control={control}
                            render={({field}) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_featured"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                        disabled={disabled}
                                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                    />
                                    <Label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
                                        Featured Brand
                                    </Label>
                                </div>
                            )}
                        />

                        <Controller
                            name="is_popular"
                            control={control}
                            render={({field}) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_popular"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                        disabled={disabled}
                                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                    />
                                    <Label htmlFor="is_popular" className="text-sm font-medium cursor-pointer">
                                        Popular Brand
                                    </Label>
                                </div>
                            )}
                        />
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDialogChange(false)}
                            disabled={disabled}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={disabled || (!isDirty && isEditMode)}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : isFetching ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    Loading...
                                </>
                            ) : isEditMode ? (
                                "Update Brand"
                            ) : (
                                "Create Brand"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
