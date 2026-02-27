# React Frontend - Project Structure Guide

## Overview

Complete React project structure for the Cloud-based Pharmacy Inventory System frontend. This guide explains the organization and patterns used.

---

## Directory Organization

### `/public`
Static assets served directly by web server
- `index.html` - Main HTML entry point

### `/src`
All application source code

#### `/src/components`
Reusable UI components (non-page components)

| File | Purpose |
|------|---------|
| `ProtectedRoute.jsx` | Route wrapper for authentication & authorization |
| `Sidebar.jsx` | Navigation menu (role-aware) |
| `Header.jsx` | Top navigation with user info |
| `LoadingSpinner.jsx` | Loading indicator component |
| `ErrorAlert.jsx` | Error message display |
| `SuccessAlert.jsx` | Success message display |

**Guidelines**:
- Components are functional and use hooks
- Props-based configuration
- Self-contained styling
- Reusable across pages

#### `/src/pages`
Full-page components (route handlers)

| File | Route | Purpose |
|------|-------|---------|
| `Login.jsx` | `/login` | User login form |
| `Register.jsx` | `/register` | New user registration |
| `Dashboard.jsx` | `/dashboard` | Main landing page |
| `Medicines.jsx` | `/medicines/*` | Medicine management CRUD |
| `Batches.jsx` | `/batches/*` | Batch tracking & filtering |
| `Purchases.jsx` | `/purchases/*` | Purchase order management |
| `Sales.jsx` | `/sales/*` | Sales transaction recording |
| `Reports.jsx` | `/reports/*` | Analytics & reporting (admin/pharmacist only) |
| `AIAssistant.jsx` | `/ai` | Natural language query interface |
| `Profile.jsx` | `/profile` | User profile management |
| `NotFound.jsx` | `/404` | 404 error page |
| `Unauthorized.jsx` | `/unauthorized` | 403 access denied page |

**Guidelines**:
- Each page is a complete route
- Can use multiple components
- Handles page-level state and routing

#### `/src/services`
API communication layer (abstraction)

| File | Purpose |
|------|---------|
| `api.js` | Axios instance with interceptors |
| `authService.js` | Authentication endpoint calls |
| `medicineService.js` | Medicine API calls |
| `batchService.js` | Batch API calls |
| `purchaseService.js` | Purchase API calls |
| `saleService.js` | Sales API calls |
| `reportService.js` | Reports API calls |
| `aiService.js` | AI assistant API calls |

**Guidelines**:
- Each service represents one API module
- Methods match backend endpoint structure
- Handle success/error responses
- Used by components via hooks

#### `/src/context`
Global state management using React Context

| File | Purpose |
|------|---------|
| `AuthContext.jsx` | Auth context definition & hook |
| `AuthProvider.jsx` | Auth state provider component |

**Auth Context provides**:
```javascript
{
  user,              // { id, email, name, role }
  token,             // JWT token
  isAuthenticated,   // boolean
  loading,           // boolean (during auth ops)
  error,             // string or null
  login,             // function
  register,          // function
  logout,            // function
  updateProfile,     // function
  clearError         // function
}
```

#### `/src/hooks`
Custom React hooks

| File | Purpose |
|------|---------|
| `useAuth.js` | Access auth context |
| `useApi.js` | Manage API call state (loading, error, data) |

**useAuth**:
```javascript
// Usage in any component
const { user, login, logout } = useAuth();
```

**useApi**:
```javascript
// Usage for any API call
const { loading, error, data, execute } = useApi(medicineService.getMedicines);
useEffect(() => {
  execute(); // Call with optional args
}, [execute]);
```

#### Root Files
- `App.jsx` - Main app component with routing setup
- `App.css` - App component styles
- `index.js` - React entry point
- `index.css` - Global styles

---

## Data Flow Architecture

```
User Actions (Click, Submit)
        ↓
Component (State Management via useAuth/useApi)
        ↓
Service Layer (API methods)
        ↓
Axios Client (Request/Response Interceptors)
        ↓
Backend API (Express server)
        ↓
Response
        ↓
Component State Update
        ↓
Re-render with Data
```

---

## Authentication Flow

```
1. User submits login form
   ↓
2. Component calls authService.login(email, password)
   ↓
3. Axios sends POST /auth/login
   ↓
4. Backend validates and returns JWT token
   ↓
5. AuthProvider stores token in localStorage & context
   ↓
6. Axios interceptor auto-adds token to future requests
   ↓
7. Protected routes now accessible
   ↓
8. On 401 response: logout and redirect to login
```

---

## Routing Map

### Public Routes (No Auth Required)
```
/login           → Login page
/register        → Register page
```

### Protected Routes (Auth Required)
```
/                → Redirect to /dashboard
/dashboard       → Dashboard page
/medicines/*     → Medicines management
/batches/*       → Batch tracking
/purchases/*     → Purchase orders
/sales/*         → Sales transactions
/profile         → User profile
/ai              → AI assistant
```

### Role-Based Routes (Specific Auth Required)
```
/reports/*       → Reports (admin, pharmacist only)
                   Redirects to /unauthorized if wrong role
```

### Error Routes
```
/unauthorized    → Access denied (403)
/404             → Not found
/*               → Catch-all → NotFound page
```

---

## Component Usage Patterns

### Using useAuth in A Component
```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Please login</p>;
  }

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using useApi for Data Fetching
```javascript
import { useApi } from '../hooks/useApi';
import medicineService from '../services/medicineService';
import { useEffect } from 'react';

function MedicinesList() {
  const { loading, error, data, execute } = useApi(medicineService.getMedicines);

  useEffect(() => {
    execute(); // Fetch medicines on mount
  }, [execute]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {data?.map(medicine => (
        <li key={medicine._id}>{medicine.name}</li>
      ))}
    </ul>
  );
}
```

### Protected Route Usage
```javascript
// In App.jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// With role protection
<ProtectedRoute requiredRoles={['admin', 'pharmacist']}>
  <AdminPanel />
</ProtectedRoute>
```

---

## Service Layer Examples

### Making an API Call
```javascript
// In a component
import medicineService from '../services/medicineService';

const medicines = await medicineService.getMedicines({ category: 'antibiotics' });
```

### Service Implementation Pattern
```javascript
// In medicineService.js
const medicineService = {
  getMedicines: (filters) => {
    return apiClient.get('/medicines', { params: filters });
  },

  createMedicine: (data) => {
    return apiClient.post('/medicines', data);
  }
};
```

---

## API Integration Checklist

### Before Making Requests
- ✅ Axios client created in `api.js`
- ✅ Request interceptor adds JWT token
- ✅ Response interceptor handles 401 errors  
- ✅ Service methods abstract endpoints
- ✅ Components use useApi hook

### Error Handling
- ✅ Network errors caught
- ✅ API errors passed to components
- ✅ 401 triggers auto-logout
- ✅ User sees error messages

### Token Management
- ✅ Token stored in localStorage
- ✅ Token set in auth context
- ✅ Token added to request headers
- ✅ Token cleared on logout

---

## File Naming Conventions

| Type | Naming | Example |
|------|--------|---------|
| Components | PascalCase | `MedicinesList.jsx` |
| Pages | PascalCase | `Dashboard.jsx` |
| Services | camelCase | `medicineService.js` |
| Hooks | camelCase with 'use' prefix | `useApi.js` |
| Utilities | camelCase | `helpers.js` |
| CSS | camelCase or kebab-case | `app.css` or `App.css` |

---

## Development Tips

### Adding New Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Create corresponding service if needed

### Adding New Service
1. Create `src/services/newService.js`
2. Export methods matching API endpoints
3. Use in components via useApi hook

### Adding New Component
1. Create `src/components/NewComponent.jsx`
2. Use in pages as needed
3. Keep reusable and configurable

### Testing API Calls
1. Use browser DevTools Network tab
2. Check localStorage for token
3. Verify Authorization headers
4. Check response status and data

---

## Environment Configuration

### .env.local (Local Development)
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_ENVIRONMENT=development
```

### .env.production (Production Build)
```
REACT_APP_API_URL=https://api.pharmacy.com/api/v1
REACT_APP_ENVIRONMENT=production
```

---

## Performance Considerations

1. **Lazy Loading**: Future - implement React.lazy() for pages
2. **Memoization**: Use React.memo() for expensive components
3. **API Caching**: Consider caching API responses in context
4. **Code Splitting**: Bundle splitting via React Router
5. **Image Optimization**: Compress and optimize images

---

## Security Best Practices

1. ✅ JWT tokens stored securely (localStorage with HTTPS in production)
2. ✅ Token auto-included in requests via interceptor
3. ✅ 401 responses trigger logout
4. ✅ Protected routes check authentication
5. ✅ Role-based access control for sensitive pages
6. ✅ CORS configured on backend
7. ✅ XSS protection via React's built-in escaping

---

## Deployment Checklist

- [ ] Update `.env` with production API URL
- [ ] Run `npm run build`
- [ ] Verify built files in `/build`
- [ ] Test login/auth flow in production
- [ ] Verify API calls work with production backend
- [ ] Check console for errors
- [ ] Test on different browsers
- [ ] Deploy to hosting platform

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Token not persisting | Check localStorage in DevTools |
| 401 errors on all requests | Verify backend API URL |
| Components not updating | Check useEffect dependencies |
| Routing not working | Ensure BrowserRouter wraps app |
| CORS errors | Configure backend CORS settings |
| Services not found | Check import paths |

---

## Next Implementation Steps

1. **UI Styling** - Add CSS/Tailwind styling
2. **Form Validation** - Add form validation libraries
3. **Data Tables** - Add table library for data display
4. **Charts** - Add charting library for reports
5. **Notifications** - Add toast/notification library
6. **Tests** - Add Jest and React Testing Library tests
7. **State Management** - Consider Redux for complex state
8. **PWA** - Add progressive web app features

---

**Last Updated**: February 25, 2026  
**React Version**: 18.2.0  
**Node Minimum**: 16.x
