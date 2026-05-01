# GreenLux Residency — Operations Intelligence System (MVP v5.5D)

A production-grade internal operations platform designed for a real-world serviced accommodation business.

This system replaces fragmented, manual workflows (WhatsApp, spreadsheets, ad-hoc coordination) with a structured, auditable, and analytics-driven operational layer.

---

## 🧠 Problem Context

GreenLux Residency operates in a high-friction environment:

- Bookings from multiple sources (Booking.com, WhatsApp, walk-ins)
- Non-technical operational staff
- Incomplete or delayed guest data
- Real-time decision-making at check-in

Traditional systems either:
- ❌ Block operations with rigid validation  
- ❌ Or allow chaos with no visibility  

---

## 🎯 Solution Approach

> **Do not block operations — make risk visible and manageable**

Key design principles:

- Enable check-in under imperfect conditions
- Track and surface operational risk explicitly
- Maintain a single source of truth for data
- Prioritise usability for non-technical users
- Preserve auditability for reporting and control

---

## ⚙️ System Capabilities

### Guest Operations
- Self-service and admin-assisted check-in
- Walk-in and WhatsApp booking handling
- Room assignment and stay lifecycle management

### Verification Layer
- CNIC / Passport capture
- Payment proof tracking
- Structured document status:
  - `pending`
  - `verified`
  - `rejected`

### Controlled Override System (Core Feature)
- Automated readiness detection (room, ID, payment)
- **Exception-based check-in flow**
- Structured issue tracking for incomplete cases

→ Allows operations to continue without data loss or blind risk

### Admin Control Panel
- Guest management
- Verification workflows
- Check-in / check-out execution
- Issue visibility and resolution
- WhatsApp-assisted operational actions

### Financial & Operational Tracking
- Expenses (financial truth layer)
- Maintenance logs (operational cost tracking)
- Audit logs for administrative actions

### Analytics & Reporting
- Revenue (paid vs expected)
- Outstanding balances
- Booking source breakdown
- Room-level performance metrics
- New vs repeat guest tracking
- CSV export (date-range based)

---

## 🧱 System Architecture

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS  
- **Backend:** Supabase (Postgres, Auth, Storage)  
- **Access Control:** Row-Level Security (RLS)  
- **Deployment:** Vercel  

Designed as a lightweight, extensible foundation for future integrations.

---

## ⚠️ Real-World Trade-offs

This system intentionally:

- Does **not block check-in** due to missing data  
- Avoids premature complexity (booking engines, integrations)  
- Favors **operational continuity over theoretical correctness**

Instead, it enforces:

- Visibility of incomplete or risky states  
- Structured recovery workflows  
- Clean data for downstream analytics  

---

## 🚀 What This Demonstrates

- End-to-end system design (frontend, backend, data model)
- Translating messy real-world operations into structured systems
- Building for non-technical users under time pressure
- Designing for flexibility without sacrificing data integrity
- Applying product thinking, not just engineering

---

## 📌 Status

**MVP Complete — Phase 5.5D**

Currently supports:
- Live check-in workflows  
- Admin operations  
- Financial tracking  
- Operational analytics  

---

## 📍 Deployment

https://greenlux-ops.vercel.app

---

## 👤 Author

Mustafa Chaudry  
MSc Computer Science (Artificial Intelligence)  
Sheffield, UK  
