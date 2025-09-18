"use client"

import {useState} from "react"
import {useTags} from "@/hooks/useTags"

export default function TagShow() {
    const [page, setPage] = useState(0)
    const [perPage, setPerPage] = useState(0)

    const {tags, totalPages, totalItems, isLoading, refetch} = useTags()

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">Tags</h1>

            {isLoading ? (
                <div>Loading...</div>
            ) : tags.length === 0 ? (
                <div>No tags found</div>
            ) : (
                <ul className="space-y-2">
                    {tags.map(tag => (
                        <li key={tag.id} className="p-3 border rounded-md flex justify-between items-center">
                            <span className="font-medium text-gray-800">{tag.name}</span>
                            <span className="text-sm text-gray-500">{tag.slug}</span>
                        </li>
                    ))}
                </ul>
            )}

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                        disabled={page === 0}
                    >
                        Previous
                    </button>
                    <span>
            Page {page + 1} of {totalPages} ({totalItems} items)
          </span>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                        disabled={page + 1 >= totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
