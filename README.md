# AlgoHire Webhook Event Relay System

This project is a full-stack, scalable, and reliable webhook relay system built for the AlgoHire recruitment platform. It acts as a centralized gateway to receive events from internal services, process them asynchronously, and deliver them securely to subscribed external client systems (e.g., HRMS, CRM).

The system features a real-time management dashboard for configuring webhooks, monitoring delivery status, and ensuring operational observability.

## Key Features

-   **Asynchronous Event Processing**: Uses a Redis-based queue (BullMQ) to process events without blocking the main API, ensuring high throughput.
-   **Guaranteed Delivery with Retries**: Automatically retries failed webhook deliveries with an exponential backoff strategy to handle temporary client-side failures.
-   **Secure by Design**:
    -   **HMAC Signatures**: Every outgoing webhook is signed with a unique secret key, allowing clients to verify its authenticity.
    -   **API Key Authentication**: The management dashboard APIs are protected to prevent unauthorized access.
-   **Real-Time Monitoring Dashboard**: A React/Next.js frontend provides a live view of all subscriptions and delivery logs, with data polling every 5 seconds.
-   **Performance Optimized**: A Redis caching layer for subscriber lookups significantly reduces database load under high traffic.
-   **Containerized Environment**: The entire application stack is managed with Docker Compose, allowing for consistent setup and easy deployment.

## Architecture Overview

The system is built on a modern, microservices-friendly architecture, separating concerns for scalability and maintainability.

-   **Frontend (Next.js)**: A client-side rendered dashboard for administrators to manage the system.
-   **Backend API (Node.js/Express)**: Receives events from internal services, manages subscriptions, and serves data to the dashboard.
-   **Background Worker (Node.js)**: A separate process that listens to the Redis queue and is solely responsible for dispatching webhooks.
-   **PostgreSQL**: The primary database for storing events, subscriptions, and delivery logs.
-   **Redis**: Serves as both a message broker (for the BullMQ job queue) and a caching layer.
-   **Migrator**: A short-lived container that automatically runs database migrations on startup to ensure the schema is up-to-date.

## Technology Stack

-   **Backend**: Node.js, Express.js, BullMQ
-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS, ShadCN UI
-   **Database**: PostgreSQL
-   **Cache/Queue**: Redis
-   **Containerization**: Docker & Docker Compose
-   **Libraries**: `axios`, `pg`, `ioredis`, `cors`

## Setup and Installation

### Prerequisites

-   Docker
-   Docker Compose

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd algohire-webhook-relay
    ```

2.  **Build and run the services:**
    This single command will build all the images, run database migrations, and start the frontend, backend API, and worker services.
    ```bash
    docker-compose up --build
    ```

3.  **Access the application:**
    -   **Frontend Dashboard**: `http://localhost:3000`
    -   **Backend API**: `http://localhost:8000`

## Data Flow

The lifecycle of an event is designed for reliability and observability:

1.  **Receipt**: An internal service sends an event to `POST /api/events`.
2.  **Storage**: The event is validated and stored in the `events` table with a unique ID.
3.  **Queuing**: A job is added to the Redis queue via BullMQ, configured with 3 retry attempts.
4.  **Processing**: The background worker picks up the job.
5.  **Dispatch**: The worker fetches subscribers (from cache or DB), generates an HMAC signature, and sends the webhook via an HTTP `POST` request.
6.  **Logging**: The outcome (success or failure) of the delivery attempt is saved to the `delivery_logs` table.

## Security Features

### Outgoing Webhooks (HMAC)

Each webhook request includes an `X-AlgoHire-Signature` header. The client can use their unique secret key to generate their own signature from the request body and compare it to the one in the header to verify the sender's identity.

### Dashboard API (API Key)

All endpoints related to managing subscriptions and viewing logs (`/api/subscriptions`, `/api/logs`) require a secret `X-API-Key` to be sent in the header, preventing public access.

## Future Improvements

-   **User Authentication**: Implement a full login system for the dashboard instead of a single global API key.
-   **Advanced Filtering**: Add more advanced filtering and search capabilities to the delivery logs page.
-   **Manual Retry from UI**: Add a "Retry" button on failed logs in the dashboard to manually re-queue a job.
-   **Webhook Deactivation**: Automatically deactivate a webhook subscription after a certain number of consecutive failures to prevent system overload.
