"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactNode, useState} from "react";
import {QUERY_STALE_TIME} from "@/config/app-constant";

export default function ReactQueryProvider({
                                               children
                                           }: {
    children: ReactNode
}) {
    const [queryClient] = useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: QUERY_STALE_TIME,
                    gcTime: 10 * 60 * 1000,
                    retry: 2,
                    refetchOnWindowFocus: true,
                },
            },
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
