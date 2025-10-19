'use client'; // This directive is essential for using hooks in Next.js App Router

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/api/client"; // We will create this client next
import { AddSubscriptionForm } from "@/components/AddSubscriptionForm";
import { SubscriptionList } from "@/components/SubscriptionList";
import { DeliveryLogsList } from "@/components/DeliveryLogsList";

// Define TypeScript types for our data for better code quality
interface Subscription {
  id: string;
  event_type: string;
  endpoint_url: string;
  is_active: boolean;
}

interface DeliveryLog {
  id: string;
  status: 'success' | 'failed' | 'retrying';
  response_status_code: number;
  attempted_at: string;
  endpoint_url: string;
  event_type: string;
}

export default function HomePage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);

  // useCallback prevents this function from being recreated on every render
  const fetchData = useCallback(async () => {
    try {
      // Fetch both subscriptions and logs in parallel for efficiency
      const [subsResponse, logsResponse] = await Promise.all([
        apiClient.get("/subscriptions"),
        apiClient.get("/logs"),
      ]);
      setSubscriptions(subsResponse.data);
      setLogs(logsResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  useEffect(() => {
    // Fetch data immediately when the component mounts
    fetchData();

    // Set up an interval to refresh the data every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Clean up the interval when the component is unmounted to prevent memory leaks
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <main className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AlgoHire Webhook Dashboard</h1>
        <p className="text-gray-500">Manage and monitor your webhook subscriptions and deliveries.</p>
      </header>

      {/* The form triggers fetchData when a new subscription is added */}
      <AddSubscriptionForm onSubscriptionAdded={fetchData} />

      {/* These components display the fetched data */}
      <SubscriptionList subscriptions={subscriptions} />
      <DeliveryLogsList logs={logs} />
    </main>
  );
}