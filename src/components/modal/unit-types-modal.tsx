"use client"

import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {useMutation, useQueryClient} from "@tanstack/react-query"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {useEffect, useState} from "react"
import TextInputField from "@/components/field/text-input"

const schema = z.object({
    name: z.string().min(2, "Unit type must be at least 2 characters"),
})

type FormValues = z.infer<typeof schema>

interface UnitTypesModalProps {
    open: boolean
    onCloseAction: () => void
    unit?: { id: string; name: string } | null
}

export function UnitTypesModal({open, onCloseAction, unit}: UnitTypesModalProps) {
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {name: ""},
    })

    useEffect(() => {
        if (unit) {
            setValue("name", unit.name)
        } else {
            reset({name: ""})
        }
    }, [unit, setValue, reset])

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            setLoading(true)
            const res = await fetch(unit ? `/api/unit-types/${unit.id}` : "/api/unit-types", {
                method: unit ? "PUT" : "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            })
            if (!res.ok) throw new Error("Failed to save unit type")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["unit-types"]})
            onCloseAction()
        },
        onSettled: () => setLoading(false),
    })

    function onSubmit(values: FormValues) {
        mutation.mutate(values)
    }

    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogContent className="sm:max-w-lg w-full rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-900">
                <DialogHeader className="text-center mb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {unit ? "Edit Unit Type" : "Add New Unit Type"}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your product unit types for a seamless e-commerce experience
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <TextInputField
                        label="Unit Name"
                        {...register("name")}
                        placeholder="e.g., Tablet, Bottle, Pack"
                        error={errors.name?.message}
                    />

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCloseAction}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
