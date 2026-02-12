# RouteLogic Frontend

Smart trotro transit platform for Ghana - Passenger and Driver interfaces.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- No API keys required! (Using free OpenStreetMap)

### Installation

```bash
# Navigate to project directory
cd routelogic-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Setup

Edit `.env` and add your backend URL:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Note:** No API keys needed! We're using free OpenStreetMap via Leaflet.

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── components/
│   ├── shared/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Button.jsx
│   │   └── Card.jsx
│   └── passenger/       # Passenger-specific components
│       └── SearchRoute.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── PassengerDashboard.jsx
│   ├── LiveTracking.jsx
│   ├── BookingConfirmation.jsx
│   ├── DriverDashboard.jsx
│   └── ActiveTrip.jsx
├── App.jsx              # Router setup
├── main.jsx             # Entry point
└── index.css            # Global styles + Tailwind
```

---

## 🎨 Design System

### Colors
- **Primary**: `#0066FF` (Blue)
- **Secondary**: `#00C853` (Green)
- **Danger**: `#FF3B30` (Red)
- **Warning**: `#FFA500` (Orange)

### Components
Use the pre-built component classes:

```jsx
// Buttons
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>

// Cards
<div className="card">Card content</div>

// Inputs
<input className="input-field" />
```

---

## 🔄 User Flows

### Passenger Flow
1. **Landing Page** → Click "Find a Ride"
2. **Register/Login** → Create account or login
3. **Dashboard** → Search route (pickup → destination)
4. **Live Tracking** → See trotro on map, book seat
5. **Confirmation** → Booking confirmed

### Driver Flow
1. **Landing Page** → Click "Drive with Us"
2. **Register/Login** → Create driver account
3. **Dashboard** → Select route, set seats, start trip
4. **Active Trip** → Accept bookings, broadcast location
5. **Stop Trip** → End trip, calculate revenue

---

## 🔌 API Integration

### Authentication
```javascript
// Login
POST /api/auth/login
Body: { email, password, role }

// Register
POST /api/auth/register
Body: { name, email, phone, password, role }
```

### Passenger Endpoints
```javascript
// Search routes
POST /api/search-route
Body: { pickup, destination }

// Get trotro location
GET /api/trotro-location/:trotroId

// Book seat
POST /api/book-seat
Body: { passengerId, trotroId, pickupStop, dropoffStop }
```

### Driver Endpoints
```javascript
// Get routes
GET /api/routes

// Start trip
POST /api/driver/start-trip
Body: { driverId, routeId, availableSeats }

// Update location
PUT /api/driver/update-location
Body: { trotroId, lat, lng }

// Get bookings
GET /api/driver/bookings?driverId=X

// Accept booking
PUT /api/driver/accept-booking/:bookingId

// Stop trip
POST /api/driver/stop-trip
Body: { trotroId }
```

---

## 🗺️ Leaflet Maps Integration

The `LiveTracking` page uses **Leaflet** with **OpenStreetMap** (100% free, no API key needed):

```jsx
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'

<MapContainer center={location} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Polyline positions={routeCoordinates} />
  <Marker position={trotroLocation} />
</MapContainer>
```

**Benefits:**
- ✅ No API key required
- ✅ No billing/credit card needed
- ✅ Unlimited requests
- ✅ Open source

---

## 🔴 Real-time Updates (Socket.io)

Location updates are broadcast every 10 seconds:

```javascript
// Client subscribes to trotro updates
socket.emit('subscribe-trotro', { trotroId })

// Receive location updates
socket.on(`trotro-${trotroId}-location`, (data) => {
  setTrotroLocation({ lat: data.lat, lng: data.lng })
})
```

---

## 📱 Mobile Responsiveness

All pages are mobile-responsive using Tailwind's responsive classes:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

---

## 🚧 Development Tips

### Adding New Pages
1. Create page in `src/pages/`
2. Add route in `src/App.jsx`
3. Link from navigation

### Styling
- Use Tailwind utility classes
- Follow design system colors
- Use component classes (`btn-primary`, `card`, etc.)

### API Calls
- Always include JWT token in headers
- Handle errors gracefully
- Show loading states

---

## 🏗️ Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages

---

## 🐛 Troubleshooting

### PowerShell Execution Policy Error
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Map Not Loading
- Check browser console for errors
- Ensure Leaflet CSS is imported in `index.css`
- Clear browser cache and reload

### Socket.io Connection Failed
- Ensure backend is running on `http://localhost:5000`
- Check CORS settings on backend

---

## 📝 Next Steps

- [ ] Install dependencies (`npm install`)
- [ ] Connect to backend API
- [ ] Test passenger booking flow
- [ ] Test driver trip management
- [ ] Deploy to Vercel/Netlify

---

## 🤝 Team Collaboration

**Frontend Developer**: Owns all UI/UX  
**Backend Developer**: Provides API endpoints and Socket.io server

**Integration Point**: Share the data contract (see `data-contract.md`)

---

## 📄 License

MIT License - Hackathon Project
