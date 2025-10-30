import PackageForm from "@/components/package/package-form";

interface EditPackageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditPackageForm({ params }: EditPackageProps) {
    const { slug } = await params;

    return (
        <div>
            <PackageForm mode="edit" slug={slug} />
        </div>
    );
}
