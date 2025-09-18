"use client"

import * as React from "react"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import TextInputField from "@/components/field/text-input"

const tagSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
})

type TagFormValues = z.infer<typeof tagSchema>

interface TagFormModalProps {
    open: boolean
    onCloseAction: (open: boolean) => void
    onSubmitAction: (values: TagFormValues) => Promise<void> | void
    initialData?: TagFormValues
    loading?: boolean
}

export default function TagFormModal({
                                         open,
                                         onCloseAction,
                                         onSubmitAction,
                                         initialData,
                                         loading = false,
                                     }: TagFormModalProps) {
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm<TagFormValues>({
        resolver: zodResolver(tagSchema),
        defaultValues: {name: ""},
    })

    const isEditMode = Boolean(initialData)

    const handleFormSubmit = async (data: TagFormValues) => {
        await onSubmitAction(data)
        reset()
        onCloseAction(false)
    }

    useEffect(() => {
        if (open) {
            reset(initialData || {name: ""})
        }
    }, [open, initialData, reset])

    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogContent
                className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 py-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {isEditMode ? "Edit Tag" : "Create New Tag"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-6"
                >
                    <TextInputField
                        {...register("name")}
                        label="Tag Name"
                        placeholder="Enter tag name"
                        error={errors.name?.message}
                        disabled={loading}
                    />

                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onCloseAction(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-primaryColor hover:bg-purple-700"
                        >
                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Tag"
                                    : "Create Tag"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
