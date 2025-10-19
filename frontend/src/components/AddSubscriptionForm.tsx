import { useState } from "react";
import apiClient from "@/api/client"; // FIX: Use the configured apiClient
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// FIX: Add TypeScript type for the component's props
interface AddSubscriptionFormProps {
    onSubscriptionAdded: () => void;
}

export function AddSubscriptionForm({ onSubscriptionAdded }: AddSubscriptionFormProps) {
    const [eventType, setEventType] = useState("candidate.created");
    const [endpointUrl, setEndpointUrl] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            // FIX: Use the apiClient for the request
            await apiClient.post("/subscriptions", {
                eventType,
                endpointUrl,
            });
            setEndpointUrl(""); // Clear input on success
            onSubscriptionAdded(); // Trigger a data refresh
        } catch (err: any) {
            setError(err.response?.data?.error || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Add New Webhook Subscription</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Select onValueChange={setEventType} defaultValue="candidate.created">
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select an event type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="candidate.created">candidate.created</SelectItem>
                                <SelectItem value="candidate.updated">candidate.updated</SelectItem>
                                <SelectItem value="job.created">job.created</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="url"
                            placeholder="https://client.com/webhook-url"
                            value={endpointUrl}
                            onChange={(e) => setEndpointUrl(e.target.value)}
                            required
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Subscription"}
                        </Button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </CardContent>
        </Card>
    );
}