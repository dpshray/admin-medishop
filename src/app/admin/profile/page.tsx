'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Camera, Loader2, Mail, Phone, Shield, User, CheckCircle2, XCircle, Edit2, Save } from 'lucide-react'
import authService from '@/service/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

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

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const queryClient = useQueryClient()

    const { data: profile, isLoading } = useQuery<UserProfile>({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await authService.getLoggedInUser()
            return res.data
        }
    })

    const { register, handleSubmit, formState: { errors, isDirty }, reset, setValue, watch } = useForm<ProfileFormData>({
        defaultValues: profile,
        values: profile
    })

    const watchedFields = watch()

    const updateMutation = useMutation({
        mutationFn: async (data: ProfileFormData) => {
            return await authService.updateProfile(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                setValue('image', result, { shouldDirty: true })
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = (data: ProfileFormData) => {
        updateMutation.mutate(data)
    }

    const handleCancel = () => {
        reset()
        setIsEditing(false)
        setPreviewImage(null)
        setImageFile(null)
    }

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U'
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
            <div className="w-full mx-auto max-w-5xl">
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your profile information and preferences</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1 border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="text-center pb-4">
                            <div className="flex justify-center mb-4">
                                <div className="relative group">
                                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl ring-2 ring-primary/10">
                                        <AvatarImage
                                            src={previewImage || profile?.image}
                                            alt={profile?.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                                            {profile?.name ? getInitials(profile.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isEditing && (
                                        <Label
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-2 right-2 bg-primary rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-110 group-hover:shadow-xl"
                                        >
                                            <Camera className="w-4 h-4 text-primary-foreground" />
                                            <Input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="sr-only"
                                            />
                                        </Label>
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-2xl">{profile?.name}</CardTitle>
                            <CardDescription className="flex items-center justify-center gap-2 mt-2">
                                <Mail className="w-4 h-4" />
                                {profile?.email}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Status</span>
                                    </div>
                                    <Badge
                                        variant={profile?.status === 'Active' ? 'default' : 'secondary'}
                                        className="gap-1"
                                    >
                                        {profile?.status === 'Active' ? (
                                            <CheckCircle2 className="w-3 h-3" />
                                        ) : (
                                            <XCircle className="w-3 h-3" />
                                        )}
                                        {profile?.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Role</span>
                                    </div>
                                    <Badge variant="outline" className="font-semibold">
                                        {profile?.user_type}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-2 hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Personal Information</CardTitle>
                                    <CardDescription>Update your account details here</CardDescription>
                                </div>
                                {!isEditing && (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        size="default"
                                        className="gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            Full Name
                                        </Label>
                                        {isEditing ? (
                                            <div>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    {...register('name', {
                                                        required: 'Name is required',
                                                        minLength: {
                                                            value: 2,
                                                            message: 'Name must be at least 2 characters'
                                                        }
                                                    })}
                                                    className={`transition-all ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" />
                                                        {errors.name.message}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-muted/50 border">
                                                <p className="font-medium">{profile?.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobile_number" className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            Mobile Number
                                        </Label>
                                        {isEditing ? (
                                            <div>
                                                <Input
                                                    id="mobile_number"
                                                    type="tel"
                                                    placeholder="Enter mobile number"
                                                    {...register('mobile_number', {
                                                        required: 'Mobile number is required',
                                                        pattern: {
                                                            value: /^[0-9]{10}$/,
                                                            message: 'Must be 10 digits'
                                                        }
                                                    })}
                                                    className={`transition-all ${errors.mobile_number ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                />
                                                {errors.mobile_number && (
                                                    <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" />
                                                        {errors.mobile_number.message}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-muted/50 border">
                                                <p className="font-medium">{profile?.mobile_number}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        Email Address
                                    </Label>
                                    {isEditing ? (
                                        <div>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                                className={`transition-all ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" />
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-lg bg-muted/50 border">
                                            <p className="font-medium">{profile?.email}</p>
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={updateMutation.isPending}
                                                className="w-full sm:w-auto gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleSubmit(onSubmit)}
                                                disabled={updateMutation.isPending || !isDirty}
                                                className="w-full sm:w-auto gap-2"
                                            >
                                                {updateMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}