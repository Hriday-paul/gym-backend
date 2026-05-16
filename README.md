# 🏋🏽 Jiu Jitsu App — Backend API 💪🏼

A production-ready RESTful backend for a Jiu Jitsu App Android application. Supports multi-gym management, mat & class scheduling, geolocation-based gym discovery, events, user belt progression, achievements, follow system, and real-time push notifications via Firebase + BullMQ.

## ✨ Features

### 🏟 Gyms
- Browse all gyms with full details (name, address, photos, description, contact)
- **Near Me** — discover gyms by proximity using geospatial queries
- Gym location pins on a map (coordinates served to Android Google Maps SDK)
- Follow / Unfollow gyms
- Each gym has multiple **Mats** (training areas) and independent schedules

### 🗓 Mat & Class Scheduling
- Each mat can have its own recurring or one-off schedule
- **Upcoming mat sessions** filtered by user's followed gyms and location
- **Start reminders** — push notifications sent before a mat session begins (via BullMQ delayed jobs)
- Class types: Open Mat, Gi, No-Gi, Competition Training, Kids, etc.

### 🎉 Events
- Create and manage gym events
- Event details

### 👤 User Profile
- Current belt rank (White → Black) with stripe tracking
- Recent achievements (e.g. "First Stripe", "Tournament Win", "10 Classes Streak")
- Followed gyms list
- Upcoming mat session reminders

### 🔔 Notifications
- Firebase Cloud Messaging (FCM) for push notifications
- BullMQ queues for scheduled/delayed notifications (mat reminders, event reminders)
- Nodemailer for transactional emails (OTP, welcome, password reset)

### 🛡 Admin Panel API
- Gym CRUD — create, update, delete gyms
- Mat & Schedule management
- Event management
- User management (view, role assignment, belt updates)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT + Refresh Tokens |
| Push Notifications | Firebase Admin SDK (FCM) |
| Notification Queue | BullMQ + Redis |
| Email | Nodemailer (SMTP) |
| File Storage | AWS S3 |
| Geolocation | MongoDB 2dsphere indexes |
| Rate Limiting | express-rate-limit |
| Validation | express-validator |
| Containerization | Docker + Docker Compose |
---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB 6+ (local or Atlas)
- Redis 7+ (required for BullMQ)
- Firebase project with FCM enabled
- npm or yarn

### Installation

```bash

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Start development server
npm run dev
```

Server starts at: `http://localhost:3000`