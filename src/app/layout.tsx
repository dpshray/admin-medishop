import type {Metadata} from "next"
import {Geist, Geist_Mono} from "next/font/google"
import "./globals.css"
import ReactQueryProvider from "@/Providers/ReactQueryProvider"
import {Toaster} from "sonner"
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: {
        default: "Nepal Medishop Admin",
        template: "%s | Nepal Medishop Admin",
    },
    description:
        "Admin dashboard for Nepal Medishop. Manage products, orders, users, and analytics securely in one place.",
    keywords: [
        "Nepal Medishop Admin",
        "pharmacy admin dashboard",
        "medical store management",
        "order management Nepal",
        "admin panel Medishop",
    ],
    authors: [{name: "Nepal Medishop"}],
    creator: "Nepal Medishop",
    publisher: "Nepal Medishop",
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_WEBSITE_URL || "https://admin-medishop.vercel.app"
    ),
    openGraph: {
        type: "website",
        url: "https://admin-medishop.vercel.app",
        title: "Nepal Medishop Admin Dashboard",
        description:
            "Secure admin dashboard for Nepal Medishop. Manage medicines, healthcare products, orders, and customer data.",
        siteName: "Nepal Medishop Admin",
        images: [
            {
                url: "https://admin-medishop.vercel.app/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Nepal Medishop Admin",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Nepal Medishop Admin Dashboard",
        description:
            "Admin dashboard for managing products, orders, and analytics on Nepal Medishop.",
        images: ["https://admin-medishop.vercel.app/og-image.jpg"],
    },
    alternates: {
        canonical: "https://admin-medishop.vercel.app",
    },
    robots: {
        index: false,
        follow: false,
    },
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="h-full overflow-x-hidden " data-scroll-behavior="smooth">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        >
        <Toaster position="top-right" richColors/>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        </body>
        </html>
    )
}
