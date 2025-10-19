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
interface DeliveryLog {
    id: string;
    status: 'success' | 'failed' | 'retrying';
    response_status_code: number;
    attempted_at: string;
    endpoint_url: string;
    event_type: string;
}

interface DeliveryLogsListProps {
    logs: DeliveryLog[];
}

// Helper to format the date
const formatDate = (dateString: string) => new Date(dateString).toLocaleString();


export function DeliveryLogsList({ logs }: DeliveryLogsListProps) {
    // Helper to determine the badge color based on the delivery status
    const getStatusVariant = (status: DeliveryLog['status']) => {
        switch (status) {
            case 'success':
                return 'default'; // Green
            case 'failed':
                return 'destructive'; // Red
            default:
                return 'secondary'; // Gray
        }
    };

    return (
        <div className="border rounded-lg mt-8">
            <h2 className="text-xl font-bold p-4">Recent Delivery Logs</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Endpoint URL</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Attempted At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs && logs.length > 0 ? (
                        logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    <Badge variant={getStatusVariant(log.status)}>
                                        {log.status} ({log.response_status_code})
                                    </Badge>
                                </TableCell>
                                <TableCell>{log.endpoint_url}</TableCell>
                                <TableCell className="font-medium">{log.event_type}</TableCell>
                                <TableCell>{formatDate(log.attempted_at)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                No delivery logs found. Send an event to see logs appear.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}