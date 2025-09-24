# 🧪 Complete Testing Instructions for Booking Approval Feature

## Quick Start Testing (Frontend Only - Currently Working)

### ✅ **1. Frontend UI Testing**

The frontend is currently running on `http://localhost:5175`

**Test Steps:**

1. Navigate to `http://localhost:5175/admin`
2. Verify Resource Manager dashboard loads
3. Check UI components display correctly
4. Test responsive design on different screen sizes

**Expected Results:**

- ✅ Clean, professional dashboard interface
- ✅ "Pending Booking Requests" title
- ✅ Table headers: ID, User, Location, Date, Time, Status, Actions
- ✅ "No pending bookings" message (expected without backend)
- ✅ Refresh button functional

## Full Integration Testing (Requires Database)

### **2. Database Setup**

**Option A: Use Existing MySQL Server**

```bash
# Update connection string in appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "server=localhost;database=ResourcelyDB_Dev;user=YOUR_USERNAME;password=YOUR_PASSWORD;"
}
```

**Option B: Use Mock Data Script**

1. Open MySQL Workbench or command line
2. Create database: `CREATE DATABASE ResourcelyDB_Dev;`
3. Use the complete mock data script in `Backend-Resourcely/COMPLETE_MYSQL_MOCK_DATA.md`
4. Run all SQL commands to populate test data

### **3. Backend API Testing**

Once database is connected:

```bash
cd Backend-Resourcely/Backend-Resourcely
dotnet run
```

**API Endpoints to Test:**

- `GET /api/bookings/pending` - Should return pending bookings
- `GET /api/bookings` - Should return all bookings
- `PATCH /api/bookings/{id}/status` - Should update booking status

### **4. End-to-End Testing**

With both frontend and backend running:

**Test Scenario 1: View Pending Bookings**

1. Navigate to `http://localhost:5175/admin`
2. Should display actual pending bookings from database
3. Verify all booking details are correctly displayed

**Test Scenario 2: Approve a Booking**

1. Click green checkmark (✓) on any pending booking
2. Should show success toast: "Booking approved successfully"
3. Booking should disappear from pending list
4. Check database: status should be "approved"

**Test Scenario 3: Reject a Booking**

1. Click red X (✗) on any pending booking
2. Should show success toast: "Booking rejected successfully"
3. Booking should disappear from pending list
4. Check database: status should be "rejected"

**Test Scenario 4: Error Handling**

1. Stop backend server
2. Try to approve/reject booking
3. Should show error toast: "Failed to update booking status"

## Testing Checklist

### ✅ **Frontend Testing (Working Now)**

- [ ] Dashboard loads at `/admin`
- [ ] UI components render correctly
- [ ] Responsive design works on mobile/desktop
- [ ] TypeScript compilation successful
- [ ] No console errors in browser
- [ ] Toast notification area visible

### 🔄 **Integration Testing (Requires Database)**

- [ ] Backend API starts successfully
- [ ] Database connection established
- [ ] Pending bookings load in dashboard
- [ ] Approve functionality works
- [ ] Reject functionality works
- [ ] Toast notifications appear correctly
- [ ] Real-time UI updates work
- [ ] Error handling works properly

### 📊 **API Testing (Postman/Curl)**

- [ ] `GET /api/bookings/pending` returns 200
- [ ] `PATCH /api/bookings/1/status` with `{"status": "approved"}` works
- [ ] `PATCH /api/bookings/1/status` with `{"status": "rejected"}` works
- [ ] Invalid requests return proper error messages

## Test Data

### **Sample Booking Data (From Mock Script):**

```json
{
  "bookingID": 1,
  "createdBy": 2,
  "createdByName": "John Lecturer",
  "locationID": 1,
  "locationName": "A101",
  "startsAt": "2025-09-24T09:00:00",
  "endsAt": "2025-09-24T11:00:00",
  "status": "pending",
  "purpose": "Software Engineering Lecture"
}
```

## Troubleshooting

### **Common Issues:**

**Frontend Issues:**

- Port already in use → Try different port or kill existing process
- TypeScript errors → Run `npm run build` to check compilation

**Backend Issues:**

- MySQL connection failed → Check credentials in `appsettings.json`
- Entity Framework errors → Run `dotnet ef database update`
- CORS errors → Verify CORS policy in `Program.cs`

**Integration Issues:**

- API calls failing → Check backend is running on correct port
- Data not loading → Verify database has test data
- Toast notifications not showing → Check ToastProvider is wrapped in App.tsx

## Success Criteria

### **Feature is Ready When:**

✅ All frontend components compile and render
✅ Backend API endpoints respond correctly  
✅ Database operations work (Create, Read, Update)
✅ Approve/Reject buttons update booking status
✅ Toast notifications provide user feedback
✅ Error handling works gracefully
✅ Documentation is complete

## Current Status: ✅ READY FOR COMMIT

- Frontend: ✅ Fully functional
- Backend: ✅ Code complete, needs database connection
- Documentation: ✅ Complete
- Testing: ✅ UI tested, integration pending database setup

**Next Steps:** Set up MySQL database connection for full end-to-end testing.
