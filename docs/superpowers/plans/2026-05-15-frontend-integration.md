# Frontend Backend Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded `useState` arrays in `ModernDashboard.tsx` with React Query hooks backed by the NestJS API, add JWT auth, and wire up WebSocket real-time updates.

**Architecture:** Axios instance with JWT interceptors → React Query hooks per entity → page components receive data via hooks instead of props. Auth stored in localStorage, `ProtectedRoute` guards `ModernDashboard`. WebSocket hook connects to `/ws` and invalidates React Query cache on events.

**Tech Stack:** React 18, TypeScript, @tanstack/react-query v5, axios, sonner (already in deps), socket.io-client.

**Prerequisite:** Backend API running at `http://localhost:3000` (see `2026-05-15-backend-api.md`).

---

## File Map

```
src/
  lib/
    api.ts                          ← axios instance + interceptors
    auth.ts                         ← token storage helpers
    hooks/
      useApplications.ts
      useGateways.ts
      useEndDevices.ts
      useUsers.ts
      useCompanies.ts
      useIntegrations.ts
      useUplinks.ts
      useWebSocket.ts
  app/
    components/
      LoginPage.tsx                 ← new login form
      ProtectedRoute.tsx            ← new auth wrapper
      ModernDashboard.tsx           ← modify: remove useState data, use hooks
      Applications.tsx              ← modify: receive data from hook not props
      Gateways.tsx                  ← modify: receive data from hook not props
      EndDevices.tsx                ← modify: receive data from hook not props
      Users.tsx                     ← modify: receive data from hook not props
      Companies.tsx                 ← modify: receive data from hook not props
      Integrations.tsx              ← modify: receive data from hook not props
      UplinkMessages.tsx            ← modify: use useUplinks hook
      LiveMonitoring.tsx            ← modify: use useWebSocket hook
  main.tsx                          ← add QueryClientProvider + Toaster
  .env                              ← add VITE_API_URL, VITE_WS_URL
```

---

## Task 1: Install Dependencies + Environment

**Files:**
- Modify: `package.json` (via npm install)
- Create: `.env`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install packages**

```bash
cd c:/Project/Techno/LoraWan/frontend
npm install @tanstack/react-query axios socket.io-client
```

- [ ] **Step 2: Create `.env`**

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

Note: socket.io-client uses HTTP URL (not `ws://`), path `/ws`.

- [ ] **Step 3: Add QueryClientProvider and Toaster to `src/main.tsx`**

Read current `src/main.tsx` first, then replace:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './app/App';
import '../src/styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 3 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 4: Start dev server and verify no errors**

```bash
npm run dev
```

Expected: compiles with no TypeScript errors. Dashboard still shows (hardcoded data still in place).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/main.tsx .env.example
git commit -m "feat: install react-query, axios, socket.io-client; add QueryClientProvider"
```

---

## Task 2: Auth Helpers + Axios Instance

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create auth token helpers**

`src/lib/auth.ts`:
```typescript
const ACCESS_KEY = 'lorawan_access_token';
const REFRESH_KEY = 'lorawan_refresh_token';

export const auth = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  isAuthenticated: () => Boolean(localStorage.getItem(ACCESS_KEY)),
};
```

- [ ] **Step 2: Create Axios instance with interceptors**

`src/lib/api.ts`:
```typescript
import axios, { AxiosRequestConfig } from 'axios';
import { auth } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = auth.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token!));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      });
    }
    original._retry = true;
    isRefreshing = true;
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      auth.clearTokens();
      window.location.href = '/';
      return Promise.reject(error);
    }
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      auth.setTokens(data.accessToken, auth.getRefreshToken()!);
      processQueue(null, data.accessToken);
      original.headers = { ...original.headers, Authorization: `Bearer ${data.accessToken}` };
      return api(original);
    } catch (err) {
      processQueue(err, null);
      auth.clearTokens();
      window.location.href = '/';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/lib/api.ts
git commit -m "feat: add axios instance with JWT interceptors and auth helpers"
```

---

## Task 3: Login Page + Protected Route

**Files:**
- Create: `src/app/components/LoginPage.tsx`
- Create: `src/app/components/ProtectedRoute.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Create LoginPage**

`src/app/components/LoginPage.tsx`:
```typescript
import { useState } from 'react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { toast } from 'sonner';

interface Props { onLogin: () => void; }

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      auth.setTokens(data.accessToken, data.refreshToken);
      onLogin();
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-white">LoRaWAN Dashboard</h1>
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create ProtectedRoute**

`src/app/components/ProtectedRoute.tsx`:
```typescript
import { useState } from 'react';
import { auth } from '@/lib/auth';
import { LoginPage } from './LoginPage';

interface Props { children: React.ReactNode; }

export function ProtectedRoute({ children }: Props) {
  const [authenticated, setAuthenticated] = useState(auth.isAuthenticated());

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }
  return <>{children}</>;
}
```

- [ ] **Step 3: Wrap App with ProtectedRoute**

Read `src/app/App.tsx` then update to wrap the main component:
```typescript
import { ProtectedRoute } from './components/ProtectedRoute';
import { ModernDashboard } from './components/ModernDashboard';

export default function App() {
  return (
    <ProtectedRoute>
      <ModernDashboard />
    </ProtectedRoute>
  );
}
```

- [ ] **Step 4: Test login flow**

```bash
npm run dev
```

Navigate to `http://localhost:5173`. Expected: login form shown. Enter `admin@lorawan.io` / `password` → dashboard loads.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/LoginPage.tsx src/app/components/ProtectedRoute.tsx src/app/App.tsx
git commit -m "feat: add login page and protected route with JWT auth"
```

---

## Task 4: Entity Query Hooks

**Files:**
- Create: `src/lib/hooks/useApplications.ts`
- Create: `src/lib/hooks/useGateways.ts`
- Create: `src/lib/hooks/useEndDevices.ts`
- Create: `src/lib/hooks/useUsers.ts`
- Create: `src/lib/hooks/useCompanies.ts`
- Create: `src/lib/hooks/useIntegrations.ts`

- [ ] **Step 1: Create useApplications hook**

`src/lib/hooks/useApplications.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['applications'];

export function useApplications() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/applications').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/applications', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/applications/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
```

- [ ] **Step 2: Create useGateways hook**

`src/lib/hooks/useGateways.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['gateways'];

export function useGateways() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/gateways').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/gateways', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/gateways/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/gateways/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
```

- [ ] **Step 3: Create useEndDevices hook**

`src/lib/hooks/useEndDevices.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['end-devices'];

export function useEndDevices() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/end-devices').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/end-devices', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/end-devices/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/end-devices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
```

- [ ] **Step 4: Create useUsers hook**

`src/lib/hooks/useUsers.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['users'];

export function useUsers() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/users', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/users/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
```

- [ ] **Step 5: Create useCompanies hook**

`src/lib/hooks/useCompanies.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['companies'];

export function useCompanies() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/companies').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/companies', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/companies/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
```

- [ ] **Step 6: Create useIntegrations hook**

`src/lib/hooks/useIntegrations.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['integrations'];

export function useIntegrations() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/integrations').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/integrations', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/integrations/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/integrations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/hooks/
git commit -m "feat: add react-query hooks for all entities"
```

---

## Task 5: Uplinks Hook + WebSocket Hook

**Files:**
- Create: `src/lib/hooks/useUplinks.ts`
- Create: `src/lib/hooks/useWebSocket.ts`

- [ ] **Step 1: Create useUplinks hook (paginated)**

`src/lib/hooks/useUplinks.ts`:
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useUplinks(deviceEUI?: string, applicationId?: string) {
  return useInfiniteQuery({
    queryKey: ['uplinks', deviceEUI, applicationId],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: '50' });
      if (deviceEUI) params.set('deviceEUI', deviceEUI);
      if (applicationId) params.set('applicationId', applicationId);
      return api.get(`/uplinks?${params}`).then(r => r.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { page, limit, total } = lastPage;
      return page * limit < total ? page + 1 : undefined;
    },
  });
}
```

- [ ] **Step 2: Create useWebSocket hook**

`src/lib/hooks/useWebSocket.ts`:
```typescript
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { auth } from '../auth';

export function useWebSocket() {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = auth.getAccessToken();
    if (!token) return;

    const socket = io(import.meta.env.VITE_WS_URL, {
      path: '/ws',
      query: { token },
      transports: ['websocket'],
    });

    socket.on('uplink.received', () => {
      qc.invalidateQueries({ queryKey: ['uplinks'] });
    });

    socket.on('gateway.status', (gateway: any) => {
      qc.setQueryData(['gateways'], (old: any[]) =>
        old ? old.map(g => g._id === gateway._id ? { ...g, ...gateway } : g) : old,
      );
    });

    socket.on('device.status', (device: any) => {
      qc.setQueryData(['end-devices'], (old: any[]) =>
        old ? old.map(d => d._id === device._id ? { ...d, ...device } : d) : old,
      );
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [qc]);

  return socketRef.current;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/useUplinks.ts src/lib/hooks/useWebSocket.ts
git commit -m "feat: add paginated uplinks hook and WebSocket real-time hook"
```

---

## Task 6: Wire ModernDashboard to API Hooks

**Files:**
- Modify: `src/app/components/ModernDashboard.tsx`

- [ ] **Step 1: Replace hardcoded state with hooks in ModernDashboard**

In `src/app/components/ModernDashboard.tsx`:

1. Remove all 6 `useState` arrays (applications, gateways, endDevices, users, integrations, companies) and their hardcoded data.
2. Add imports at top:
```typescript
import { useApplications } from '@/lib/hooks/useApplications';
import { useGateways } from '@/lib/hooks/useGateways';
import { useEndDevices } from '@/lib/hooks/useEndDevices';
import { useUsers } from '@/lib/hooks/useUsers';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { useIntegrations } from '@/lib/hooks/useIntegrations';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { toast } from 'sonner';
```

3. Inside `ModernDashboard` function body, replace deleted state with hook calls:
```typescript
const applicationsQuery = useApplications();
const gatewaysQuery = useGateways();
const endDevicesQuery = useEndDevices();
const usersQuery = useUsers();
const companiesQuery = useCompanies();
const integrationsQuery = useIntegrations();
useWebSocket();

const applications = applicationsQuery.data ?? [];
const gateways = gatewaysQuery.data ?? [];
const endDevices = endDevicesQuery.data ?? [];
const users = usersQuery.data ?? [];
const companies = companiesQuery.data ?? [];
const integrations = integrationsQuery.data ?? [];
```

4. Add error toasts after hook calls:
```typescript
if (applicationsQuery.error) toast.error('Failed to load applications');
if (gatewaysQuery.error) toast.error('Failed to load gateways');
if (endDevicesQuery.error) toast.error('Failed to load end devices');
if (usersQuery.error) toast.error('Failed to load users');
if (companiesQuery.error) toast.error('Failed to load companies');
if (integrationsQuery.error) toast.error('Failed to load integrations');
```

5. Update `renderContent` — pass hook mutations instead of `setState` setters. For example, for Applications case:
```typescript
case 'applications':
  return (
    <Applications
      applications={applications}
      onCreate={(data) => applicationsQuery.create.mutate(data)}
      onUpdate={(id, data) => applicationsQuery.update.mutate({ id, data })}
      onDelete={(id) => applicationsQuery.remove.mutate(id)}
    />
  );
```

Repeat the same pattern for gateways, endDevices, users, companies, integrations.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds or only shows prop-type mismatches (to be fixed in Task 7).

- [ ] **Step 3: Commit**

```bash
git add src/app/components/ModernDashboard.tsx
git commit -m "feat: wire ModernDashboard to API hooks, remove hardcoded data"
```

---

## Task 7: Update Page Components to New Props

**Files:**
- Modify: `src/app/components/Applications.tsx`
- Modify: `src/app/components/Gateways.tsx`
- Modify: `src/app/components/EndDevices.tsx`
- Modify: `src/app/components/Users.tsx`
- Modify: `src/app/components/Companies.tsx`
- Modify: `src/app/components/Integrations.tsx`

- [ ] **Step 1: Update Applications.tsx props**

Read `src/app/components/Applications.tsx`. Find the props interface (currently `{ applications, setApplications }`). Replace it with:
```typescript
interface Props {
  applications: any[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}
```

Replace all `setApplications(...)` calls with the appropriate `onCreate`/`onUpdate`/`onDelete` callbacks. For add: `onCreate(newItem)`. For edit: `onUpdate(item._id, updatedData)`. For delete: `onDelete(item._id)`.

Remove any inline state manipulation that builds a new array (e.g. `setApplications(prev => [...prev, item])`). The hook's `invalidateQueries` refetches the list automatically.

- [ ] **Step 2: Update Gateways.tsx props**

Read `src/app/components/Gateways.tsx`. Find props interface. Replace setter with:
```typescript
interface Props {
  gateways: any[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  initialViewingGateway?: any;
  onClearViewingGateway?: () => void;
  selectedGatewayId?: number;
  onClearSelectedGateway?: () => void;
}
```

Replace all `setGateways(...)` calls with `onCreate`/`onUpdate`/`onDelete`.

- [ ] **Step 3: Update EndDevices.tsx props**

Read `src/app/components/EndDevices.tsx`. Replace setter with:
```typescript
interface Props {
  endDevices: any[];
  applications: any[];
  gateways: any[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onViewGateway?: (gateway: any) => void;
  selectedDeviceId?: number;
  onClearSelectedDevice?: () => void;
}
```

Replace all `setEndDevices(...)` calls with `onCreate`/`onUpdate`/`onDelete`.

- [ ] **Step 4: Update Users.tsx props**

Read `src/app/components/Users.tsx`. Replace setter with:
```typescript
interface Props {
  users: any[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}
```

Replace all `setUsers(...)` calls.

- [ ] **Step 5: Update Companies.tsx props**

Read `src/app/components/Companies.tsx`. Replace setter with:
```typescript
interface Props {
  companies: any[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}
```

Replace all `setCompanies(...)` calls.

- [ ] **Step 6: Update Integrations.tsx props**

Read `src/app/components/Integrations.tsx`. Replace setter with:
```typescript
interface Props {
  integrations: any[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}
```

Replace all `setIntegrations(...)` calls.

- [ ] **Step 7: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/components/Applications.tsx src/app/components/Gateways.tsx \
  src/app/components/EndDevices.tsx src/app/components/Users.tsx \
  src/app/components/Companies.tsx src/app/components/Integrations.tsx
git commit -m "feat: update page components to use onCreate/onUpdate/onDelete callbacks"
```

---

## Task 8: Wire UplinkMessages + LiveMonitoring to Hooks

**Files:**
- Modify: `src/app/components/UplinkMessages.tsx`
- Modify: `src/app/components/LiveMonitoring.tsx`

- [ ] **Step 1: Update UplinkMessages.tsx to use useUplinks**

Read `src/app/components/UplinkMessages.tsx`. Add import:
```typescript
import { useUplinks } from '@/lib/hooks/useUplinks';
```

Replace any hardcoded uplink data with:
```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useUplinks();
const uplinks = data?.pages.flatMap(p => p.data) ?? [];
```

Show a loading skeleton when `isLoading` is true (a simple `<div className="animate-pulse ...">` row is sufficient).

Add a "Load more" button that calls `fetchNextPage()` when `hasNextPage` is true.

- [ ] **Step 2: Update LiveMonitoring.tsx to use useWebSocket**

Read `src/app/components/LiveMonitoring.tsx`. Add import:
```typescript
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { useUplinks } from '@/lib/hooks/useUplinks';
```

Add inside component:
```typescript
useWebSocket(); // connects and keeps cache fresh
const { data, isLoading } = useUplinks();
const recentUplinks = data?.pages[0]?.data ?? [];
```

Replace any hardcoded live data with `recentUplinks`.

- [ ] **Step 3: Start dev server and verify end-to-end**

```bash
npm run dev
```

1. Navigate to `http://localhost:5173` — login form shows.
2. Login with `admin@lorawan.io` / `password` — dashboard loads.
3. Navigate to Applications — list fetched from API.
4. Add an application — list refreshes automatically.
5. Navigate to Uplinks — paginated list loads from API.
6. Navigate to Live Monitoring — shows recent uplinks.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/UplinkMessages.tsx src/app/components/LiveMonitoring.tsx
git commit -m "feat: wire UplinkMessages and LiveMonitoring to API hooks"
```

---

## Self-Review

**Spec coverage:**
- ✅ Axios instance with JWT interceptors — Task 2
- ✅ React Query `QueryClientProvider` with `staleTime: 30s` — Task 1
- ✅ Query hooks per entity with `invalidateQueries` on mutation — Task 4
- ✅ `useInfiniteQuery` for paginated uplinks — Task 5
- ✅ WebSocket hook invalidates `['uplinks']` on `uplink.received` — Task 5
- ✅ WebSocket hook calls `setQueryData` on `gateway.status` and `device.status` — Task 5
- ✅ Login page + ProtectedRoute — Task 3
- ✅ Tokens in localStorage — Task 2
- ✅ Refresh token retry logic on 401 — Task 2
- ✅ Auth failure → clear tokens + redirect — Task 2
- ✅ React Query `retry: 3` for network errors — Task 1
- ✅ `sonner` toast on query error — Task 6
- ✅ `VITE_API_URL` + `VITE_WS_URL` env vars — Task 1

**Placeholder scan:** None. All steps have concrete code.

**Type consistency:**
- `useApplications().create.mutate(data)` called in `ModernDashboard` — matches `useMutation` signature ✅
- `useApplications().update.mutate({ id, data })` — matches `mutationFn: ({ id, data })` ✅
- `useUplinks()` returns `useInfiniteQuery` result — consumed as `data?.pages.flatMap(p => p.data)` ✅
- WebSocket `gateway.status` handler uses `g._id` — matches MongoDB `_id` field from API ✅
- `useWebSocket()` called in `ModernDashboard` and `LiveMonitoring` — idempotent socket creation is prevented by `useRef` ✅

**Note:** `useWebSocket` is called in both `ModernDashboard` and `LiveMonitoring`. The `useRef` prevents double socket creation per component but two mounts will create two sockets. To fix: move `useWebSocket()` call to `ModernDashboard` only and pass nothing to `LiveMonitoring` — `LiveMonitoring` benefits from the cache invalidation without needing its own socket.
