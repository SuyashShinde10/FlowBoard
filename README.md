# FlowBoard — Collaborative Project Management Platform

A full-stack MERN collaborative project management platform with real-time features, advanced Kanban, and analytics.

## 🚀 Features
- **Authentication** — JWT-based auth with Admin, Project Manager, Member roles
- **Multi-Project Workspaces** — Create workspaces, invite members, assign roles
- **Advanced Kanban** — Drag & drop, custom columns, task priority/labels/due dates/attachments/activity log
- **Real-Time** — Live task movement & comments via Socket.IO
- **Analytics Dashboard** — 6 charts: completed over time, priority distribution, productivity, overdue trend, burn-down, column distribution
- **Dark/Light Mode** — Full theme system with CSS variables

## 🛠️ Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Styling | Custom CSS with CSS Variables |
| State | Zustand + React Query |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| File Uploads | Multer + Cloudinary |

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (for file uploads)

### 1. Clone & Install
```bash
git clone <your-repo>
cd Assignment

# Install server dependencies
cd server && npm install

# Install client dependencies  
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — Edit `server/.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/flowboard-pmp
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

**Client** — Edit `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

App runs at: http://localhost:5173

## 🚀 Deployment

| Service | Platform |
|---|---|
| Backend | Render.com |
| Frontend | Vercel |
| Database | MongoDB Atlas |
| Files | Cloudinary |

### Deploy Backend to Render
1. Create new Web Service on Render
2. Connect GitHub repo, set root to `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables

### Deploy Frontend to Vercel
1. Import GitHub repo
2. Set root to `client`
3. Add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to your Render URL

## 📁 Structure
```
Assignment/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Route pages
│       ├── store/       # Zustand state
│       └── services/    # API + Socket
└── server/          # Express backend
    ├── controllers/ # Business logic
    ├── models/      # Mongoose schemas
    ├── routes/      # API routes
    ├── middleware/  # Auth + role guard
    └── socket/      # Socket.IO handlers
```
