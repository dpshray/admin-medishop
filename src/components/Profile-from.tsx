'use client'

import {useCallback, useMemo, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useForm} from 'react-hook-form'
import {Camera, CheckCircle2, Edit2, Loader2, Mail, Phone, Save, Shield, User, XCircle} from 'lucide-react'
import authService from '@/service/auth.service'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Card, CardContent} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Separator} from '@/components/ui/separator'
import {toast} from 'sonner'
import {StatusBadge} from "@/lib/helper"
import TextInputField from "@/components/field/text-input"

interface UserProfile {
    name: string
    email: string
    status: string
    user_type: string
    mobile_number: string
    image: string
}

interface ProfileFormData {
    name: string
    email: string
    mobile_number: string
    image: string
}

export default function ProfileFrom() {
    const [isEditing, setIsEditing] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const queryClient = useQueryClient()

    const {data: profile, isLoading} = useQuery<UserProfile>({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await authService.getLoggedInUser()
            return res.data
        }
    })

    const {register, handleSubmit, formState: {errors, isDirty}, reset, setValue} = useForm<ProfileFormData>({
        defaultValues: profile,
        values: profile
    })

    const updateMutation = useMutation({
        mutationFn: async (data: ProfileFormData) => {
            return await authService.updateProfile(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile']})
            setIsEditing(false)
            setPreviewImage(null)
            setImageFile(null)
            toast.success('Profile updated successfully', {
                description: 'Your changes have been saved',
            })
        },
        onError: (error: any) => {
            toast.error('Failed to update profile', {
                description: error?.message || 'Please try again later',
            })
        }
    })

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large', {
                    description: 'Please select an image under 5MB',
                })
                return
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Invalid file type', {
                    description: 'Please select an image file',
                })
                return
            }

            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setPreviewImage(result)
                setValue('image', result, {shouldDirty: true})
            }
            reader.readAsDataURL(file)
        }
    }, [setValue])

    const onSubmit = useCallback((data: ProfileFormData) => {
        updateMutation.mutate(data)
    }, [updateMutation])

    const handleCancel = useCallback(() => {
        reset()
        setIsEditing(false)
        setPreviewImage(null)
        setImageFile(null)
    }, [reset])

    const getInitials = useMemo(() => (name: string) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U'
    }, [])

    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        handleSubmit(onSubmit)(e)
    }, [handleSubmit, onSubmit])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20" role="status" aria-live="polite">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#4a358e]" aria-hidden="true"/>
                    <p className="text-base font-medium text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
            <div className="w-full mx-auto max-w-7xl">
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#4a358e] to-[#6b4fc0] bg-clip-text text-transparent">
                        Account Settings
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
                        Manage your profile information and preferences
                    </p>
                </header>

                <Card className="border-2 border-border hover:border-[#4a358e]/40 transition-all duration-300 shadow-lg hover:shadow-2xl backdrop-blur-sm bg-card/95">
                    <CardContent className="p-4 sm:p-6 lg:p-10">
                        <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
                            <div className="flex flex-col items-center lg:items-start space-y-6">
                                <div className="relative group w-full flex justify-center lg:justify-start">
                                    <div className="relative">
                                        <Avatar className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 border-4 border-background shadow-2xl ring-4 ring-[#4a358e]/20 transition-all duration-300 hover:ring-[#4a358e]/40">
                                            <AvatarImage
                                                src={previewImage || profile?.image}
                                                alt={`${profile?.name}'s profile picture`}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="text-3xl sm:text-4xl lg:text-5xl text-white bg-gradient-to-br from-[#4a358e] to-[#6b4fc0]">
                                                {profile?.name ? getInitials(profile.name) : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <Label
                                                htmlFor="avatar-upload"
                                                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-[#4a358e] hover:bg-[#5a459e] rounded-full p-2.5 sm:p-3 cursor-pointer transition-all shadow-lg hover:shadow-xl hover:scale-110 focus-within:ring-2 focus-within:ring-[#4a358e] focus-within:ring-offset-2"
                                                tabIndex={0}
                                                role="button"
                                                aria-label="Upload profile picture"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        document.getElementById('avatar-upload')?.click()
                                                    }
                                                }}
                                            >
                                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true"/>
                                                <Input
                                                    id="avatar-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="sr-only"
                                                    aria-label="Choose profile picture file"
                                                />
                                            </Label>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center lg:text-left w-full space-y-4">
                                    <div className="space-y-2">
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground capitalize">{profile?.name}</h2>
                                        <p className="text-muted-foreground flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base">
                                            <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true"/>
                                            <span className="break-all">{profile?.email}</span>
                                        </p>
                                    </div>

                                    <Separator className="bg-border/60"/>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-1 sm:p-2  rounded-lg bg-muted/50 border border-border/60 transition-all duration-200 hover:bg-muted/70 hover:border-[#4a358e]/30">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-2 rounded-md bg-background/80">
                                                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#4a358e]" aria-hidden="true"/>
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-foreground">Account Status</span>
                                            </div>
                                            <StatusBadge status={profile?.status as 'Active' | 'Inactive'}/>
                                        </div>
                                        <div className="flex items-center justify-between p-1 sm:p-2  rounded-lg bg-muted/50 border border-border/60 transition-all duration-200 hover:bg-muted/70 hover:border-[#4a358e]/30">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-2 rounded-md bg-background/80">
                                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#4a358e]" aria-hidden="true"/>
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-foreground">User Role</span>
                                            </div>
                                            <StatusBadge status={profile?.user_type as string}/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-foreground">Personal Information</h3>
                                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Update your account details</p>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            size="default"
                                            className="gap-2 self-start sm:self-auto transition-all bg-[#4a358e] hover:bg-[#5a459e] text-white shadow-md hover:shadow-lg h-10 sm:h-11 px-4 sm:px-6"
                                            aria-label="Edit profile information"
                                        >
                                            <Edit2 className="w-4 h-4" aria-hidden="true"/>
                                            <span className="text-sm sm:text-base font-medium">Edit Profile</span>
                                        </Button>
                                    )}
                                </div>

                                <Separator className="bg-border/60"/>

                                <div onSubmit={handleFormSubmit} className="space-y-6">
                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                                                <User className="w-4 h-4 text-[#4a358e]" aria-hidden="true"/>
                                                Full Name
                                            </Label>
                                            {isEditing ? (
                                                <TextInputField
                                                    placeholder="Enter your name"
                                                    {...register('name', {
                                                        required: 'Name is required',
                                                        minLength: {
                                                            value: 2,
                                                            message: 'Name must be at least 2 characters'
                                                        }
                                                    })}
                                                    className=" text-sm sm:text-base focus-visible:ring-[#4a358e] focus-visible:border-[#4a358e]"
                                                    error={errors.name?.message}
                                                />
                                            ) : (
                                                <div className="p-1 sm:p-2  rounded-lg bg-muted/50 border border-border/60 min-h-8 sm:min-h-8 flex items-center transition-colors hover:bg-muted/70">
                                                    <p className="font-medium text-sm sm:text-base text-foreground">{profile?.name}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mobile_number" className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                                                <Phone className="w-4 h-4 text-[#4a358e]" aria-hidden="true"/>
                                                Mobile Number
                                            </Label>
                                            {isEditing ? (
                                                <TextInputField
                                                    placeholder="Enter mobile number"
                                                    {...register('mobile_number', {
                                                        required: 'Mobile number is required',
                                                        pattern: {
                                                            value: /^[0-9]{10}$/,
                                                            message: 'Must be 10 digits'
                                                        }
                                                    })}
                                                    className=" text-sm sm:text-base focus-visible:ring-[#4a358e] focus-visible:border-[#4a358e]"
                                                    error={errors.mobile_number?.message}
                                                />
                                            ) : (
                                                <div className="p-1 sm:p-2 rounded-lg bg-muted/50 border border-border/60 min-h-8 sm:min-h-8 flex items-center transition-colors hover:bg-muted/70">
                                                    <p className="font-medium text-sm sm:text-base text-foreground">{profile?.mobile_number}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                                            <Mail className="w-4 h-4 text-[#4a358e]" aria-hidden="true"/>
                                            Email Address
                                        </Label>
                                        {isEditing ? (
                                            <TextInputField
                                                placeholder="Enter your email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                                className=" text-sm sm:text-base focus-visible:ring-[#4a358e] focus-visible:border-[#4a358e]"
                                                error={errors.email?.message}
                                            />
                                        ) : (
                                            <div className="p-1 sm:p-2  rounded-lg bg-muted/50 border border-border/60 min-h-8 sm:min-h-8 flex items-center transition-colors hover:bg-muted/70">
                                                <p className="font-medium text-sm sm:text-base text-foreground break-all">{profile?.email}</p>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <>
                                            <Separator className="my-6 bg-border/60"/>
                                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                    disabled={updateMutation.isPending}
                                                    className="w-full sm:w-auto gap-2  border-2 border-border hover:bg-muted/50 hover:border-[#4a358e]/30 transition-all"
                                                    aria-label="Cancel editing"
                                                >
                                                    <XCircle className="w-4 h-4" aria-hidden="true"/>
                                                    <span className="text-sm sm:text-base font-medium">Cancel</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={handleFormSubmit}
                                                    disabled={updateMutation.isPending || !isDirty}
                                                    className="w-full sm:w-auto gap-2  bg-[#4a358e] hover:bg-[#5a459e] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Save profile changes"
                                                >
                                                    {updateMutation.isPending ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true"/>
                                                            <span className="text-sm sm:text-base font-medium">Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" aria-hidden="true"/>
                                                            <span className="text-sm sm:text-base font-medium">Save Changes</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}