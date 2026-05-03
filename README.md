# GreenLux Residency — Operations Intelligence System (MVP v5.6)

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

### 🧾 Guest Folio & Additional Charges
- Add and track value-added services (breakfast, tea, extra bed, etc.)
- Paid vs unpaid charge tracking
- Included in total guest revenue and outstanding balance
- Printable guest receipt with full folio breakdown

### 🔁 Extend Stay Workflow
- Extend guest stay directly from guest record
- Adjust expected revenue and optional payment
- Automatic audit note for traceability

### 🔧 Maintenance & Expense Integration
- Maintenance logs for operational tracking
- Expenses as financial source of truth
- Actual maintenance costs linked to expenses (no double counting)

### 🔐 Role-Based Access Control
- Manager: operational access (no financial visibility)
- Admin: extended operations
- Super Admin: full financial and system control

---

## 🏗️ System Architecture

![GreenLux Architecture](./Architecture.png)

This architecture represents a production-grade operations system designed for real-world hospitality environments.

It prioritises:
- flexibility over rigid workflows
- auditability over restriction
- admin control under operational pressure

---

## 🔄 Operational Transformation

### Before

- Bookings scattered across WhatsApp and platforms  
- No structured guest records  
- Manual check-in coordination  
- Missing or inconsistent ID/payment tracking  
- No visibility on revenue or outstanding balances  

### After

- Centralised guest management system  
- Structured check-in workflows (self + admin-assisted)  
- Document and payment verification tracking  
- Controlled override system for real-world flexibility  
- Real-time visibility on revenue, occupancy, and operations 
- Full guest folio with additional services and revenue tracking 

---

This system transforms a fragmented, reactive operation into a structured, auditable, and decision-ready workflow layer.


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

**Production MVP — Phase 5.6 (Live System, Actively Evolving)**

Recent upgrades:
- Guest folio / service-level revenue tracking
- Extend stay workflow
- Maintenance-to-expense financial integration
- Role-based access control
- Corrected verification vs readiness logic

Built and iterated against real-world hospitality operations.

---

## 📍 Deployment

Internal Operations System:
https://greenlux-ops.vercel.app/admin

Guest Check-in:
https://greenlux-ops.vercel.app/dashboard/check-in

Public Website:
https://greenluxresidency.com

---

## 👤 Author

Mustafa Chaudry  
MSc Computer Science (Artificial Intelligence)  
Sheffield, UK  
