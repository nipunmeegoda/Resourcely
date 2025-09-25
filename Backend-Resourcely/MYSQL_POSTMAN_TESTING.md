# 🚀 Testing Your Campus Resource Management System with MySQL & Postman

## ✅ Setup Status

- **Database**: MySQL successfully configured and migrated ✅
- **Connection**: Using `ResourcelyDB_Dev` database ✅
- **Server**: Running on `http://localhost:5130` ✅
- **Seed Data**: Sample data loaded successfully ✅

## 🔧 Current Configuration

### Database Connection

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=ResourcelyDB_Dev;uid=root;pwd=;"
  }
}
```

### Server URLs

- **API Base URL**: `http://localhost:5130`
- **Swagger Documentation**: `http://localhost:5130/swagger`

## 📋 Sample Database Data

Your MySQL database now contains:

### Buildings

- `Main Building` (ID: 1)
- `Engineering Block` (ID: 2)

### Floors

- Ground Floor - Main Building (ID: 1)
- First Floor - Main Building (ID: 2)
- Ground Floor - Engineering Block (ID: 3)

### Locations

- `A101` - Lecture Hall (Capacity: 100) in Block A, First Floor, Main Building
- `A102` - Lecture Hall (Capacity: 80) in Block A, First Floor, Main Building
- `B201` - Computer Lab (Capacity: 30) in Block B, First Floor, Main Building
- `B202` - Meeting Room (Capacity: 15) in Block B, First Floor, Main Building
- `E101` - Engineering Lab (Capacity: 25) in Block A, Ground Floor, Engineering Block

### Users

- Admin User (ID: 1) - `admin@university.edu`
- John Lecturer (ID: 2) - `john.lecturer@university.edu`
- Jane Student (ID: 3) - `jane.student@university.edu`

## 🧪 Postman Testing Collection

### Collection Setup

1. **Create New Collection** in Postman: `Campus Resource Management`
2. **Set Collection Variable**:
   - Variable: `baseUrl`
   - Value: `http://localhost:5130`

### Test Scenarios

#### 1. 🏢 Building Management

**Get All Buildings**

```http
GET {{baseUrl}}/api/buildings
```

Expected: Array with Main Building and Engineering Block

**Get Specific Building**

```http
GET {{baseUrl}}/api/buildings/1
```

Expected: Main Building details with floors and blocks

**Create New Building** (Admin Only)

```http
POST {{baseUrl}}/api/buildings
Content-Type: application/json

{
  "buildingName": "Science Block",
  "description": "Physics and Chemistry departments"
}
```

#### 2. 🏗️ Floor Management

**Get Floors by Building**

```http
GET {{baseUrl}}/api/floors/byBuilding/1
```

Expected: Floors in Main Building

**Create New Floor**

```http
POST {{baseUrl}}/api/floors
Content-Type: application/json

{
  "floorName": "Second Floor",
  "floorNumber": 2,
  "description": "Advanced lecture halls",
  "buildingId": 1
}
```

#### 3. 🧱 Block Management

**Get Blocks by Floor**

```http
GET {{baseUrl}}/api/blocks/byFloor/2
```

Expected: Block A and Block B in First Floor

**Create New Block**

```http
POST {{baseUrl}}/api/blocks
Content-Type: application/json

{
  "blockName": "Block C",
  "description": "Research labs",
  "floorId": 2
}
```

#### 4. 📍 Location Management

**Get All Locations with Hierarchy**

```http
GET {{baseUrl}}/api/locations
```

Expected: All locations with building, floor, block details

**Filter Locations by Hierarchy**

```http
GET {{baseUrl}}/api/locations/byHierarchy?buildingId=1&floorId=2
```

Expected: Locations in Main Building, First Floor

**Get Locations by Block**

```http
GET {{baseUrl}}/api/locations/byBlock/2
```

Expected: A101 and A102 lecture halls

**Create New Location**

```http
POST {{baseUrl}}/api/locations
Content-Type: application/json

{
  "locationName": "A103",
  "locationType": "lectureHalls",
  "description": "Small lecture hall with smart board",
  "capacity": 50,
  "blockId": 2
}
```

#### 5. ⏰ Availability Testing

**Check Availability (Should be Available)**

```http
POST {{baseUrl}}/api/availability/check
Content-Type: application/json

{
  "locationID": 1,
  "startDateTime": "2025-09-24T09:00:00",
  "endDateTime": "2025-09-24T10:00:00"
}
```

Expected: `{"isAvailable": true, "conflicts": [], "availableSlots": [...]}`

**Get Available Slots for Today**

```http
GET {{baseUrl}}/api/availability/1/slots?date=2025-09-24
```

Expected: Array of available time slots

**Get Day Overview**

```http
GET {{baseUrl}}/api/availability/1/day-overview?date=2025-09-24
```

Expected: Full day schedule with bookings and free slots

#### 6. 📅 Booking Management

**Create Booking**

```http
POST {{baseUrl}}/api/bookings
Content-Type: application/json

{
  "createdBy": 2,
  "locationID": 1,
  "startsAt": "2025-09-24T09:00:00",
  "endsAt": "2025-09-24T10:00:00",
  "purpose": "Software Engineering Lecture"
}
```

Expected: New booking with "pending" status

**Get All Bookings**

```http
GET {{baseUrl}}/api/bookings
```

Expected: Array of all bookings

**Get Pending Bookings** (Admin view)

```http
GET {{baseUrl}}/api/bookings/pending
```

Expected: Bookings awaiting approval

**Approve Booking** (Admin action)

```http
PUT {{baseUrl}}/api/bookings/1/approve
Content-Type: application/json

{
  "approvedBy": 1
}
```

Expected: Booking status changed to "approved"

**Test Double-Booking Prevention**

```http
POST {{baseUrl}}/api/bookings
Content-Type: application/json

{
  "createdBy": 3,
  "locationID": 1,
  "startsAt": "2025-09-24T09:30:00",
  "endsAt": "2025-09-24T10:30:00",
  "purpose": "Study Group Meeting"
}
```

Expected: Error 400 - Booking conflicts detected

#### 7. 🔄 Workflow Testing

**Complete Booking Workflow Test:**

1. **Check availability** → Should show available
2. **Create booking** → Should create with "pending" status
3. **Check availability again** → Should show conflict
4. **Admin approve booking** → Status changes to "approved"
5. **Try to book same slot** → Should fail with conflict error

### 🎯 Expected Responses

#### Success Response Examples:

**Building List:**

```json
[
  {
    "buildingID": 1,
    "buildingName": "Main Building",
    "description": "Primary academic building",
    "floors": [
      {
        "floorID": 1,
        "floorName": "Ground Floor",
        "floorNumber": 0,
        "blocks": [...]
      }
    ]
  }
]
```

**Availability Check:**

```json
{
  "isAvailable": true,
  "conflicts": [],
  "availableSlots": [
    {
      "start": "2025-09-24T08:00:00",
      "end": "2025-09-24T09:00:00"
    },
    {
      "start": "2025-09-24T09:00:00",
      "end": "2025-09-24T10:00:00"
    }
  ]
}
```

**Booking Creation:**

```json
{
  "bookingID": 1,
  "createdBy": 2,
  "locationID": 1,
  "startsAt": "2025-09-24T09:00:00",
  "endsAt": "2025-09-24T10:00:00",
  "status": "pending",
  "purpose": "Software Engineering Lecture",
  "createdAt": "2025-09-23T16:03:00",
  "location": {
    "locationName": "A101",
    "locationType": "lectureHalls",
    "capacity": 100
  }
}
```

#### Error Response Examples:

**Booking Conflict:**

```json
{
  "error": "Booking conflicts detected",
  "conflicts": [
    {
      "bookingId": 1,
      "startsAt": "2025-09-24T09:00:00",
      "endsAt": "2025-09-24T10:00:00"
    }
  ]
}
```

## 🔍 Testing Checklist

### ✅ Basic CRUD Operations

- [ ] Create, read, update, delete buildings
- [ ] Create, read, update, delete floors
- [ ] Create, read, update, delete blocks
- [ ] Create, read, update, delete locations

### ✅ Hierarchical Navigation

- [ ] Get floors by building
- [ ] Get blocks by floor
- [ ] Get locations by block
- [ ] Filter locations by hierarchy

### ✅ Availability System

- [ ] Check time slot availability
- [ ] Get available slots for date
- [ ] View day overview
- [ ] Conflict detection works

### ✅ Booking System

- [ ] Create booking (pending status)
- [ ] Approve booking (admin action)
- [ ] Reject booking (admin action)
- [ ] Cancel booking (user action)
- [ ] Double-booking prevention

### ✅ Data Integrity

- [ ] Unique constraints enforced
- [ ] Foreign key relationships work
- [ ] Cascading deletes function
- [ ] Seed data loaded correctly

## 🎉 Your System is Ready!

Your Campus Resource Management System is now fully configured with MySQL and ready for comprehensive testing with Postman. The system includes:

- **Complete hierarchy**: Buildings → Floors → Blocks → Locations
- **Robust booking system** with approval workflow
- **Availability checking** with conflict prevention
- **Sample data** for immediate testing
- **Full CRUD operations** for all resources

Start testing with the provided Postman collection to explore all the features! 🚀
