"use client";

import { useQuery } from "@tanstack/react-query";
import authService from "@/service/auth.service";
import { memo, useMemo, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Mail,
  Shield,
  Smartphone,
  User,
  Edit,
  RefreshCw,
  Camera,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfileForm from "@/components/Profile-from";

interface UserProfile {
  name: string;
  email: string;
  status: "Active" | "Inactive";
  user_type: string;
  mobile_number: string;
  image: string;
}

const InfoCard = memo(
  ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="group relative flex items-start gap-4 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300">
      <div className="flex-shrink-0 p-3 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
        <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-base font-medium text-foreground break-words">
          {value}
        </p>
      </div>
    </div>
  ),
);
InfoCard.displayName = "InfoCard";

const ProfileSkeleton = memo(() => (
  <div className="space-y-8">
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
        <CardContent className="p-6 -mt-16 flex flex-col items-center space-y-6">
          <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
          <div className="space-y-2 w-full text-center">
            <Skeleton className="h-7 w-40 mx-auto" />
            <Skeleton className="h-5 w-24 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </CardContent>
      </Card>
    </div>
  </div>
));
ProfileSkeleton.displayName = "ProfileSkeleton";

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ProfileDetails() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await authService.getLoggedInUser();
      return res.data;
    },
    retry: 2,
  });
  // console.log(profile)

  const statusConfig = useMemo(() => {
    const isActive = profile?.status === "Active";
    return {
      variant: isActive ? "default" : "destructive",
      color: isActive ? "text-green-600" : "text-red-600",
      bg: isActive
        ? "bg-green-50 dark:bg-green-950"
        : "bg-red-50 dark:bg-red-950",
    };
  }, [profile?.status]);

  const handleOpenEditModal = useCallback(() => setIsEditModalOpen(true), []);
  const handleCloseEditModal = useCallback(() => setIsEditModalOpen(false), []);
  const handleModalChange = useCallback(
    (open: boolean) => setIsEditModalOpen(open),
    [],
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
        <Alert variant="destructive" className="max-w-lg shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base">
            Unable to load your profile. Please check your connection and try
            again.
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              View and manage your personal information
            </p>
          </div>
          {!isLoading && profile && (
            <Button
              onClick={handleOpenEditModal}
              size="lg"
              className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="overflow-hidden shadow-lg py-0">
              <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
              <CardContent className="p-6 -mt-16 flex flex-col items-center space-y-6">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
                    <AvatarImage
                      src={profile.image}
                      alt={profile.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1 p-2 rounded-full bg-background border-2 border-primary shadow-lg">
                    <Camera className="w-4 h-4 text-primary" />
                  </div>
                </div>

                <div className="text-center space-y-3 w-full">
                  <h2 className="text-2xl font-bold text-foreground break-words">
                    {profile.name}
                  </h2>
                  <Badge
                    variant={statusConfig.variant as any}
                    className="font-semibold px-4 py-1 text-sm"
                  >
                    {profile.status}
                  </Badge>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {profile.user_type}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="space-y-2 pb-6">
                <h3 className="text-2xl font-bold text-foreground">
                  Contact Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your registered contact information
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoCard icon={User} label="Full Name" value={profile.name} />
                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={profile.email}
                />
                <InfoCard
                  icon={Smartphone}
                  label="Mobile Number"
                  value={profile.mobile_number}
                />
                <InfoCard
                  icon={Shield}
                  label="Account Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} font-medium text-sm`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${profile.status === "Active" ? "bg-green-600" : "bg-red-600"}`}
                      />
                      {profile.status}
                    </span>
                  }
                />
              </CardContent>
            </Card>
          </div>
        ) : null}

        <ProfileForm
          open={isEditModalOpen}
          onOpenChangeAction={handleModalChange}
          onCloseAction={handleCloseEditModal}
          onSuccessAction={refetch}
        />
      </div>
    </div>
  );
}
