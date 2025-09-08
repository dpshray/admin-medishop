'use client'

import {memo, useMemo} from 'react'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Plus, TrendingUp} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {users} from "@/data";

export interface User {
    id: number
    name: string
    email: string
    avatar: string
    role: 'Admin' | 'User' | 'Moderator'
    status: 'active' | 'inactive'
    joinDate: string
    location: string
}

interface UsersTableProps {
    onAddUser: () => void
}


export const UsersTable = memo(({onAddUser}: UsersTableProps) => {
    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                header: 'User',
                accessorFn: row => row.name,
                cell: info => {
                    const user = info.row.original
                    return (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar>
                                    <AvatarImage src={user.avatar} alt={user.name}/>
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span
                                    className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background ${
                                        user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Role',
                accessorFn: row => row.role,
                cell: info => {
                    const role = info.getValue() as string
                    return (
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                role === 'Admin'
                                    ? 'bg-purple-500/10 text-purple-500'
                                    : role === 'Moderator'
                                        ? 'bg-blue-500/10 text-blue-500'
                                        : 'bg-gray-500/10 text-gray-500'
                            }`}
                        >
              {role}
            </span>
                    )
                },
            },
            {
                header: 'Location',
                accessorFn: row => row.location,
                cell: info => <span className="text-xs">{info.getValue() as string}</span>,
            },
            {
                header: 'Joined',
                accessorFn: row => row.joinDate,
                cell: info => <span
                    className="text-xs text-muted-foreground">{new Date(info.getValue() as string).toLocaleDateString()}</span>,
            },
            {
                header: 'Actions',
                id: 'actions',
                cell: info => (
                    <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4"/>
                    </Button>
                ),
            },
        ],
        []
    )

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Card className="rounded-xl border bg-card/40">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold">Recent Users</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Latest user registrations and activity
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-green-500">
                        <TrendingUp className="h-4 w-4"/>
                        <span>+12%</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={onAddUser}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Add User
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[600px] table-auto border-separate border-spacing-y-2">
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="text-left text-xs font-medium text-muted-foreground px-3 py-2"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="bg-card rounded-lg hover:bg-accent/50 transition-colors">
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-3 py-2">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
})

UsersTable.displayName = 'UsersTable'
export default UsersTable
