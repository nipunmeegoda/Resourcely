# Postman API Testing Guide

## 🚀 Quick Setup

### Step 1: Download and Install Postman

- Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
- Create a free account (optional but recommended)

### Step 2: Set Up Environment

1. **Create New Environment** in Postman
2. **Name it**: "Resourcely Local"
3. **Add Variables**:
   - `baseUrl`: `https://localhost:5001/api`
   - `baseUrlHttp`: `http://localhost:5000/api`

### Step 3: Import Collection (JSON Format)

Save this JSON as `Resourcely_API_Collection.json` and import it into Postman:

```json
{
  "info": {
    "name": "Resourcely Campus Resource Management API",
    "description": "Complete API testing collection for the campus resource management system",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://localhost:5001/api"
    }
  ],
  "item": [
    {
      "name": "Buildings Management",
      "item": [
        {
          "name": "Get All Buildings",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/buildings",
              "host": ["{{baseUrl}}"],
              "path": ["buildings"]
            }
          }
        },
        {
          "name": "Get Building by ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/buildings/1",
              "host": ["{{baseUrl}}"],
              "path": ["buildings", "1"]
            }
          }
        },
        {
          "name": "Create New Building",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"buildingName\": \"Science Complex\",\n  \"buildingCode\": \"SC\",\n  \"address\": \"456 University Ave\",\n  \"description\": \"Modern science building with labs and lecture halls\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/buildings",
              "host": ["{{baseUrl}}"],
              "path": ["buildings"]
            }
          }
        },
        {
          "name": "Update Building",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"buildingID\": 1,\n  \"buildingName\": \"Main Academic Building\",\n  \"buildingCode\": \"MAB\",\n  \"address\": \"123 University Ave\",\n  \"description\": \"Updated main building description\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/buildings/1",
              "host": ["{{baseUrl}}"],
              "path": ["buildings", "1"]
            }
          }
        },
        {
          "name": "Delete Building",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/buildings/3",
              "host": ["{{baseUrl}}"],
              "path": ["buildings", "3"]
            }
          }
        }
      ]
    },
    {
      "name": "Floors Management",
      "item": [
        {
          "name": "Get All Floors",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/floors",
              "host": ["{{baseUrl}}"],
              "path": ["floors"]
            }
          }
        },
        {
          "name": "Get Floors by Building",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/floors/byBuilding/1",
              "host": ["{{baseUrl}}"],
              "path": ["floors", "byBuilding", "1"]
            }
          }
        },
        {
          "name": "Create New Floor",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"floorName\": \"Third Floor\",\n  \"floorNumber\": 3,\n  \"buildingID\": 1,\n  \"description\": \"Administrative offices floor\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/floors",
              "host": ["{{baseUrl}}"],
              "path": ["floors"]
            }
          }
        }
      ]
    },
    {
      "name": "Blocks Management",
      "item": [
        {
          "name": "Get All Blocks",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/blocks",
              "host": ["{{baseUrl}}"],
              "path": ["blocks"]
            }
          }
        },
        {
          "name": "Get Blocks by Floor",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/blocks/byFloor/1",
              "host": ["{{baseUrl}}"],
              "path": ["blocks", "byFloor", "1"]
            }
          }
        },
        {
          "name": "Create New Block",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"blockName\": \"Block C\",\n  \"floorID\": 1,\n  \"description\": \"Computer labs section\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/blocks",
              "host": ["{{baseUrl}}"],
              "path": ["blocks"]
            }
          }
        }
      ]
    },
    {
      "name": "Locations Management",
      "item": [
        {
          "name": "Get All Locations",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/locations",
              "host": ["{{baseUrl}}"],
              "path": ["locations"]
            }
          }
        },
        {
          "name": "Get Locations by Block",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/locations/byBlock/1",
              "host": ["{{baseUrl}}"],
              "path": ["locations", "byBlock", "1"]
            }
          }
        },
        {
          "name": "Get Locations by Hierarchy",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/locations/byHierarchy?buildingId=1&floorId=1",
              "host": ["{{baseUrl}}"],
              "path": ["locations", "byHierarchy"],
              "query": [
                {
                  "key": "buildingId",
                  "value": "1"
                },
                {
                  "key": "floorId",
                  "value": "1"
                }
              ]
            }
          }
        },
        {
          "name": "Create New Location",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"locationName\": \"Conference Room A\",\n  \"locationType\": \"Meeting Room\",\n  \"capacity\": 12,\n  \"blockID\": 1,\n  \"description\": \"Small conference room with projector\",\n  \"isActive\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/locations",
              "host": ["{{baseUrl}}"],
              "path": ["locations"]
            }
          }
        }
      ]
    },
    {
      "name": "Availability Checking",
      "item": [
        {
          "name": "Check Availability",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"locationID\": 1,\n  \"startDateTime\": \"2025-09-22T09:00:00\",\n  \"endDateTime\": \"2025-09-22T10:30:00\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/availability/check",
              "host": ["{{baseUrl}}"],
              "path": ["availability", "check"]
            }
          }
        },
        {
          "name": "Get Available Slots for Day",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/availability/1/slots?date=2025-09-22",
              "host": ["{{baseUrl}}"],
              "path": ["availability", "1", "slots"],
              "query": [
                {
                  "key": "date",
                  "value": "2025-09-22"
                }
              ]
            }
          }
        },
        {
          "name": "Get Day Overview",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/availability/1/day-overview?date=2025-09-22",
              "host": ["{{baseUrl}}"],
              "path": ["availability", "1", "day-overview"],
              "query": [
                {
                  "key": "date",
                  "value": "2025-09-22"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Bookings Management",
      "item": [
        {
          "name": "Get All Bookings",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/bookings",
              "host": ["{{baseUrl}}"],
              "path": ["bookings"]
            }
          }
        },
        {
          "name": "Get Bookings by Location",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/bookings/byLocation/1",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "byLocation", "1"]
            }
          }
        },
        {
          "name": "Get Pending Bookings",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/bookings/pending",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "pending"]
            }
          }
        },
        {
          "name": "Create New Booking",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"locationID\": 1,\n  \"startsAt\": \"2025-09-22T14:00:00\",\n  \"endsAt\": \"2025-09-22T15:30:00\",\n  \"purpose\": \"Team meeting and project discussion\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/bookings",
              "host": ["{{baseUrl}}"],
              "path": ["bookings"]
            }
          }
        },
        {
          "name": "Approve Booking",
          "request": {
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/bookings/1/approve",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "1", "approve"]
            }
          }
        },
        {
          "name": "Reject Booking",
          "request": {
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/bookings/1/reject",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "1", "reject"]
            }
          }
        },
        {
          "name": "Cancel Booking",
          "request": {
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/bookings/1/cancel",
              "host": ["{{baseUrl}}"],
              "path": ["bookings", "1", "cancel"]
            }
          }
        }
      ]
    }
  ]
}
```

## 📋 Step-by-Step Testing Process

### Phase 1: Test Database Connection and Sample Data

1. **Start your backend server** (make sure MySQL is running)
2. **Test basic connectivity**:
   - Request: `GET {{baseUrl}}/buildings`
   - Expected: List of 2 sample buildings
   - Status: 200 OK

### Phase 2: Test Resource Hierarchy

3. **Test Buildings**:

   ```
   GET /api/buildings - Should return sample buildings
   GET /api/buildings/1 - Should return Main Building details
   ```

4. **Test Floor Hierarchy**:

   ```
   GET /api/floors/byBuilding/1 - Should return floors for Main Building
   GET /api/floors - Should return all floors
   ```

5. **Test Block Hierarchy**:

   ```
   GET /api/blocks/byFloor/1 - Should return blocks for first floor
   GET /api/blocks - Should return all blocks
   ```

6. **Test Location Hierarchy**:
   ```
   GET /api/locations/byBlock/1 - Should return locations in first block
   GET /api/locations/byHierarchy?buildingId=1 - Should return filtered locations
   ```

### Phase 3: Test CRUD Operations

7. **Create New Building**:

   ```
   POST /api/buildings
   Body: {
     "buildingName": "Science Complex",
     "buildingCode": "SC",
     "address": "456 University Ave",
     "description": "Modern science building"
   }
   ```

8. **Create Floor for New Building**:
   ```
   POST /api/floors
   Body: {
     "floorName": "Ground Floor",
     "floorNumber": 0,
     "buildingID": 3,  // Use ID from previous step
     "description": "Main entrance floor"
   }
   ```

### Phase 4: Test Availability System

9. **Check Availability**:

   ```
   POST /api/availability/check
   Body: {
     "locationID": 1,
     "startDateTime": "2025-09-22T09:00:00",
     "endDateTime": "2025-09-22T10:30:00"
   }
   ```

10. **Get Available Slots**:
    ```
    GET /api/availability/1/slots?date=2025-09-22
    ```

### Phase 5: Test Booking System

11. **Create Booking**:

    ```
    POST /api/bookings
    Body: {
      "locationID": 1,
      "startsAt": "2025-09-22T14:00:00",
      "endsAt": "2025-09-22T15:30:00",
      "purpose": "Team meeting and project discussion"
    }
    ```

12. **Test Booking Workflow**:

    ```
    GET /api/bookings/pending - List pending bookings
    PUT /api/bookings/1/approve - Approve first booking
    GET /api/bookings - Verify status changed
    ```

13. **Test Double-Booking Prevention**:
    ```
    POST /api/bookings (with overlapping time)
    Expected: Conflict error or validation failure
    ```

## 🔍 Expected Results Reference

### Sample Data Results

**Buildings (GET /api/buildings)**:

```json
[
  {
    "buildingID": 1,
    "buildingName": "Main Building",
    "buildingCode": "MB",
    "address": "123 University Ave",
    "floors": [...]
  },
  {
    "buildingID": 2,
    "buildingName": "Engineering Block",
    "buildingCode": "EB",
    "address": "456 Campus Dr",
    "floors": [...]
  }
]
```

**Availability Check Result**:

```json
{
  "isAvailable": true,
  "conflictingBookings": [],
  "availableSlots": [
    {
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "duration": "8:00:00"
    }
  ]
}
```

**Booking Creation Result**:

```json
{
  "bookingID": 1,
  "locationID": 1,
  "status": "Pending",
  "startsAt": "2025-09-22T14:00:00",
  "endsAt": "2025-09-22T15:30:00",
  "purpose": "Team meeting and project discussion"
}
```

## 🐛 Troubleshooting Common Issues

### SSL Certificate Issues

If you get SSL errors, try using HTTP instead:

- Change `baseUrl` to `http://localhost:5000/api`
- Or disable SSL verification in Postman (Settings → General → SSL certificate verification OFF)

### MySQL Connection Issues

- Verify MySQL service is running
- Check connection string password
- Ensure database exists: `ResourcelyDB_Dev`

### 404 Not Found Errors

- Verify the backend server is running
- Check the correct port (5000 or 5001)
- Ensure all routes are correctly spelled

### 400 Bad Request on POST

- Check JSON formatting in request body
- Verify required fields are included
- Check data types match the model requirements

## ✅ Testing Checklist

- [ ] Backend server starts without errors
- [ ] GET all buildings returns sample data
- [ ] Create new building succeeds
- [ ] Floor hierarchy navigation works
- [ ] Block and location filtering works
- [ ] Availability checking returns results
- [ ] Booking creation succeeds
- [ ] Booking approval workflow functions
- [ ] Double-booking prevention works
- [ ] All CRUD operations complete successfully

## 📈 Advanced Testing Scenarios

### Load Testing

- Create multiple concurrent bookings
- Test with overlapping time slots
- Verify conflict resolution

### Edge Cases

- Book exactly at business hours boundaries
- Create bookings with same start/end times
- Test with invalid location IDs
- Test with past dates

Your comprehensive API testing setup is now ready! 🎉
