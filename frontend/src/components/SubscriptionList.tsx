import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// FIX: Add TypeScript types
interface Subscription {
    id: string;
    event_type: string;
    endpoint_url: string;
    is_active: boolean;
}

interface SubscriptionListProps {
    subscriptions: Subscription[];
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
    return (
        <div className="border rounded-lg mt-8">
            <h2 className="text-xl font-bold p-4">Current Subscriptions</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Endpoint URL</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions && subscriptions.length > 0 ? (
                        subscriptions.map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.event_type}</TableCell>
                                <TableCell>{sub.endpoint_url}</TableCell>
                                <TableCell>
                                    <Badge variant={sub.is_active ? "default" : "destructive"}>
                                        {sub.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">
                                No subscriptions found. Add one using the form above.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}