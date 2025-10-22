import type {NextConfig} from "next";

const nextConfig: NextConfig = {

    images: {
        qualities:[90,75],
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
            },{
                protocol: "http",
                hostname: "192.168.100.18",
                pathname: "/storage/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
};

export default nextConfig;
