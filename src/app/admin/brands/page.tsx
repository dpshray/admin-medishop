"use client";

import {useCallback, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Building2, Plus} from "lucide-react";
import ConfirmModal from "@/components/modal/ConfirmModal";
import brandService from "@/service/brand.service";
import CustomPagination from "@/components/custom-pagination";

import BrandCardSkeleton from "@/components/brand/BrandCardSkeleton";
import BrandCard, {Brand} from "@/components/brand/brand-card";
import {BrandFormModal} from "@/components/brand/BrandFormModal";

export default function BrandPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const fetchBrands = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                per_page: 12,
            };
            const res = await brandService.getAllBrands(params);
            setBrands(res?.data?.items || []);
            setCurrentPage(res?.data?.page || 1);
            setTotalPages(res?.data?.total_page || 1);
        } catch (err: any) {
            setError(err?.message || "Failed to fetch brands");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const handleDelete = useCallback(async () => {
        if (!selectedBrand) return;
        setActionLoading(true);
        try {
            await brandService.deleteBrand(selectedBrand.id);
            await fetchBrands(currentPage);
            setIsDeleteModalOpen(false);
            setSelectedBrand(null);
        } catch (err: any) {
            setError(err?.message || "Failed to delete brand");
        } finally {
            setActionLoading(false);
        }
    }, [selectedBrand, currentPage, fetchBrands]);

    const handleSave = async (data: any) => {
        setActionLoading(true);
        console.log('Data before saving', data)
        try {
            if (editingBrand) {
                await brandService.updateBrand(editingBrand.id, data);
                await fetchBrands(currentPage);
                setIsModalOpen(false);
                setEditingBrand(null);
            } else {
               const response=await brandService.createBrand(data);
               console.log(' Respone after saving',response)
            }
        } catch (err: any) {
            setError(err?.message || "Failed to save brand");
        } finally {
            setActionLoading(false);
            setIsModalOpen(false);
            setEditingBrand(null);
        }
    }

    const filteredBrands = brands.filter(
        (b) =>
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            <div
                className="container mx-auto px-4 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-purple-600"/>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brand Management</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your pharmaceutical brand portfolio</p>
                    </div>
                </div>
                <Button
                    className="bg-purple-600 hover:bg-purple-700 shrink-0"
                    onClick={() => {
                        setEditingBrand(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2"/> Add Brand
                </Button>
            </div>

            <div className="container mx-auto px-4 max-w-md relative mb-6">
                <Input
                    placeholder="Search brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
            </div>

            {loading && brands.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({length: 12}).map((_, index) => (
                        <BrandCardSkeleton key={index}/>
                    ))}
                </div>
            )}

            {error && <p className="text-red-600 text-center">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBrands.map((brand) => (
                    <BrandCard
                        key={brand.id}
                        brand={brand}
                        actionLoading={actionLoading && selectedBrand?.id === brand.id}
                        onViewAction={(b) => console.log("View", b)}
                        onEditAction={(b) => {
                            setEditingBrand(b);
                            setIsModalOpen(true);
                        }}
                        onDeleteAction={(b) => {
                            setSelectedBrand(b);
                            setIsDeleteModalOpen(true);
                        }}
                    />
                ))}
            </div>

            <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChangeAction={(page) => fetchBrands(page)}
                className="mt-6"
            />

            <ConfirmModal
                open={isDeleteModalOpen}
                setOpen={setIsDeleteModalOpen}
                title="Delete Brand"
                description={`Are you sure you want to delete "${selectedBrand?.name}"?`}
                loading={actionLoading}
                onConfirm={handleDelete}
            />

            <BrandFormModal
                open={isModalOpen}
                onCloseAction={() => setIsModalOpen(false)}
                onSubmitAction={handleSave}
                isLoading={actionLoading}
                initialData={editingBrand || undefined}
            />
        </div>
    );
}
