'use client'
import {use} from "react";
import ProductManageForm from "@/components/product/product-form";

interface EditProductProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function EditVendor({params}: EditProductProps) {
    const {slug} = use(params);

    return (
        <ProductManageForm
            mode="edit"
            productUuid={slug}
        />
    );
}
