# Exebyte Management Console

This is a modern, full-stack management console built with React, Vite, Tailwind CSS, Express, and MongoDB.

## Architecture

This standalone application operates on a unified server architecture using **Express + Vite Middleware**:
- **Development**: Runs an Express server that utilizes Vite in `middlewareMode` to handle hot reloading and frontend serving alongside API routes on port `3000`.
- **Production**: Runs the standard Express server which serves the statically built React frontend out of the `/dist` directory.

---

## 🛠️ Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://your-mongodb-connection-string
   JWT_SECRET=your-super-secret-key-for-jwt
   PORT=3000
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application and API will be available at `http://localhost:3000`.

---

## 🚀 How to Host This Application in Production

Because this app utilizes a full-stack architecture (Express + React), it must be hosted on a platform that supports **Node.js** workloads (not just static site hosts like Netlify or Vercel).

### Option 1: PaaS (Render, Railway, Heroku) - *Recommended*

Deploying to a Platform-as-a-Service is the easiest method.

1. Create a new "Web Service" on your chosen platform.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Environment:** `Node` / `Node.js`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
4. Add your **Environment Variables**:
   - `MONGODB_URI`: Your production MongoDB connection string.
   - `JWT_SECRET`: A secure, random string (e.g., generated via `openssl rand -base64 32`).
   - `NODE_ENV`: `production` (Crucial: This tells the server to serve the built static `/dist` directory instead of using Vite's development middleware).
5. Deploy.

### Option 2: Docker Container (For Kubernetes, AWS ECS, Google Cloud Run)

You can containerize this application easily. Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t exebyte-console .
docker run -p 3000:3000 -e NODE_ENV=production -e MONGODB_URI="..." -e JWT_SECRET="..." exebyte-console
```

### Option 3: VPS bare-metal (DigitalOcean, AWS EC2, Linode)

If you are managing your own Ubuntu/Debian server:

1. SSH into your server and install Node.js (v20+), NPM, and PM2.
   ```bash
   npm install -g pm2
   ```
2. Clone your repository and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
   npm install
   npm run build
   ```
3. Create a `.env` file containing your `MONGODB_URI`, `JWT_SECRET`, and `NODE_ENV=production`.
4. Start the app using PM2 to keep it alive in the background:
   ```bash
   pm2 start npm --name "exebyte-console" -- start
   pm2 startup
   pm2 save
   ```
5. (Optional but recommended): Use **Nginx** or **Caddy** to set up a reverse proxy pointing domain traffic (ports 80/443) to `localhost:3000`.

## Default Access
If no admin accounts exist in your database, navigating to `/api/auth/setup` via a cURL or script will initialize an `admin` document with the password `admin123`. We recommend changing this immediately or disabling the initialization route upon first launch.
