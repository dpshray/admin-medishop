'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TextInputField from "@/components/field/text-input"
import FileInputField from "@/components/field/file-input"
import authService from '@/service/auth.service'
import { MAX_FILE_SIZE } from "@/config/app-constant"
import {useRouter} from "next/navigation";

const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    mobile_number: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    image: z.instanceof(File).optional()
})

type UpdateUserForm = z.infer<typeof updateUserSchema>

interface UserProfile {
    name: string
    email: string
    status: 'Active' | 'Inactive'
    user_type: string
    mobile_number: string
    image: string
}

interface ProfileFormProps {
    open: boolean
    onOpenChangeAction: (open: boolean) => void
    onCloseAction: () => void
    onSuccessAction?: () => void
}

export default function ProfileForm({ open, onOpenChangeAction, onSuccessAction }: ProfileFormProps) {
    const router = useRouter()
    const { data: profile } = useQuery<UserProfile>({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await authService.getLoggedInUser()
            return res.data
        },
    })

    const form = useForm<UpdateUserForm>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            name: '',
            email: '',
            mobile_number: ''
        },
        mode: 'onChange'
    })

    const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = form

    useEffect(() => {
        if (profile && open) {
            reset({
                name: profile.name,
                email: profile.email,
                mobile_number: profile.mobile_number
            })
        }
    }, [profile, open, reset])

    const onSubmit = useCallback(async (data: UpdateUserForm) => {
        await authService.updateProfile(data).then(() => router.back())
        onSuccessAction?.()
    }, [onSuccessAction, router])

    const handleProfileImage = useCallback((files: File[]) => {
        if (files.length > 0) {
            setValue("image", files[0], { shouldValidate: true })
        }
    }, [setValue])

    const handleClose = useCallback((isOpen: boolean) => {
        onOpenChangeAction(isOpen)
        if (!isOpen) reset()
    }, [onOpenChangeAction, reset])

    const handleCancel = useCallback(() => {
        onOpenChangeAction(false)
        reset()
    }, [onOpenChangeAction, reset])

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-2 pb-4">
                    <DialogTitle className="text-xl sm:text-2xl font-semibold">Update Profile</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Update your profile information
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <TextInputField
                        label="Name"
                        placeholder="Enter name"
                        type="text"
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <TextInputField
                        label="Email"
                        placeholder="Enter email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                        disabled
                    />

                    <TextInputField
                        label="Mobile Number"
                        placeholder="Enter mobile number"
                        type="tel"
                        {...register('mobile_number')}
                        error={errors.mobile_number?.message}
                    />

                    <FileInputField
                        label="Profile Image"
                        accept="image/*"
                        multiple={false}
                        onFileChange={handleProfileImage}
                        error={errors.image?.message}
                        showPreviews
                        maxFileSize={MAX_FILE_SIZE}
                        helperText={`Max file size: ${MAX_FILE_SIZE}KB`}
                        allowedTypes={ ['image/jpeg', 'image/png']}
                    />

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
