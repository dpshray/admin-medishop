import {User} from "@/components/card/dashboard/users-table";

export const users: User[] = [
    {
        id: 1,
        name: 'Alex Johnson',
        email: 'alex@example.com',
        avatar: 'https://i.pravatar.cc/40?img=1',
        role: 'Admin',
        status: 'active',
        joinDate: '2024-01-15',
        location: 'New York, US'
    },
    {
        id: 2,
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: 'https://i.pravatar.cc/40?img=2',
        role: 'User',
        status: 'active',
        joinDate: '2024-02-20',
        location: 'San Francisco, US'
    },
    {
        id: 3,
        name: 'Michael Brown',
        email: 'michael@example.com',
        avatar: 'https://i.pravatar.cc/40?img=3',
        role: 'Moderator',
        status: 'inactive',
        joinDate: '2024-01-08',
        location: 'London, UK'
    },
]