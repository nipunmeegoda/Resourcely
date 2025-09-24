# Complete MySQL Mock Data Script

## 📝 Campus Resource Management System - Sample Data

Use this script to manually insert or re-insert the sample data into your MySQL database.

```sql
-- ================================================
-- Campus Resource Management System - Mock Data
-- ================================================

-- Use the database
USE ResourcelyDB_Dev;

-- Clear existing data (optional - only if you want to start fresh)
-- DELETE FROM Bookings;
-- DELETE FROM ResourceAvailabilities;
-- DELETE FROM Locations;
-- DELETE FROM Blocks;
-- DELETE FROM Floors;
-- DELETE FROM Buildings;
-- DELETE FROM Users;

-- Reset auto-increment counters (optional)
-- ALTER TABLE Buildings AUTO_INCREMENT = 1;
-- ALTER TABLE Users AUTO_INCREMENT = 1;
-- ALTER TABLE Floors AUTO_INCREMENT = 1;
-- ALTER TABLE Blocks AUTO_INCREMENT = 1;
-- ALTER TABLE Locations AUTO_INCREMENT = 1;

-- ================================================
-- 1. INSERT BUILDINGS
-- ================================================
INSERT INTO Buildings (BuildingID, BuildingName, CreatedAt, Description) VALUES
(1, 'Main Building', '2025-09-21 00:00:00', 'Primary academic building'),
(2, 'Engineering Block', '2025-09-21 00:00:00', 'Engineering and technology departments');

-- ================================================
-- 2. INSERT USERS
-- ================================================
INSERT INTO Users (UserID, Email, FirstName, LastName, RoleType) VALUES
(1, 'admin@university.edu', 'Admin', 'User', 'admin'),
(2, 'john.lecturer@university.edu', 'John', 'Lecturer', 'lecturer'),
(3, 'jane.student@university.edu', 'Jane', 'Student', 'student');

-- ================================================
-- 3. INSERT FLOORS
-- ================================================
INSERT INTO Floors (FloorID, BuildingID, CreatedAt, Description, FloorName, FloorNumber) VALUES
(1, 1, '2025-09-21 00:00:00', 'Main entrance and reception', 'Ground Floor', 0),
(2, 1, '2025-09-21 00:00:00', 'Lecture halls and classrooms', 'First Floor', 1),
(3, 2, '2025-09-21 00:00:00', 'Engineering labs', 'Ground Floor', 0);

-- ================================================
-- 4. INSERT BLOCKS
-- ================================================
INSERT INTO Blocks (BlockID, BlockName, CreatedAt, Description, FloorID) VALUES
(1, 'Block A', '2025-09-21 00:00:00', 'Administration block', 1),
(2, 'Block A', '2025-09-21 00:00:00', 'Lecture hall block', 2),
(3, 'Block B', '2025-09-21 00:00:00', 'Classroom block', 2),
(4, 'Block A', '2025-09-21 00:00:00', 'Computer labs', 3);

-- ================================================
-- 5. INSERT LOCATIONS
-- ================================================
INSERT INTO Locations (LocationID, BlockID, Capacity, CreatedAt, Description, LocationName, LocationType) VALUES
(1, 2, 100, '2025-09-21 00:00:00', 'Large lecture hall with projector', 'A101', 'lectureHalls'),
(2, 2, 80, '2025-09-21 00:00:00', 'Medium lecture hall', 'A102', 'lectureHalls'),
(3, 3, 30, '2025-09-21 00:00:00', 'Computer lab', 'B201', 'Labs'),
(4, 3, 15, '2025-09-21 00:00:00', 'Small meeting room', 'B202', 'meetingRooms'),
(5, 4, 25, '2025-09-21 00:00:00', 'Engineering lab', 'E101', 'Labs');

-- ================================================
-- 6. VERIFY DATA INSERTION
-- ================================================
-- Check Buildings
SELECT 'BUILDINGS' as TableName;
SELECT BuildingID, BuildingName, Description, CreatedAt FROM Buildings ORDER BY BuildingID;

-- Check Users
SELECT 'USERS' as TableName;
SELECT UserID, FirstName, LastName, Email, RoleType FROM Users ORDER BY UserID;

-- Check Floors
SELECT 'FLOORS' as TableName;
SELECT f.FloorID, f.FloorName, f.FloorNumber, f.Description,
       b.BuildingName, f.CreatedAt
FROM Floors f
JOIN Buildings b ON f.BuildingID = b.BuildingID
ORDER BY f.FloorID;

-- Check Blocks
SELECT 'BLOCKS' as TableName;
SELECT bl.BlockID, bl.BlockName, bl.Description,
       f.FloorName, b.BuildingName, bl.CreatedAt
FROM Blocks bl
JOIN Floors f ON bl.FloorID = f.FloorID
JOIN Buildings b ON f.BuildingID = b.BuildingID
ORDER BY bl.BlockID;

-- Check Locations
SELECT 'LOCATIONS' as TableName;
SELECT l.LocationID, l.LocationName, l.LocationType, l.Capacity, l.Description,
       bl.BlockName, f.FloorName, b.BuildingName, l.CreatedAt
FROM Locations l
JOIN Blocks bl ON l.BlockID = bl.BlockID
JOIN Floors f ON bl.FloorID = f.FloorID
JOIN Buildings b ON f.BuildingID = b.BuildingID
ORDER BY l.LocationID;

-- ================================================
-- 7. SAMPLE RESOURCE AVAILABILITY (Optional)
-- ================================================
-- Add some availability slots for testing
INSERT INTO ResourceAvailabilities (LocationID, Date, StartTime, EndTime, DayOfWeek, IsRecurring, CreatedAt) VALUES
-- A101 availability
(1, '2025-09-24', '08:00:00', '18:00:00', 'Tuesday', true, NOW()),
(1, '2025-09-25', '08:00:00', '18:00:00', 'Wednesday', true, NOW()),
(1, '2025-09-26', '08:00:00', '18:00:00', 'Thursday', true, NOW()),

-- A102 availability
(2, '2025-09-24', '08:00:00', '18:00:00', 'Tuesday', true, NOW()),
(2, '2025-09-25', '08:00:00', '18:00:00', 'Wednesday', true, NOW()),

-- B201 Computer Lab availability
(3, '2025-09-24', '09:00:00', '17:00:00', 'Tuesday', true, NOW()),
(3, '2025-09-25', '09:00:00', '17:00:00', 'Wednesday', true, NOW()),

-- B202 Meeting Room availability
(4, '2025-09-24', '08:00:00', '20:00:00', 'Tuesday', true, NOW()),
(4, '2025-09-25', '08:00:00', '20:00:00', 'Wednesday', true, NOW()),

-- E101 Engineering Lab availability
(5, '2025-09-24', '10:00:00', '16:00:00', 'Tuesday', true, NOW()),
(5, '2025-09-25', '10:00:00', '16:00:00', 'Wednesday', true, NOW());

-- ================================================
-- 8. SAMPLE BOOKINGS (Optional)
-- ================================================
-- Add some sample bookings for testing
INSERT INTO Bookings (CreatedBy, LocationID, StartsAt, EndsAt, Status, Purpose, CreatedAt) VALUES
-- Approved booking
(2, 1, '2025-09-24 09:00:00', '2025-09-24 11:00:00', 'approved', 'Software Engineering Lecture', NOW()),

-- Pending bookings
(2, 2, '2025-09-24 14:00:00', '2025-09-24 16:00:00', 'pending', 'Database Systems Lecture', NOW()),
(3, 4, '2025-09-25 10:00:00', '2025-09-25 12:00:00', 'pending', 'Study Group Meeting', NOW()),

-- Approved lab booking
(2, 3, '2025-09-24 13:00:00', '2025-09-24 15:00:00', 'approved', 'Programming Lab Session', NOW());

-- Update some bookings to have approval info
UPDATE Bookings SET
    ApprovedBy = 1,
    ApprovedDateTime = NOW()
WHERE Status = 'approved';

-- ================================================
-- 9. FINAL VERIFICATION QUERIES
-- ================================================
-- Complete hierarchy view
SELECT 'COMPLETE HIERARCHY' as Info;
SELECT
    b.BuildingName,
    f.FloorName,
    f.FloorNumber,
    bl.BlockName,
    l.LocationName,
    l.LocationType,
    l.Capacity,
    l.Description
FROM Buildings b
JOIN Floors f ON b.BuildingID = f.BuildingID
JOIN Blocks bl ON f.FloorID = bl.FloorID
JOIN Locations l ON bl.BlockID = l.BlockID
ORDER BY b.BuildingID, f.FloorNumber, bl.BlockName, l.LocationName;

-- Bookings with full details
SELECT 'BOOKINGS WITH DETAILS' as Info;
SELECT
    bk.BookingID,
    u1.FirstName + ' ' + u1.LastName as CreatedByUser,
    l.LocationName,
    bl.BlockName,
    f.FloorName,
    b.BuildingName,
    bk.StartsAt,
    bk.EndsAt,
    bk.Status,
    bk.Purpose,
    CASE
        WHEN bk.ApprovedBy IS NOT NULL
        THEN u2.FirstName + ' ' + u2.LastName
        ELSE 'Not Approved'
    END as ApprovedByUser
FROM Bookings bk
JOIN Users u1 ON bk.CreatedBy = u1.UserID
LEFT JOIN Users u2 ON bk.ApprovedBy = u2.UserID
JOIN Locations l ON bk.LocationID = l.LocationID
JOIN Blocks bl ON l.BlockID = bl.BlockID
JOIN Floors f ON bl.FloorID = f.FloorID
JOIN Buildings b ON f.BuildingID = b.BuildingID
ORDER BY bk.StartsAt;

-- Summary counts
SELECT 'DATA SUMMARY' as Info;
SELECT
    (SELECT COUNT(*) FROM Buildings) as TotalBuildings,
    (SELECT COUNT(*) FROM Floors) as TotalFloors,
    (SELECT COUNT(*) FROM Blocks) as TotalBlocks,
    (SELECT COUNT(*) FROM Locations) as TotalLocations,
    (SELECT COUNT(*) FROM Users) as TotalUsers,
    (SELECT COUNT(*) FROM ResourceAvailabilities) as TotalAvailabilitySlots,
    (SELECT COUNT(*) FROM Bookings) as TotalBookings,
    (SELECT COUNT(*) FROM Bookings WHERE Status = 'pending') as PendingBookings,
    (SELECT COUNT(*) FROM Bookings WHERE Status = 'approved') as ApprovedBookings;
```

## 🔍 How to Use This Script:

### Option 1: Run Complete Script

1. Open MySQL Workbench or command line
2. Connect to your MySQL server
3. Copy and paste the entire script above
4. Execute it

### Option 2: Run Sections Individually

Execute each section (1-9) separately if you want to control the process step by step.

### Option 3: Selective Data Loading

- **Core Data Only**: Run sections 1-5 (Buildings, Users, Floors, Blocks, Locations)
- **With Sample Bookings**: Run sections 1-8 for complete test data
- **Fresh Start**: Uncomment the DELETE statements in the beginning

## 📊 What This Script Creates:

### Buildings (2):

- Main Building
- Engineering Block

### Users (3):

- Admin User (admin role)
- John Lecturer (lecturer role)
- Jane Student (student role)

### Floors (3):

- Ground Floor - Main Building
- First Floor - Main Building
- Ground Floor - Engineering Block

### Blocks (4):

- Block A (Administration) - Ground Floor, Main Building
- Block A (Lecture halls) - First Floor, Main Building
- Block B (Classrooms) - First Floor, Main Building
- Block A (Computer labs) - Ground Floor, Engineering Block

### Locations (5):

- A101 - Large Lecture Hall (100 capacity)
- A102 - Medium Lecture Hall (80 capacity)
- B201 - Computer Lab (30 capacity)
- B202 - Small Meeting Room (15 capacity)
- E101 - Engineering Lab (25 capacity)

### Optional Sample Data:

- Resource availability slots for multiple days
- Sample bookings (approved and pending)
- Complete test data for API testing

This script will give you a fully populated database ready for testing your Campus Resource Management System! 🎉
