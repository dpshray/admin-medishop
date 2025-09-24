import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    // async redirects() {
    //     return [
    //         {
    //             source: '/admin/products/edit-product',
    //             destination: '/admin/products',
    //             permanent: true,
    //         }
    //     ];
    // },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.pexels.com",
            },
            {
                protocol: "https",
                hostname: "api.medishop.dworklabs.com",
                port: '',
                pathname: '/storage/**',
            },
            {
                protocol: "https",
                hostname: "api.medishop.dworklabs.com",
                port: "",
                pathname: "/assets/img/**",
            },
            {
                protocol: "http",
                hostname: '192.168.100.23'
            }
        ],
    },
};

export default nextConfig;
