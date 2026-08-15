# OrderFlow Frontend

React + TypeScript SPA for the OrderFlow event-driven backend.

## Stack

- React 19
- TypeScript
- Vite 8
- React Router
- TanStack Query
- Lucide React
- Server-Sent Events (SSE)
- Nginx + Docker

## Backend contract used

The UI integrates only through the API Gateway:

- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/{id}`
- `GET /api/orders/{id}/history`
- `GET /api/orders/{id}/events` (`text/event-stream`, named event: `order-status`)

## Development

Run the backend first on `http://localhost:8080`, then:

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

Vite proxies `/api/*` to `VITE_DEV_API_PROXY` (default `http://localhost:8080`).

## Frontend logging / diagnostics

Environment variables:

```env
VITE_LOG_LEVEL=info
VITE_DEBUG_API=false
VITE_DEBUG_UI=false
```

Available levels: `trace`, `debug`, `info`, `warn`, `error`, `silent`.

For troubleshooting backend integration:

```env
VITE_LOG_LEVEL=debug
VITE_DEBUG_API=true
VITE_DEBUG_UI=true
```

This enables:

- structured HTTP request/response logs;
- request duration and status;
- generated `X-Correlation-Id` on every HTTP request;
- response/body diagnostics when API debug is enabled;
- network and timeout errors;
- TanStack Query errors;
- SSE connect/reconnect/event parsing logs;
- global browser errors and unhandled promise rejections;
- an in-app debug drawer with the latest 200 log entries.

The correlation ID can be matched with the detailed logs produced by the Java services.

## Demo scenarios

### Approved

Create an order with total `<= 10000`.

Expected flow:

`CREATED -> PAYMENT_PROCESSING -> PAYMENT_APPROVED -> COMPLETED`

### Payment failure

Create an order with total `> 10000`.

Expected flow:

`CREATED -> PAYMENT_PROCESSING -> PAYMENT_FAILED`

### Retry + DLT

Use product name exactly `ERROR`.

The Payment Service intentionally throws and the backend demonstrates Kafka retry + DLT behavior.

## Docker

With the backend already exposing the API Gateway on host port `8080`:

```bash
docker compose up --build
```

Open `http://localhost:3000`.

The default Nginx upstream is `http://host.docker.internal:8080`. On Linux the Compose file adds the `host-gateway` mapping.

If frontend and backend are merged into the same Compose network, set:

```env
API_GATEWAY_UPSTREAM=http://api-gateway:8080
```

Nginx disables proxy buffering for `/api/`, which is required for timely SSE delivery.

## Production logging

Recommended defaults:

```env
VITE_LOG_LEVEL=info
VITE_DEBUG_API=false
VITE_DEBUG_UI=false
```

Do not enable API body logging in a real application with sensitive customer/auth/payment data.

## Frontend architecture

```text
Browser
  |
  v
React SPA
  |
  +-- React Router
  +-- TanStack Query cache
  +-- Order feature
  |     +-- API client
  |     +-- Dashboard / list / create / details
  |     +-- SSE hook
  |     +-- Timeline + event stream
  |
  +-- Structured frontend logger
        +-- HTTP duration/status/correlation ID
        +-- Query/mutation errors
        +-- SSE lifecycle
        +-- Browser/global errors
        +-- Optional diagnostics drawer
  |
  | HTTP + SSE
  v
API Gateway :8080
  |
  v
Order Service -> Kafka -> Payment Service / Notification Service
```

There are no frontend mocks: dashboard, list, details, history and live status are all populated from the current backend APIs.
