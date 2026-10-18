# 🚀 5-Minute Render Deployment Guide

Follow these simple steps to deploy your Express + MongoDB application to Render.

---

### Step 1: Push Code to GitHub

Ensure all files (including `render.yaml` and `Dockerfile`) are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "feat: setup production containerization & deployment"
git push origin main
```

---

### Step 2: Connect Repository to Render Blueprint

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top right corner and select **Blueprint**.
3. Connect your GitHub account and select this repository (`forgeai-site-mvcnye51`).
4. Render will parse `render.yaml` and auto-configure both the **Web Service** and **MongoDB Instance**.
5. Click **Apply**.

---

### Step 3: Configure Environment Variables & Health Check Endpoint

1. Ensure your Express app exports a health endpoint in `server/index.js`:
   ```javascript
   app.get('/health', (req, res) => res.status(200).send('OK'));
   ```
2. In the Render Dashboard, open your newly created Web Service and go to **Environment**.
3. Update `CLIENT_URL` with your actual deployment URL (e.g., `https://forgeai-site-mvcnye51.onrender.com`).

---

### Step 4: Setup Automated CI/CD via GitHub Actions (Optional)

1. Open your Web Service settings on Render, find **Deploy Hook**, and copy the URL.
2. In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
3. Create a new secret:
   - **Name:** `RENDER_DEPLOY_HOOK_URL`
   - **Value:** Paste the deploy hook URL copied from Render.

Every commit pushed to `main` will now run checks and automatically trigger a clean production build!