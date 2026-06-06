# Project Management System - Frontend Web Client

A modern, high-fidelity React Single Page Application (SPA) for project management and task board collaboration. Designed with a sleek, premium dark-mode-first styling palette, rich animations, responsive layouts, and real-time form indicators.

---

## Table of Contents

- [Key Features](#key-features)
- [Design Aesthetics](#design-aesthetics)
- [Project Architecture](#project-architecture)
- [Technology Stack](#technology-stack)
- [State Management & Flow](#state-management--flow)
- [Environment Setup](#environment-setup)
- [Installation & Running](#installation--running)
- [Production Build](#production-build)

---

## Key Features

- **Interactive Kanban Board**: Dynamic drag-and-drop / single-click state transition controls for moving tasks across columns (To Do, In Progress, Completed).
- **Responsive Dashboard Telemetry**: Elegant KPI widgets, task counts, priority distributions, and member workloads.
- **Strict UI Access Controls**: Dynamically hides project action cues (e.g. edit task, delete task, create projects) for `member` roles.
- **Form State Indicators**: Submitting states (`isSubmitting`) wired to button loaders and disables modal cancel actions, preventing duplicate payloads.
- **Rich User Account Settings**: Profile settings page with custom avatar cues, permission lists, and dark/light theme switching.

---

## Design Aesthetics

- **Dark-Mode-First Theme**: Smooth HSL color palette tailored with glassmorphism panels, soft gradients, and high contrast typography.
- **Micro-Animations**: Clean UI transitions (fade-ins, hover elevations, spin indicators) built on vanilla CSS.
- **Typography**: Uses modern sans-serif typefaces (e.g. Outfit / Inter) instead of default browser fallbacks.

---

## Project Architecture

```
src/
├── api/                   # Axios client instance with request interceptors for JWT
├── assets/                # Global static files & logo assets
├── components/            # Reusable UI Blocks
│   ├── Badge.tsx          # Dynamic status and priority badges
│   ├── Button.tsx         # Customizable button with custom loading spinner
│   ├── Input.tsx          # Form validation field with errors
│   ├── Layout.tsx         # App wrapper, sidebar, header, and user nav menus
│   ├── Modal.tsx          # Accessible modal overlays
│   └── ThemeToggle.tsx    # Light/Dark mode switcher
├── pages/                 # Full Page Views
│   ├── ActivityLogs.tsx   # Workspace activity logs history page
│   ├── Dashboard.tsx      # Aggregate telemetry charts and workload overview
│   ├── Login.tsx          # Credentials submission page
│   ├── Register.tsx       # Account signup page
│   ├── Projects.tsx       # Projects listing, filters, and project creator
│   ├── ProjectDetails.tsx # Kanban work board and members modal
│   └── Profile.tsx        # Personal profile configurations & PM accounts creator
├── store/                 # Redux global state store (Auth & Theme slices)
├── App.tsx                # Main router setup
└── main.tsx               # Client entrypoint
```

---

## Technology Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & PostCSS
- **State Management**: Redux Toolkit & Redux Persist
- **Form Handling**: React Hook Form
- **API Client**: Axios
- **Icons**: React Icons (Fi / Lucide)
- **Modals & Dialogs**: Radix UI primitives
- **Notifications**: React Hot Toast
- **Modals**: SweetAlert2

---

## State Management & Flow

The web client uses **Redux Toolkit** to handle global state:
1. **Auth Slice (`authSlice`)**: Stores authenticated user information and the HTTP Authorization JWT token. Persisted via `redux-persist` so sessions remain intact on page refreshes.
2. **Theme Slice (`themeSlice`)**: Manages the interface theme preferences (`light` vs. `dark`), applying global class tags to the HTML body.

---

## Environment Setup

Create an `.env` file (or let it fallback to default configurations):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Installation & Running

1. **Install Dependencies**:
   ```bash
   yarn install
   ```

2. **Start Dev Server**:
   ```bash
   yarn dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Production Build

1. **Compile & Bundle**:
   ```bash
   yarn build
   ```

2. **Preview Production Build locally**:
   ```bash
   yarn preview
   ```
