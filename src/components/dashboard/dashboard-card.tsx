'use client'

import {memo} from 'react'
import {motion} from 'framer-motion'
import {LucideIcon, TrendingUp} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'

interface DashboardCardProps {
    title: string
    value: string
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
    icon: LucideIcon
    color?: string
    bgColor?: string
    index?: number
    className?: string
    progressValue?: number
    showProgress?: boolean
}

export const DashboardCard = memo(
    ({
         title,
         value,
         change,
         changeType = 'positive',
         icon: Icon,
         color = 'text-primary',
         bgColor = 'bg-primary/10',
         index = 0,
         className,
         progressValue,
         showProgress = false,
     }: DashboardCardProps) => {
        const isPositive = changeType === 'positive'
        const calculatedProgress = progressValue ?? Math.min(65 + index * 8, 100)

        return (
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.1, duration: 0.3}}
                whileHover={{scale: 1.02, transition: {duration: 0.2}}}
                className={cn('w-full', className)}
            >
                <Card
                    className={cn('relative overflow-hidden rounded-xl border bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20'
                    ,'py-0 gap-2')}
                    role="article"
                    aria-label={`${title}: ${value}`}
                >
                    <div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none"
                        aria-hidden="true"
                    />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6">
                        <div className={cn('rounded-lg p-2 sm:p-2.5 lg:p-3', bgColor)} aria-hidden="true">
                            <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6', color)}/>
                        </div>
                        {change && (
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-xs sm:text-sm font-medium whitespace-nowrap',
                                    isPositive ? 'text-green-500' : 'text-red-500'
                                )}
                                aria-label={`${isPositive ? 'Increased' : 'Decreased'} by ${change}`}
                            >
                                <TrendingUp
                                    className={cn('h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0', !isPositive && 'rotate-180')}
                                    aria-hidden="true"
                                />
                                <span>{change}</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
                        <CardTitle className="mb-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground break-words">
                            {value}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
                            {title}
                        </CardDescription>
                        {showProgress && (
                            <div className="mt-3 sm:mt-4">
                                <Progress
                                    value={calculatedProgress}
                                    className="h-1.5 sm:h-2 rounded-full"
                                    aria-label={`Progress: ${calculatedProgress}%`}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        )
    }
)

DashboardCard.displayName = 'DashboardCard'