# React Frontend - Quick Start Guide

## 📦 Installation

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

Dependencies will be installed:
- `react@^18.2.0` - UI library
- `react-dom@^18.2.0` - DOM renderer
- `react-router-dom@^6.20.0` - Client-side routing
- `axios@^1.6.0` - HTTP client
- `jwt-decode@^4.0.0` - JWT decoding (optional)

### Step 2: Configure Environment

Create `.env.local` (template provided in `.env.example`):
```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_ENVIRONMENT=development
```

### Step 3: Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🚀 Running the Application

### Development Mode
```bash
npm start
```
- Hot-reload on file changes
- Opens browser automatically
- Shows errors in console and overlay

### Production Build
```bash
npm run build
```
- Optimized bundle
- Output in `/build` directory
- Ready for deployment

### Testing
```bash
npm test
```
- Runs Jest test suite
- Watch mode by default

---

## 🔐 Authentication Setup

### How It Works
1. User logs in with email/password
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token automatically added to all API requests
5. On logout, token removed and user redirected to login

### In Code
```javascript
// Login
const { login } = useAuth();
await login('user@example.com', 'password');

// Check auth status
const { isAuthenticated, user } = useAuth();

// Logout
const { logout } = useAuth();
logout();
```

### Token Auto-Injection
Axios interceptor automatically adds token to headers:
```
Authorization: Bearer <token>
```

---

## 📄 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Full-page components (routes)
│   ├── services/         # API communication layer
│   ├── context/          # Global state (auth)
│   ├── hooks/            # Custom hooks
│   ├── App.jsx           # Main component with routing
│   ├── index.js          # Entry point
│   └── *.css             # Styles
├── public/               # Static assets
├── package.json          # Dependencies
├── .env.local            # Environment config
└── README.md             # Documentation
```

---

## 🔗 API Service Examples

### Medicines
```javascript
import medicineService from '../services/medicineService';

// Get all medicines
const medicines = await medicineService.getMedicines();

// Get with filters
const filtered = await medicineService.getMedicines({ category: 'antibiotics' });

// Search
const results = await medicineService.searchMedicines('paracetamol');

// Create
await medicineService.createMedicine({ name: 'Aspirin', ... });
```

### Sales
```javascript
import saleService from '../services/saleService';

// Create sale with FIFO deduction
await saleService.createSale({
  items: [{ medicineId: '123', quantity: 5, price: 10 }],
  ...
});

// Get available stock
const stock = await saleService.getAvailableStock('medicineId');
```

### Reports
```javascript
import reportService from '../services/reportService';

// Daily sales
const today = await reportService.getSalesToday();

// Top medicines
const top = await reportService.getTopMedicines('month', 10);

// Inventory health
const health = await reportService.getInventoryHealth();
```

### AI Assistant
```javascript
import aiService from '../services/aiService';

// Natural language query
const result = await aiService.query('What medicines are expiring soon?');

// Get supported intents
const intents = await aiService.getIntents();
```

---

## 🎣 Custom Hooks

### useAuth
Access authentication state:
```javascript
const {
  user,              // { id, email, name, role }
  token,             // JWT token
  isAuthenticated,   // boolean
  loading,           // during operations
  error,             // error message
  login,             // function
  register,          // function
  logout,            // function
  updateProfile,     // function
  clearError         // function
} = useAuth();
```

### useApi
Manage API call state:
```javascript
const {
  loading,  // boolean
  error,    // string or null
  data,     // response data
  execute   // function to call API
} = useApi(medicineService.getMedicines);

// Call it
useEffect(() => {
  execute(); // can pass args: execute(filters)
}, [execute]);
```

---

## 🛡️ Protected Routes

### Basic Protection
```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```
Redirects to `/login` if not authenticated

### Role-Based Protection
```javascript
<ProtectedRoute requiredRoles={['admin', 'pharmacist']}>
  <Reports />
</ProtectedRoute>
```
Redirects to `/unauthorized` if wrong role

---

## 📱 Available Pages

| Route | Page | Auth Required | Role Required |
|-------|------|---------------|---------------|
| `/login` | Login | No | - |
| `/register` | Register | No | - |
| `/dashboard` | Dashboard | Yes | Any |
| `/medicines/*` | Medicines | Yes | Any |
| `/batches/*` | Batches | Yes | Any |
| `/purchases/*` | Purchases | Yes | Any |
| `/sales/*` | Sales | Yes | Any |
| `/reports/*` | Reports | Yes | admin, pharmacist |
| `/ai` | AI Assistant | Yes | Any |
| `/profile` | Profile | Yes | Any |
| `/unauthorized` | Access Denied | No | - |
| `/404` | Not Found | No | - |

---

## 🐛 Debugging

### Browser DevTools

**Network Tab**:
- Check API requests/responses
- Verify Authorization header present
- Check response status codes

**Application Tab**:
- View localStorage
- Check if token is stored
- Clear storage to logout manually

**Console Tab**:
- Watch for errors
- Check API error messages
- Debug component state

### Common Issues

**Token Not Persisting**
```javascript
// In DevTools Console
localStorage.getItem('token') // Should return token
localStorage.getItem('user')  // Should return user object
```

**API Requests Failing**
```javascript
// Check API URL
process.env.REACT_APP_API_URL // Should be http://localhost:5000/api/v1
```

**Routes Not Working**
- Verify backend server is running
- Check CORS configuration
- Verify token is valid

---

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm install -g serve
serve -s build
```
Opens at `http://localhost:3000`

### Environment for Production
Update `.env` with production API URL:
```
REACT_APP_API_URL=https://api.pharmacy.com/api/v1
REACT_APP_ENVIRONMENT=production
```

### Deploy to Hosting
Popular options:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `build` folder
- **GitHub Pages**: Follow GitHub Pages guide
- **AWS S3**: Upload `build` folder to S3

---

## 🔧 Available Scripts

```bash
npm start       # Start development server (port 3000)
npm run build   # Create production build
npm test        # Run test suite
npm run eject   # Eject from Create React App (⚠️ irreversible)
```

---

## 📚 File Organization Tips

### Adding a New Feature

1. **Create service** in `src/services/newService.js`
2. **Create page** in `src/pages/NewFeature.jsx`
3. **Add route** in `App.jsx`
4. **Use useApi hook** in page to fetch data
5. **Add components** as needed in `src/components/`

### Example: New Medicine Management
```
1. services/medicineService.js already exists ✓
2. Create pages/Medicines.jsx
3. Add route: <Route path="/medicines" element={<Medicines />} />
4. In Medicines.jsx:
   - Use useApi to fetch medicines
   - Create form for new medicine
   - Use medicineService methods
```

---

## 🚨 Error Handling

### API Errors
Automatically caught and stored in error state:
```javascript
const { error } = useApi(medicineService.getMedicines);
if (error) {
  return <ErrorAlert message={error} />;
}
```

### 401 Unauthorized
Automatically triggers logout and redirect to login

### Form Validation
Check form data before submitting:
```javascript
const [error, setError] = useState(null);

const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!formData.email || !formData.password) {
    setError('All fields required');
    return;
  }
  
  // Submit form
};
```

---

## 💡 Best Practices

✅ **DO**:
- Use hooks in functional components
- Keep components small and focused
- Use service layer for API calls
- Handle loading and error states
- Protect sensitive routes with ProtectedRoute

❌ **DON'T**:
- Direct API calls in components
- Store sensitive data in localStorage (only token)
- Ignore loading states
- Make API calls directly in render
- Use string literals for route paths

---

## 📞 Support

### Common Questions

**Q: Where do I add styling?**
A: Add styles in component CSS files or `index.css` for globals

**Q: How do I add new API calls?**
A: Add method to corresponding service file

**Q: How do I protect a route?**
A: Wrap component in `<ProtectedRoute>`

**Q: How do I handle errors?**
A: Use `useApi` hook's error state or try-catch with services

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure .env.local
3. ✅ Start backend server (`npm run dev` in parent dir)
4. ✅ Start frontend (`npm start`)
5. ⏭️ Add UI styling
6. ⏭️ Implement form validation
7. ⏭️ Add data tables
8. ⏭️ Add charts for reports
9. ⏭️ Write tests
10. ⏭️ Deploy

---

**Ready to start?** Run `npm start` and open http://localhost:3000

For detailed architecture, see [FRONTEND_STRUCTURE.md](FRONTEND_STRUCTURE.md)
