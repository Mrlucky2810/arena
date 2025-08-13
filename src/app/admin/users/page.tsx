
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManageUsersPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">User management interface will be implemented here. You'll be able to see all users, their balances, and their transaction histories.</p>
            </CardContent>
        </Card>
    )
}
