# Condo Water Bill Manager

A comprehensive web application for managing and tracking monthly water usage for condo rooms with authentication, CSV import/export, inline editing, and interactive dashboards.

## Features

### 🔐 Authentication
- Email/password authentication using Better Auth
- Protected routes for dashboard and admin panel
- Secure session management with bearer tokens

### 📊 Dashboard
- Summary cards showing total water usage and bills
- Interactive charts visualizing usage trends
- Monthly statistics and analytics
- Quick navigation to admin panel

### 🛠️ Admin Panel
- **CSV Import**: Bulk import water readings from CSV files
- **Inline Editing**: Edit readings directly in the table
- **Auto-calculation**: Usage and total price calculated automatically
- **Monthly Rollover**: Move to next month with one click (thisMonth → lastMonth)
- **CSV Export**: Export current month's data
- **Print View**: Print-friendly table layout

### 📋 Data Management
- View all water readings for the current month
- Edit readings with automatic recalculation
- Track room numbers and owner names
- Configurable price per unit

## Getting Started

### 1. Register an Account
1. Visit `/register`
2. Enter your name, email, and password
3. Click "Register"

### 2. Login
1. Visit `/login`
2. Enter your credentials
3. Access the dashboard

### 3. View Dashboard
- See summary statistics for the current month
- View total water usage and billing
- Access charts and analytics

### 4. Admin Panel
Navigate to the admin panel to:
- Import water readings via CSV
- Edit readings inline
- Export data
- Rollover to next month

## CSV Import Format

Your CSV file should have the following columns:
```csv
roomNumber,lastMonth,thisMonth,pricePerUnit
101,150,180,5
102,200,235,5
```

**Column Descriptions:**
- `roomNumber`: Room identifier (must match existing rooms)
- `lastMonth`: Previous month's meter reading
- `thisMonth`: Current month's meter reading
- `pricePerUnit`: Price per cubic meter (optional, defaults to 5)

**Sample CSV file available at:** `/sample-water-readings.csv`

## Monthly Workflow

1. **Start of Month**: Click "Next Month" to rollover readings
2. **Import Data**: Upload CSV with new meter readings
3. **Review & Edit**: Check readings and make corrections inline
4. **Export**: Download CSV for records
5. **Print**: Generate print-friendly report

## Keyboard Shortcuts

- **Enter**: Save inline edit
- **Escape**: Cancel inline edit
- **Ctrl/Cmd + P**: Print page

## API Endpoints

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create a room
- `PUT /api/rooms?id=[id]` - Update a room
- `DELETE /api/rooms?id=[id]` - Delete a room

### Water Readings
- `GET /api/water-readings?month=YYYY-MM` - Get readings for a month
- `POST /api/water-readings` - Create/update a reading
- `PUT /api/water-readings?id=[id]` - Update a reading
- `DELETE /api/water-readings?id=[id]` - Delete a reading

### Special Endpoints
- `POST /api/water-readings/rollover?fromMonth=YYYY-MM&toMonth=YYYY-MM` - Rollover to next month
- `GET /api/water-readings/summary?month=YYYY-MM` - Get summary statistics

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Turso (SQLite)
- **ORM**: Drizzle
- **Authentication**: Better Auth
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **CSV Processing**: PapaParse

## Database Schema

### Users
- Authentication via Better Auth
- Support for is_admin flag

### Rooms
- id, roomNumber, ownerName, createdAt

### Water Readings
- id, roomId, month, lastMonth, thisMonth
- usage (auto-calculated)
- pricePerUnit, totalPrice (auto-calculated)
- createdAt, updatedAt

## Support

For issues or questions, please contact your system administrator.

## Security Notes

- All API routes are protected with authentication
- Bearer tokens stored securely in localStorage
- Input validation on all forms
- SQL injection protection via Drizzle ORM

---

**Version**: 1.0.0  
**Last Updated**: 2025
