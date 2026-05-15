# Backend Architecture Design
**Date:** 2026-05-15  
**Scope:** Backend API architecture + frontend integration strategy for LoRaWAN dashboard

---

## 1. Overview

Greenfield backend for the existing React/Vite/TypeScript LoRaWAN dashboard. All data is currently hardcoded `useState` arrays in `ModernDashboard.tsx`. This spec covers the backend stack, API design, data models, and frontend integration plan.

**Deployment:** Self-hosted / on-premise via Docker Compose.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Docker Compose                       │
│                                                     │
│  ┌──────────────┐   ┌─────────────┐   ┌─────────┐  │
│  │  React SPA   │   │  NestJS API │   │ MongoDB │  │
│  │  (Vite dev   │──▶│  :3000      │──▶│ :27017  │  │
│  │   or nginx)  │   │             │   │         │  │
│  └──────────────┘   └──────┬──────┘   └─────────┘  │
│                            │                        │
│                     ┌──────▼──────┐                 │
│                     │ MQTT Client │                 │
│                     │ (ChirpStack)│                 │
│                     └─────────────┘                 │
└─────────────────────────────────────────────────────┘
```

### Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | NestJS (Node.js 20, TypeScript) | Structured, decorator-based, built-in DI, scales to this project's entity count |
| Database | MongoDB via Mongoose | Flexible schema for device payloads; matches existing data shape |
| Auth | JWT — accessToken (15min) + refreshToken (7d) | Stateless, API-friendly |
| Real-time | NestJS WebSocket Gateway + MQTT client | ChirpStack → MQTT → WebSocket → frontend |
| Containerization | Docker Compose | `api` + `mongo` services |

### Repository Layout

```
backend/
  src/
    auth/
    applications/
    gateways/
    end-devices/
    users/
    companies/
    integrations/
    uplinks/
    mqtt/          ← ChirpStack bridge
    websocket/     ← real-time gateway
  docker-compose.yml
  .env
```

---

## 3. API Endpoints

All routes except `/auth/login` require `Authorization: Bearer <accessToken>`.  
Role guard enforced per route: **Admin > Operator > Viewer**.

### Auth
```
POST /auth/login          → { accessToken, refreshToken }
POST /auth/refresh        → { accessToken }
POST /auth/logout
```

### Applications
```
GET    /applications
POST   /applications
GET    /applications/:id
PUT    /applications/:id
DELETE /applications/:id
```

### Gateways
```
GET    /gateways
POST   /gateways
GET    /gateways/:id
PUT    /gateways/:id
DELETE /gateways/:id
```

### End Devices
```
GET    /end-devices
POST   /end-devices
GET    /end-devices/:id
PUT    /end-devices/:id
DELETE /end-devices/:id
```

### Users
```
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

### Companies
```
GET    /companies
POST   /companies
GET    /companies/:id
PUT    /companies/:id
DELETE /companies/:id
```

### Integrations
```
GET    /integrations
POST   /integrations
PUT    /integrations/:id
DELETE /integrations/:id
```

### Uplinks (read-only — written by MQTT bridge)
```
GET /uplinks                      → paginated, filterable by deviceEUI / applicationId
GET /uplinks/:deviceEUI/latest
```

### Real-time WebSocket
```
WS /ws?token=<accessToken>
```
Emits:
- `uplink.received` — new uplink message
- `gateway.status` — gateway online/offline/warning change
- `device.status` — device status change

---

## 4. Data Models

### User
```ts
{
  _id: ObjectId,
  name: string,
  email: string,          // unique
  passwordHash: string,
  role: 'admin' | 'operator' | 'viewer',
  status: 'active' | 'inactive',
  lastLogin: Date,
  createdAt: Date
}
```

### Company
```ts
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string,
  address: string,
  status: 'active' | 'inactive',
  sharedGateways: ObjectId[],   // refs to Gateway
  sharedDevices: ObjectId[],    // refs to EndDevice
  createdAt: Date
}
```

### Application
```ts
{
  _id: ObjectId,
  name: string,
  description: string,
  brand: string,
  companyId: ObjectId,
  status: 'active' | 'inactive',
  createdAt: Date
}
```

### Gateway
```ts
{
  _id: ObjectId,
  name: string,
  eui: string,            // unique
  location: string,
  companyId: ObjectId,
  status: 'online' | 'offline' | 'warning',
  uptime: string,
  lastSeen: Date,
  createdAt: Date
}
```

### EndDevice
```ts
{
  _id: ObjectId,
  name: string,
  devEUI: string,         // unique
  applicationId: ObjectId,
  companyId: ObjectId,
  status: 'active' | 'inactive',
  battery: number,
  rssi: number,
  lastSeen: Date,
  connectedGateways: Array<{ gatewayEUI: string, rssi: number }>,
  createdAt: Date
}
```

### Integration
```ts
{
  _id: ObjectId,
  name: string,
  type: 'Cloud' | 'Webhook' | 'Protocol' | 'API' | 'Database' | 'Visualization' | 'Notification' | 'Automation',
  status: 'active' | 'inactive',
  url: string,
  apiKey: string,         // stored encrypted
  events: number,
  lastSync: Date,
  createdAt: Date
}
```

### UplinkMessage
```ts
{
  _id: ObjectId,
  deviceEUI: string,
  applicationId: ObjectId,
  gatewayEUI: string,
  rssi: number,
  snr: number,
  frequency: number,
  fPort: number,
  fCnt: number,
  data: Buffer,           // raw payload
  decodedData: Object,    // decoded payload (if codec available)
  receivedAt: Date        // TTL index: 90 days
}
```

### MQTT Bridge
- Subscribes to ChirpStack topic: `application/+/device/+/event/up`
- Parses payload → inserts `UplinkMessage`
- Emits WebSocket event `uplink.received` to connected clients

---

## 5. Frontend Integration

### Packages to Add
```
@tanstack/react-query
axios
```

### HTTP Client — `src/lib/api.ts`
- Axios instance with `baseURL` from `VITE_API_URL`
- Request interceptor: attach `accessToken` from localStorage
- Response interceptor: on 401 → attempt token refresh → retry original request; on refresh failure → clear tokens → redirect to login

### React Query Setup
- `QueryClient` instantiated in `main.tsx`
- `QueryClientProvider` wraps entire app
- Default `staleTime: 30000` (30s)

### Query Hooks — `src/lib/hooks/`
```
useApplications.ts   → useQuery(['applications']) + useMutation for create/update/delete
useGateways.ts
useEndDevices.ts
useUsers.ts
useCompanies.ts
useIntegrations.ts
useUplinks.ts        → useInfiniteQuery (paginated)
```
Each mutation calls `queryClient.invalidateQueries` on success.

### Real-time — `src/lib/hooks/useWebSocket.ts`
- Connects to `VITE_WS_URL?token=<accessToken>`
- `uplink.received` → `queryClient.invalidateQueries(['uplinks'])` or optimistic append
- `gateway.status` → `queryClient.setQueryData(['gateways'], ...)` for instant UI update
- Used by `LiveMonitoring` and `UplinkMessages` views

### Auth — `src/lib/auth.ts` + `LoginPage.tsx`
- Tokens stored in localStorage
- `ProtectedRoute` wrapper: unauthenticated → redirect to `/login`
- `ModernDashboard` only mounts after successful auth check

---

## 6. Error Handling

### Backend
- `400` — validation errors via `class-validator` DTOs
- `401` — invalid or expired JWT
- `403` — insufficient role
- `404` — resource not found
- `500` — unhandled error logged server-side; generic message returned to client (no stack trace leakage)

### Frontend
- React Query `onError` → `sonner` toast (already in deps)
- Network errors → React Query retries 3x with exponential backoff
- Auth failure → clear tokens, redirect to login

---

## 7. Environment Configuration

### Backend `.env`
```
PORT=3000
MONGODB_URI=mongodb://mongo:27017/lorawan
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<different-strong-secret>
MQTT_BROKER_URL=mqtt://chirpstack:1883
MQTT_USERNAME=
MQTT_PASSWORD=
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws
```

### Docker Compose Services
| Service | Image | Port |
|---------|-------|------|
| `api` | NestJS build | 3000 |
| `mongo` | mongo:7 | 27017 |
| `chirpstack` | chirpstack/chirpstack (optional, local dev) | 8080 |

---

## 8. Out of Scope (This Phase)

- Analytics aggregation queries
- Storage view data
- Multi-tenant access control beyond role guard
- Device codec/payload decoder configuration
- CI/CD pipeline
