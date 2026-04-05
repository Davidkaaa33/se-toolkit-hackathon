# Stack — CS2 Teammate Finder

A web dashboard where CS2 players post profiles and discover compatible teammates by skill level, role, language, and playtime — connecting via Discord.

## Demo

![Stack Dashboard Screenshot](https://via.placeholder.com/800x450/0a1f28/22d3c5?text=Stack+—+CS2+Teammate+Finder)

**Product context:**

- **End users:** CS2 (Counter-Strike 2) players, primarily students and casual-to-competitive gamers, who want to build a reliable team for Faceit matchmaking.
- **Problem:** Players queueing solo are matched with random teammates who may differ significantly in skill level, communication language, availability, or attitude — leading to frustrating, unproductive matches.
- **Solution:** Stack lets players create a public profile (Faceit level, role, language, play style, available hours, Discord) and browse others' profiles with filters. Players contact each other directly via Discord, making it fast and frictionless to form a coordinated, non-toxic stack.

## Features

### Implemented
- ✅ Create player profile with nickname, Faceit level, age, language, role, play style, playtime, and Discord
- ✅ Browse all player profiles in a filterable directory
- ✅ Filter by language, role, play style, Faceit level range, age range
- ✅ Sort by newest, age, or Faceit level
- ✅ Edit and delete your own profiles (session-based ownership)
- ✅ Copy Discord username with one click
- ✅ Responsive design with modern dark gaming aesthetic
- ✅ REST API with PostgreSQL backend
- ✅ Session-based authentication for profile management
- ✅ Dockerized deployment (frontend, backend, database)

### Not Yet Implemented
- ⬜ Discord OAuth login
- ⬜ Profile likes/matches
- ⬜ Real-time notifications
- ⬜ Team formation requests
- ⬜ Player rating/reputation system

## Usage

1. Open the application in your browser
2. **To find teammates:** Browse the player directory and use filters to narrow down results. Click on any profile to see full details and copy their Discord username
3. **To create a profile:** Scroll to "Заполнить анкету" (Fill out form), enter your details, and click "Добавить анкету" (Add profile)
4. **To edit/delete your profiles:** Your profiles are highlighted in orange. Click "Редактировать" to edit or "Удалить" to delete

## Deployment

### Prerequisites

The VM should run **Ubuntu 24.04** (or any Linux distribution with Docker support).

### What should be installed on the VM

1. **Docker** (version 24+)
2. **Docker Compose** (version 2.20+, included with Docker Desktop)
3. **Git** (to clone the repository)

### Step-by-step deployment instructions

#### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/se-toolkit-hackathon.git
cd se-toolkit-hackathon

# 2. Start all services
docker compose up -d --build

# 3. Check that services are running
docker compose ps

# 4. View logs
docker compose logs -f

# 5. Open in browser
# Navigate to http://YOUR_VM_IP
```

The application will be available at:
- **Frontend:** http://localhost (port 80)
- **Backend API:** http://localhost:3001/api
- **Database:** localhost:5432

#### Option 2: Manual Setup (Development)

```bash
# 1. Start PostgreSQL
docker run -d \
  --name stack-db \
  -e POSTGRES_DB=stack_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Start backend
cd backend
cp .env.example .env
npm install
npm run db:init
npm run db:seed
npm run dev

# 3. Serve frontend (use any static file server)
cd ..
npx serve . -l 3000
```

#### Option 3: Production with Nginx Reverse Proxy

```bash
# 1. Deploy with docker-compose (see Option 1)

# 2. Set up Nginx as reverse proxy (if not using docker-compose)
sudo apt update
sudo apt install nginx -y

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/stack

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 4. Enable the site
sudo ln -s /etc/nginx/sites-available/stack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. Set up SSL with Let's Encrypt (optional but recommended)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
PORT=3001
DB_HOST=db
DB_PORT=5432
DB_NAME=stack_db
DB_USER=postgres
DB_PASSWORD=postgres
SESSION_SECRET=change-this-to-a-random-string
NODE_ENV=production
FRONTEND_URL=http://your-domain.com
```

### Useful Docker Commands

```bash
# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build

# View backend logs
docker compose logs backend

# Access database directly
docker compose exec db psql -U postgres -d stack_db

# Restart a specific service
docker compose restart backend
```

## Architecture

```
┌─────────────┐
│   Nginx     │ :80 (Frontend + reverse proxy)
│  (Alpine)   │
└──────┬──────┘
       │
       │ /api/* → proxy
       │
┌──────▼──────┐
│   Express   │ :3001 (Backend API)
│   Node.js   │
└──────┬──────┘
       │
       │ SQL queries
       │
┌──────▼──────┐
│ PostgreSQL  │ :5432 (Database)
│   16 Alpine │
└─────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/players` | Get all players (with query params for filtering) |
| GET | `/api/players/:id` | Get single player |
| POST | `/api/players` | Create new player profile |
| PUT | `/api/players/:id` | Update player profile (own only) |
| DELETE | `/api/players/:id` | Delete player profile (own only) |
| DELETE | `/api/players/session/all` | Delete all own profiles |
| GET | `/api/health` | Health check |

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 16
- **Deployment:** Docker + Docker Compose
- **Web Server:** Nginx (Alpine)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

**Your Name**  
University: Innopolis University  
Email: d.danielian@innopolis.university  
Group: DSAI-02
