# Fast Render Deployment Guide

Follow these simple steps to deploy **forgeai-site-mvcnye51** to Render in under 5 minutes.

---

### Step 1: Push Code to GitHub

Make sure your changes are pushed to your remote GitHub repository:

```bash
git add .
git commit -m "feat: configure render infrastructure"
git push origin main
```

---

### Step 2: Deploy to Render via Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com/) and log in.
2. Click **New +** top right and select **Blueprint**.
3. Connect your GitHub account and select your repository: `forgeai-site-mvcnye51`.
4. Render will read `render.yaml` automatically and prompt you to create:
   - Web Service (`forgeai-site-mvcnye51`)
   - MongoDB Database (`forgeai-db`)
5. Fill in the required environment variable:
   - Set `CLIENT_ORIGIN` to your Render app URL (e.g., `https://forgeai-site-mvcnye51.onrender.com`).
6. Click **Apply**.

---

### Step 3: Add Continuous Deployment Secrets (Optional)

To enable automatic GitHub Actions triggers on every commit:

1. In Render, go to **Account Settings** -> **API Keys** and create an API Key.
2. Get your Service ID from your service's settings page or URL (`srv-xxxxxxxx`).
3. In GitHub, go to **Repository Settings** -> **Secrets and variables** -> **Actions**.
4. Add two secrets:
   - `RENDER_API_KEY`: Your Render API Key
   - `RENDER_SERVICE_ID`: Your Render Service ID

---

### Local Test (Verification)

To verify the Docker container works locally before pushing:

```bash
docker compose up --build -d
```

Visit `http://localhost:10000/health` to confirm the container runs cleanly.