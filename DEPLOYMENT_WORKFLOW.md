# 🚀 Eventra Deployment Workflow

This document outlines the standard process for pushing updates from your local development environment to the live VPS server (`eventra.cloud`).

---

## 💻 Step 1: Local Development (Your PC)
Once you have finished making and testing your changes locally:

1. **Commit and Push to GitHub:**
   ```bash
   git add .
   git commit -m "Description of changes (e.g., Fixed attendee table borders)"
   git push origin main
   ```

---

## ☁️ Step 2: Live Server Update (VPS)
SSH into your Hostinger VPS and run the following sequence to go live:

1. **Navigate to Project:**
   ```bash
   cd /var/www/eventraX1
   ```

2. **Pull Latest Changes:**
   ```bash
   git pull origin main
   ```

3. **Rebuild Frontend:**
   ```bash
   npm run build
   ```

4. **Restart Backend (Only if backend code changed):**
   ```bash
   pm2 restart eventra-backend
   ```

---

## ⚡ Pro Tip: The "One-Second" Deploy
You can run this single command on your VPS to execute all the steps above in one go:

```bash
cd /var/www/eventraX1 && git pull origin main && npm run build && pm2 restart eventra-backend
```

---

## 🛠️ Troubleshooting
* **Old version still showing?** 
  - Open the site in an **Incognito Window**.
  - If it works there, hard refresh your main browser (`Ctrl + F5`).
* **Git Pull Conflict?**
  - If the server has local changes preventing a pull, run: 
    `git reset --hard origin/main` 
    *(Warning: This will overwrite any manual changes made directly on the VPS).*
* **Backend Error?**
  - Check PM2 logs: `pm2 logs eventra-backend`
