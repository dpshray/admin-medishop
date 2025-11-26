"use client"

import React, { useState } from "react"
import * as XLSX from "xlsx"
import { ProductCreate, Variation } from "@/lib/schema/productSchema"
import { Button } from "@/components/ui/button"

const BulkProductPreview: React.FC = () => {
    const [file, setFile] = useState<File | null>(null)
    const [productsJSON, setProductsJSON] = useState<ProductCreate[] | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    // Map rows to ProductCreate, grouping variations by product name + brand
    const mapRowsToProducts = (rows: any[]): ProductCreate[] => {
        const productsMap: Record<string, ProductCreate> = {}

        rows.forEach((row) => {
            const productKey = row.name + "_" + row.brand_id
            const variation: Variation = {
                variant_name: row.variant_name,
                variant_price: Number(row.variant_price),
                variant_stock: Number(row.variant_stock),
                variant_unit: row.variant_unit,
                variant_expiry_date: row.variant_expiry_date,
                variant_batch_no: row.variant_batch_no,
                variant_manufacturer: row.variant_manufacturer
            }

            if (!productsMap[productKey]) {
                productsMap[productKey] = {
                    brand_id: Number(row.brand_id),
                    name: row.name,
                    description: row.description,
                    categories: row.categories.split("|").map(Number),
                    tags: row.tags.split("|").map(Number),
                    prescription_required: row.prescription_required === "true",
                    generic_product_name_id: Number(row.generic_product_name_id),
                    featured_image: new File([], row.featured_image),
                    gallery_images: row.gallery_images.split("|").map((f: string) => new File([], f)),
                    health_condition: row.health_condition.split("|").map(Number),
                    discount_percent: Number(row.discount_percent),
                    variations: [variation]
                }
            } else {
                productsMap[productKey].variations.push(variation)
            }
        })

        return Object.values(productsMap)
    }

    const handlePreview = () => {
        if (!file) return alert("Please select a file first")
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const rows: any[] = XLSX.utils.sheet_to_json(sheet)
            const products = mapRowsToProducts(rows)
            setProductsJSON(products)
        }
        reader.readAsArrayBuffer(file)
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bulk Product Preview (JSON)</h2>
            <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} />
            <Button onClick={handlePreview} disabled={!file}>
                Preview Products
            </Button>

            {productsJSON && (
                <div className="mt-4 max-h-[500px] overflow-auto rounded border border-gray-300 p-4 bg-gray-50">
                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(productsJSON, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}

export default BulkProductPreview
