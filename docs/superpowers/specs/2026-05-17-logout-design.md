# Logout Feature Design

**Date:** 2026-05-17

## Overview

Add logout button to user profile dropdown in ModernTopBar. Clears tokens and returns user to LoginPage.

## Architecture

Auth state lives in `App.tsx`. `ProtectedRoute` becomes a thin conditional renderer. `onLogout` callback flows: `App` → `ModernDashboard` → `ModernTopBar`.

## Component Changes

### `App.tsx`
- Extract `authenticated` state + `handleLogout` here
- `handleLogout`: calls `auth.clearTokens()`, sets `authenticated = false`
- Render `<LoginPage onLogin={...}>` or `<ModernDashboard onLogout={handleLogout} />` directly
- `ProtectedRoute` becomes unused — remove it

### `ModernDashboard.tsx`
- Add `onLogout?: () => void` to props interface
- Pass `onLogout` down to `ModernTopBar`

### `ModernTopBar.tsx`
- Add `onLogout?: () => void` to `ModernTopBarProps`
- Import `LogOut` icon from lucide-react
- Add "Sign out" button inside user dropdown, below existing content, above/replacing "View Profile Settings" button
- On click: call `onLogout?.()`

## Data Flow

```
auth.clearTokens()
    ↑
handleLogout() in App.tsx
    ↑ passed as prop
ModernDashboard.tsx
    ↑ passed as prop
ModernTopBar.tsx → user clicks "Sign out"
```

## Files Changed

| File | Change |
|------|--------|
| `src/app/App.tsx` | Own auth state, wire logout |
| `src/app/components/ModernDashboard.tsx` | Accept + forward `onLogout` prop |
| `src/app/components/ModernTopBar.tsx` | Add Sign out button |
| `src/app/components/ProtectedRoute.tsx` | Delete (replaced by App.tsx logic) |
