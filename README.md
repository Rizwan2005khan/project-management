# 🚀 ProjectHub V2 - Enterprise Project Management Platform

ProjectHub V2 is a high-performance project management platform built with the **PERN Stack** (Prisma, Express, React, Node.js). It is designed to transform complex workflows into streamlined, automated, and visually stunning experiences.

---

## ✨ Core Features

### 📋 1. Multi-Dimensional Project Views
Switch between different perspectives to manage your work exactly how you want:
- **List View**: A high-density grid for detailed task management with dynamic columns.
- **Kanban Board**: A drag-and-drop visual workflow for tracking stages and bottlenecks.
- **Calendar View**: A bird's-eye view of deadlines and project timelines.
- **Activity Feed**: A real-time audit log of every change made within the project.

### 🛠️ 2. Dynamic Custom Fields
Go beyond "Standard" tasks. Create project-specific metadata:
- Add **Text, Number, Date, or Dropdown** fields at the project level.
- These fields automatically appear as columns in your List view and editable fields in task details.
- Perfect for tracking budgets, SKUs, or specialized priority levels.

### ✍️ 3. Rich Text & Markdown Support
Communicate with precision using fully integrated Markdown support:
- Format task descriptions and comments with bold text, lists, and links.
- Professional typography rendering for maximum readability.

### 📊 4. Workload Management
Prevent team burnout with data-driven capacity planning:
- **Stacked Bar Charts**: Visualize "In Progress" vs. "Completed" tasks per member.
- **Capacity Alerts**: Automatically flags team members who are "At Capacity" (>5 active tasks).
- **Overdue Tracking**: Identifies specific bottlenecks by highlighting overdue work.

### 📂 5. Project Portfolios
Monitor the health of your entire organization from one place:
- **Project Health Indicators**: Color-coded statuses (On Track, At Risk, Off Track).
- **Live Progress Bars**: Real-time calculation of project completion percentages.
- **Stakeholder Overview**: High-level meta-data including team size and final deadlines.

### ⏱️ 6. Integrated Time Tracking
Track every second of productivity without leaving the app:
- **Task Stopwatch**: Start and stop timers directly within the task side panel.
- **Server-Side Accuracy**: Timers persist even if you close your browser.
- **Team Logs**: View a collaborative log of total time spent by all contributors.

### 🖼️ 7. Rich Media & Gallery View
Manage visual assets and proofing effortlessly:
- **Project Gallery**: A centralized repository of all screenshots and videos attached to tasks.
- **Media Previews**: Interactive thumbnails with glassmorphism-style hover actions.
- **Attachment Management**: Upload and link rich media to provide visual context for tasks.

### ⚡ 8. Workflow Automations
Let the app work for you with intelligent "If This, Then That" rules:
- **Triggers**: React to status changes (e.g., "When Status is DONE").
- **Actions**: Automatically re-assign tasks or update priorities in the background.
- **Powered by Inngest**: High-reliability background processing for complex workflows.

---

## 🛠️ Technical Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, Redux Toolkit.
- **Backend**: Node.js, Express, Prisma (PostgreSQL/Neon).
- **Authentication**: Clerk (Enterprise-grade Auth & Organizations).
- **Background Jobs**: Inngest.
- **Email**: Nodemailer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- PostgreSQL database (Neon.tech recommended).
- Clerk Account for Authentication.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   ```

2. **Setup the Server**:
   ```bash
   cd server
   npm install
   # Create a .env file with DATABASE_URL, CLERK_SECRET_KEY, etc.
   npx prisma db push
   npm run dev
   ```

3. **Setup the Client**:
   ```bash
   cd client
   npm install
   # Create a .env file with VITE_CLERK_PUBLISHABLE_KEY
   npm run dev
   ```

---

## 🎨 Design Philosophy
ProjectHub V2 utilizes **Glassmorphism** and a curated dark/light mode system. Every component is designed to feel premium, responsive, and alive, ensuring that managing work is as beautiful as it is functional.
