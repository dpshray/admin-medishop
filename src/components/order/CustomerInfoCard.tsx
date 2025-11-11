'use client'

import {memo} from 'react'
import {User} from "lucide-react"

interface OrderData {
    name: string
    email: string
    mobile: string
    address: string
    latitude?: string
    longitude?: string
    created_at: string
}

interface CustomerInfoProps {
    data: OrderData
}

const CustomerInfo = memo(function CustomerInfo({data}: CustomerInfoProps) {
    return (
        <section aria-labelledby="customer-info-heading">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true"/>
                <h2 id="customer-info-heading" className="text-base sm:text-lg lg:text-xl font-bold text-slate-800">
                    Customer Information
                </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200">
                <dl className="space-y-3 sm:space-y-4">
                    <div>
                        <dt className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                            Full Name
                        </dt>
                        <dd className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                            {data.name}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                            Email
                        </dt>
                        <dd className="text-xs sm:text-sm text-slate-900 break-all">
                            {data.email}
                        </dd>
                    </div>
                </dl>
                <dl className="space-y-3 sm:space-y-4">
                    <div>
                        <dt className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                            Mobile
                        </dt>
                        <dd className="text-sm sm:text-base font-semibold text-slate-900">
                            {data.mobile}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                            Address
                        </dt>
                        <dd className="text-xs sm:text-sm text-slate-900 break-words leading-relaxed">
                            {data.address}
                        </dd>
                        {data.latitude && data.longitude && (
                            <div>
                                <dt className="text-xs sm:text-sm text-slate-500 font-medium mb-1">
                                    Location
                                </dt>
                                <dd className="text-xs sm:text-sm text-slate-900 break-words leading-relaxed">
                                    {data.latitude}, {data.longitude}
                                </dd>
                            </div>
                        )}
                    </div>
                </dl>
            </div>
        </section>
    )
})

CustomerInfo.displayName = 'CustomerInfo'

export default CustomerInfo