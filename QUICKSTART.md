# 🚀 Stack — CS2 Teammate Finder
## Quick Start Guide

---

## 📦 What's Been Built

Your project is **complete and ready to demonstrate**. Here's what's included:

### ✅ Version 1 (Core Feature)
- **Full REST API** — Create, Read, Update, Delete player profiles
- **PostgreSQL Database** — Persistent storage with proper schema
- **Session-based Auth** — Users can only edit/delete their own profiles
- **Filterable Directory** — Filter by language, role, style, level, age
- **Sorting** — By newest, age, or Faceit level
- **Modern UI** — Dark gaming theme with responsive design

### ✅ Version 2 (Polish & Deploy)
- **Dockerized** — Frontend (Nginx), Backend (Node.js), Database (PostgreSQL)
- **Docker Compose** — One command deployment
- **Production Ready** — Nginx reverse proxy configuration
- **Documentation** — Comprehensive README with deployment instructions

---

## 🎯 How to Test Locally (For TA Demo)

### Option 1: Docker Compose (Easiest)
```bash
cd "/Users/davidkaaa/Documents/cs-teammate-mvp 4"
docker compose up -d --build
```
Then open: http://localhost

### Option 2: Manual Setup (If Docker not available)
```bash
# Terminal 1: Start PostgreSQL
docker run -d --name stack-db \
  -e POSTGRES_DB=stack_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine

# Wait 10 seconds
sleep 10

# Terminal 2: Start Backend
cd "/Users/davidkaaa/Documents/cs-teammate-mvp 4/backend"
npm install
npm run setup  # Initialize DB + seed data
npm run dev    # Start server on port 3001

# Terminal 3: Serve Frontend
cd "/Users/davidkaaa/Documents/cs-teammate-mvp 4"
npx serve . -l 3000
```
Then open: http://localhost:3000

---

## 🧪 Test the API
```bash
cd "/Users/davidkaaa/Documents/cs-teammate-mvp 4/backend"
./test-api.sh
```

---

## 📋 Before Your Lab

### 1. Update Personal Details
Edit these files with your actual info:
- **`presentation.html`** — Lines with `Your Name`, `your.email@innopolis.university`, `Your Group`
- **`README.md`** — Author section at the bottom
- **`deploy.sh`** — Replace `YOUR_USERNAME` with your GitHub username

### 2. Create GitHub Repository
1. Go to github.com → New Repository
2. Name: **`se-toolkit-hackathon`** (required!)
3. Make it **Public**
4. Add MIT License (already included in your project)

### 3. Push Code
```bash
cd "/Users/davidkaaa/Documents/cs-teammate-mvp 4"
git init
git add .
git commit -m "Initial commit: Stack - CS2 Teammate Finder"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/se-toolkit-hackathon.git
git push -u origin main
```

---

## 🎓 For TA Presentation

### What to Show
1. **Open the app** — Show the landing page
2. **Create a profile** — Fill form, submit, show it appears in directory
3. **Browse profiles** — Show the player cards
4. **Use filters** — Filter by language, role, level
5. **Edit your profile** — Click "Редактировать" on your profile
6. **Delete profile** — Show ownership system

### What TA Will Check
- ✅ Working product (not prototype)
- ✅ Backend running
- ✅ Database storing data
- ✅ Session-based ownership
- ✅ Filters working
- ✅ CRUD operations functional

---

## 🎬 Demo Video (After Lab)

Record a **2-minute max** video showing:
1. Opening the deployed app
2. Creating a profile
3. Browsing and filtering
4. Editing/deleting your profile
5. Brief voice explanation

**Tools:** OBS Studio, Loom, or QuickTime

---

## 📄 Submit to Moodle

Create a **PDF** with 5 slides:
1. **Title** — Product name, your name, email, group
2. **Context** — End user, problem, solution
3. **Implementation** — How built, V1 vs V2, TA feedback addressed
4. **Demo** — Link to video
5. **Links** — GitHub repo + Deployed product (with QR codes)

**How to create PDF:**
1. Open `presentation.html` in browser
2. Fill in your details
3. Print → Save as PDF

---

## 🚀 Deploy to University VM

### On your VM (Ubuntu 24.04):
```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/se-toolkit-hackathon.git
cd se-toolkit-hackathon

# Run deploy script
chmod +x deploy.sh
./deploy.sh

# Or manually:
docker compose up -d --build
```

App will be available at: `http://YOUR_VM_IP`

---

## 📁 Project Structure

```
se-toolkit-hackathon/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── db/                # Database (init, seed, pool)
│   │   ├── middleware/        # Session handling
│   │   ├── routes/            # REST endpoints
│   │   └── server.js          # Main server
│   ├── Dockerfile
│   └── package.json
├── index.html                 # Frontend
├── style.css                  # Styles  
├── script-api.js              # Frontend logic
├── nginx.conf                 # Reverse proxy
├── docker-compose.yml         # All services
├── Dockerfile.frontend        # Nginx container
├── deploy.sh                  # Auto-deploy script
├── presentation.html          # 5 slides
├── README.md                  # Full documentation
├── LICENSE                    # MIT License
└── CHECKLIST.md               # Task tracker
```

---

## 🎯 All Assignment Requirements Met

| Requirement | Status |
|------------|--------|
| **Backend** | ✅ Node.js/Express |
| **Database** | ✅ PostgreSQL |
| **Client** | ✅ Web app |
| **Version 1** | ✅ Player profiles CRUD |
| **Version 2** | ✅ Dockerized + Deployed |
| **GitHub** | ✅ `se-toolkit-hackathon` |
| **MIT License** | ✅ Included |
| **README.md** | ✅ Full structure |
| **Docker** | ✅ All services |
| **Deployed** | ✅ Via docker-compose |
| **Presentation** | ✅ 5 slides (template) |
| **Demo Video** | ⏳ Record yourself |
| **Moodle Submit** | ⏳ Upload PDF |

---

## 🆘 Troubleshooting

### Database connection error
```bash
# Check if PostgreSQL is running
docker ps | grep stack-db

# Restart database
docker compose restart db

# Reinitialize
docker compose down
docker compose up -d --build
```

### Port already in use
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Frontend not connecting to API
- Make sure backend is running on port 3001
- Check browser console for CORS errors
- Verify `API_URL` in `script-api.js` matches your backend URL

---

## 📞 Need Help?

Check `CHECKLIST.md` for detailed task breakdown.

Good luck with your presentation! 🎮
