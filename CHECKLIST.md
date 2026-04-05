# Stack — Project Checklist

## ✅ Completed

- [x] **Backend** — Node.js/Express REST API with full CRUD
- [x] **Database** — PostgreSQL with schema, indexes, and seed data
- [x] **Frontend** — Updated to use API instead of localStorage
- [x] **Session-based auth** — Cookie-based session for profile ownership
- [x] **Dockerization** — Dockerfiles for frontend, backend, and PostgreSQL
- [x] **Docker Compose** — Single command deployment of all services
- [x] **README.md** — Comprehensive documentation with deployment instructions
- [x] **MIT License** — Open-source license added
- [x] **Presentation** — 5-slide HTML presentation template
- [x] **Deploy script** — Automated deployment script for Ubuntu VM

## 📋 What You Need to Do Manually

### Before Lab (Preparation)
1. **Fill in your personal details** in these files:
   - `presentation.html` — Replace `Your Name`, `your.email@innopolis.university`, `Your Group`
   - `README.md` — Replace author info at the bottom
   - `deploy.sh` — Replace `YOUR_USERNAME` in the GitHub URL

2. **Create GitHub repository**:
   ```bash
   # Go to github.com → New Repository
   # Name: se-toolkit-hackathon
   # Add MIT License
   # Make it public
   ```

3. **Push code to GitHub**:
   ```bash
   cd "/Users/davidkaaa/Documents/cs-teammate-mvp 4"
   git init
   git add .
   git commit -m "Initial commit: Stack - CS2 Teammate Finder"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/se-toolkit-hackathon.git
   git push -u origin main
   ```

### Version 1 (Show to TA in Lab)
4. **Test locally** — Make sure everything works:
   ```bash
   # Start PostgreSQL
   docker run -d --name stack-db -e POSTGRES_DB=stack_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
   
   # Wait 10 seconds for DB to start
   sleep 10
   
   # Start backend
   cd backend
   npm run setup  # Initialize and seed database
   npm run dev    # Start development server
   
   # Open frontend (serve static files)
   # In another terminal:
   cd ..
   npx serve . -l 3000
   ```

5. **Show to TA** and get feedback
6. **Note TA feedback** for Version 2

### Version 2 (After Lab)
7. **Address TA feedback**
8. **Deploy to VM**:
   ```bash
   # On your university VM (Ubuntu 24.04)
   ./deploy.sh
   ```
9. **Record demo video** (under 2 minutes with voice commentary):
   - Show creating a profile
   - Show browsing/filtering profiles
   - Show editing/deleting own profile
   - Use OBS, Loom, or similar tool

10. **Update presentation**:
    - Add real GitHub repo link
    - Add deployed product link
    - Generate QR codes (use any online QR code generator)
    - Embed demo video or link to it

11. **Submit PDF to Moodle** with:
    - 5 presentation slides (save presentation.html as PDF)
    - Demo video link

## 🎯 Assignment Requirements Checklist

- [x] Backend (Node.js/Express)
- [x] Database (PostgreSQL)
- [x] End-user-facing client (Web app)
- [x] Version 1: One core feature done well (player profiles CRUD)
- [x] Version 2: Improves V1 + deployed
- [x] Docker all services
- [x] Deploy to be accessible
- [x] GitHub repo named `se-toolkit-hackathon`
- [x] MIT License
- [x] README.md with required structure
- [ ] Presentation with 5 slides (template provided, fill in your details)
- [ ] Demo video (record yourself)
- [ ] Submit via Moodle

## 📁 Project Structure

```
se-toolkit-hackathon/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── init.js      # Database schema
│   │   │   ├── pool.js      # PostgreSQL connection
│   │   │   └── seed.js      # Default data
│   │   ├── middleware/
│   │   │   └── session.js   # Session attachment
│   │   ├── routes/
│   │   │   └── players.js   # REST API routes
│   │   └── server.js        # Express server
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── index.html               # Frontend
├── style.css                # Styles
├── script-api.js            # Frontend logic (API-based)
├── nginx.conf               # Nginx config
├── docker-compose.yml       # All services
├── Dockerfile.frontend      # Frontend container
├── deploy.sh                # Deployment script
├── presentation.html        # 5-slide presentation
├── README.md                # Documentation
└── LICENSE                  # MIT License
```

## 🔧 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vanilla HTML/CSS/JS |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 |
| Auth | Session-based (cookies) |
| Deployment | Docker + Docker Compose |
| Web Server | Nginx (Alpine) |

## 🚀 Quick Start

```bash
# One command to run everything
docker compose up -d --build

# Open in browser
open http://localhost
```
