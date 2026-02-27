# Network Error Troubleshooting Guide

## ❌ Problem: "Network Error" on Login/Register

The frontend is unable to connect to the backend server.

---

## ✅ Quick Fixes

### 1. **Check Backend is Running**

In a terminal from the root directory (`p:\cloud 2.0`), run:

```bash
npm run dev
```

**Expected output:**
```
Server running on port 5000
Database connection attempted...
```

### 2. **Check Backend Port**

Make sure backend is on port **5000**. If it's running on a different port, update `.env.local`:

```
# In frontend/.env.local
REACT_APP_API_URL=http://localhost:YOUR_PORT/api/v1
```

### 3. **Check API URL Configuration**

Verify `frontend/.env.local` has correct URL:

```bash
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_ENVIRONMENT=development
```

### 4. **Hard Refresh Frontend**

- Clear browser cache: `Ctrl+Shift+Delete`
- Or press `Ctrl+Shift+R` for hard refresh
- Or press `F12` → DevTools → Network → Disable cache → Refresh

### 5. **Check Network Tab**

1. Open Browser DevTools: Press `F12`
2. Go to **Network** tab
3. Try to register/login
4. Look at the request:
   - **If it shows red error**: Backend is not responding
   - **If it shows timeout**: Backend might be slow or crashed
   - **Check the URL**: Should be `http://localhost:5000/api/v1/auth/register`

---

## 🔍 Detailed Troubleshooting

### Issue: Backend Not Running

**Symptoms:**
- Network errors on every request
- Connection refused messages
- Timeout errors

**Solution:**
```bash
# Navigate to project root
cd p:\cloud 2.0

# Start backend
npm run dev

# If port is in use, kill existing processes:
# Windows PowerShell:
Get-Process node | Stop-Process -Force
npm run dev
```

### Issue: Wrong Port

**Symptoms:**
- Backend running but frontend says "cannot connect"
- Connection refused on port 5000 specifically

**Solution:**
1. Check what port backend is actually running on
2. Update `frontend/.env.local` with correct port
3. Restart frontend: stop `npm start` and run again

### Issue: CORS Error

**Symptoms:**
- Request appears in Network tab but blocked
- CORS error in browser console
- "Access-Control-Allow-Origin" missing

**Solution:**
Check backend `server.js` has CORS configured:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

### Issue: Firewall Blocking Connection

**Symptoms:**
- Network error
- No request appears in Network tab
- Connection times out

**Solution:**
- Windows Firewall may be blocking port 5000
- Add exception for Node.js or port 5000
- Or temporarily disable firewall to test

---

## 🛠️ Debugging Steps

### 1. Check Backend is Accessible

Open browser and visit: `http://localhost:5000/`

Expected: Either a page loads or you get a different error (not "connection refused")

### 2. Test API Endpoint Directly

In browser, test the endpoint:
```
http://localhost:5000/api/v1/auth/profile
```

If 401 Unauthorized appears → Backend is running ✓  
If connection error → Backend not running ✗

### 3. Check Browser Console

Press `F12` → **Console** tab, look for errors like:
- `Network error: Unable to connect`
- `ERR_CONNECTION_REFUSED`
- `ERR_NETWORK`

### 4. Check Node Process

PowerShell command to see if Node is running:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

If nothing appears → Node not running, start backend

---

## 📋 Startup Checklist

Before troubleshooting, verify:

- [ ] Backend running: `npm run dev` (from root)
- [ ] Backend port: 5000
- [ ] Frontend URL: `REACT_APP_API_URL=http://localhost:5000/api/v1`
- [ ] Frontend running: `npm start` (from frontend folder)
- [ ] No firewall blocking port 5000
- [ ] No other service on port 5000

---

## 🧪 Test Connection

Use the **Connection Diagnostics** component that appears on Login/Register pages:

- Green checkmark ✓ = Backend is running
- Red X ✗ = Backend connection failed
- Yellow ? = Still checking...

---

## 🚀 Working Setup

```
Terminal 1 (Backend):
cd p:\cloud 2.0
npm run dev
# Waits for "Server running on port 5000"

Terminal 2 (Frontend):
cd p:\cloud 2.0\frontend
npm start
# Waits for "webpack compiled..."
```

Both running = Ready to use!

---

## 📞 Still Having Issues?

If none of the above work:

1. **Check backend logs** - Look for errors in "Terminal 1"
2. **Verify Node.js installed** - `node --version` should work
3. **Try different browser** - Chrome, Firefox, Edge
4. **Check antivirus** - Might be blocking localhost connections
5. **Restart computer** - Nuclear option, but often helps

---

## 🎯 When to Expect Success

**✓ Login/Register Works When:**
1. Backend is running on port 5000
2. Frontend can reach `http://localhost:5000/api/v1/auth/register`
3. Form is filled with valid data
4. Connection Diagnostics shows green checkmark

**✗ Network Error Will Show When:**
1. Backend not running
2. Firewall blocking connection
3. Wrong API URL in .env.local
4. Port already in use by another process

---

**Latest Update:** February 25, 2026
