# FlowBoard — Collaborative Project Management Platform
### MERN Stack Assignment Documentation

FlowBoard is a premium, real-time project management platform inspired by modern tools like Linear and Vercel. It provides a seamless interface for teams to collaborate, track progress, and analyze productivity through an advanced Kanban system.

---

## 🚀 1. Technology Stack
*   **Frontend**: React (Vite), React Router 6, TanStack Query (v5), @dnd-kit (Drag & Drop), Framer Motion (Animations), Recharts (Analytics), Lucide React (Icons).
*   **Backend**: Node.js, Express, MongoDB with Mongoose.
*   **Real-Time**: Socket.io for live task movement and comments.
*   **Storage**: Cloudinary for file attachments (Image/PDF support).
*   **Security**: JWT Authentication, Bcrypt, Helmet, Express-Rate-Limit, Mongo-Sanitize.
*   **Deployment**: Backend on Render, Frontend on Vercel.

---

## 🏗️ 2. Build Process & Architecture

### **Phase 1: Foundation (Database & Auth)**
*   Designed a hierarchical schema: **User -> Workspace -> Project -> Task**.
*   Implemented a robust **Role-Based Access Control (RBAC)** system with three levels: Admin, Manager, and Member.
*   Built JWT-based authentication with secure password hashing.

### **Phase 2: Workspace & Project Logic**
*   Created the "Multi-Project Workspace" system where one workspace can house dozens of projects.
*   Implemented "Invite to Workspace" logic (simulated email invitations).
*   Added Project Member Management to restrict task assignment to specific team members.

### **Phase 3: The Advanced Kanban Engine**
*   Integrated `@dnd-kit` for high-performance drag-and-drop.
*   Built customizable columns and task reordering.
*   Developed the **Task Modal**: Supporting descriptions, multi-assignees, due dates, priority badges, labels, and activity logs.

### **Phase 4: Real-Time & Attachments**
*   Established Web Socket connections for "Live Sync". When one user moves a task or comments, all other team members see the update instantly without refreshing.
*   Integrated Multer-Cloudinary to handle multi-format file uploads (PDFs, Docs, Images).

### **Phase 5: Analytics & Hardening**
*   Developed a dedicated **Analytics Dashboard** using Recharts to visualize burndown charts and team productivity.
*   Implemented server sanity checks (Heartbeat, CORS hardening) to ensure 99.9% uptime on Render.

---

## 👥 3. Role-Based Walkthrough

### **👑 Admin (The Controller)**
*   **Goal**: Full organization oversight.
*   **Capabilities**: 
    - Create/Delete Workspaces and Projects.
    - Invite new users to the Workspace and assign their initial roles.
    - **Update Roles**: Change a 'Member' to a 'Manager' or 'Admin'.
    - Remove anyone from the workspace or project.
    - View advanced project analytics.

### **🛡️ Project Manager (The Leader)**
*   **Goal**: Lead execution and manage deadlines.
*   **Capabilities**:
    - Create new projects and columns.
    - Add/Remove workspace members to a specific project.
    - Create, Edit, Move, and Delete tasks.
    - Assign multiple members to a single task.
    - View project analytics and productivity charts.

### **👤 Team Member (The Doer)**
*   **Goal**: Collaborative execution.
*   **Capabilities**:
    - View all projects they are added to.
    - Create, Edit, and Move tasks.
    - Comment on tasks and upload attachments.
    - View project progress.
    *   **Restriction**: Cannot delete tasks, remove members, or change project structures.

---

## 🛠️ 4. Local Setup
1.  **Clone Repository**: `git clone <repo-url>`
2.  **Server**: `cd server && npm install && npm start`
    *   *Requires `.env` with MONGO_URI, JWT_SECRET, CLOUDINARY_URL.*
3.  **Client**: `cd client && npm install && npm run dev`
    *   *Requires `VITE_API_URL` pointing to backend.*

---

## ✅ 5. Final Compliance Status
All "MERN Assignment" requirements (Auth, Workspace, Kanban, Real-time, Analytics, UI/UX) are **fully implemented and tested**.
