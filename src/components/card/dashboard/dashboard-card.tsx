'use client'

import {memo} from 'react'
import {motion} from 'framer-motion'
import {LucideIcon, TrendingUp} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'

interface DashboardCardProps {
    title: string
    value: string
    change: string
    changeType: 'positive' | 'negative'
    icon: LucideIcon
    color: string
    bgColor: string
    index: number
    className?: string
}

export const DashboardCard = memo(
    ({
         title,
         value,
         change,
         changeType,
         icon: Icon,
         color,
         bgColor,
         index,
         className,
     }: DashboardCardProps) => {
        return (
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.1}}
                whileHover={{scale: 1.02, transition: {duration: 0.2}}}
                className={cn('w-full', className)}
            >
                <Card
                    className="relative overflow-hidden rounded-xl border bg-card/40 transition-all duration-300 hover:shadow-lg">
                    <div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 hover:opacity-100"/>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className={cn('rounded-lg p-3', bgColor)}>
                            <Icon className={cn('h-6 w-6', color)}/>
                        </div>
                        <div
                            className={cn(
                                'flex items-center gap-1 text-sm font-medium',
                                changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                            )}
                        >
                            <TrendingUp
                                className={cn(
                                    'h-4 w-4',
                                    changeType === 'negative' && 'rotate-180'
                                )}
                            />
                            <span>{change}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-1 text-3xl font-bold text-foreground">
                            {value}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">
                            {title}
                        </CardDescription>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                            <motion.div
                                initial={{width: 0}}
                                animate={{width: `${65 + index * 8}%`}}
                                transition={{duration: 1, delay: index * 0.1}}
                                className={cn('h-full rounded-full', color.replace('text-', 'bg-'))}
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }
)

DashboardCard.displayName = 'DashboardCard'
