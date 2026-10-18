# Fast Deployment Guide for Render

Deploy this application to Render in under 5 minutes using Blueprint (Infrastructure as Code).

## Prerequisites
- A [Render Account](https://render.com)
- A GitHub repository containing this project

---

## Step 1: Push Code to GitHub
Ensure all new configuration files are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "chore: add production deploy setup"
git push origin main
```

---

## Step 2: Deploy to Render using Blueprint
1. Log in to the [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button in the top right corner and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file.
5. Enter a **Service Group Name** (e.g., `forgeai-stack`).
6. Click **Apply**. Render will provision your Node.js Web Service and a managed database.

---

## Step 3: Configure Environment Variables
1. Once created, go to your Web Service settings on Render.
2. Under **Environment**, update `CLIENT_ORIGIN` to match your newly created Render service URL (e.g., `https://forgeai-site-mvcnye51.onrender.com`).

---

## (Optional) Step 4: Setup Automated CI/CD Deployment
1. On your Web Service dashboard in Render, go to **Settings**.
2. Scroll to **Deploy Hook** and copy the generated URL.
3. Open your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Create a new repository secret named `RENDER_DEPLOY_HOOK_URL` and paste the URL.
5. Any future push to `main` will automatically test and deploy your app.

---

## Local Verification
To test the production Docker build locally before pushing:
```bash
docker compose up --build -d
```
Visit `http://localhost:10000` to verify functionality.