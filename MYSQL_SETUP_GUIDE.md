# MySQL Database Setup for Testing

## Step 1: Connect to MySQL and Create Database

```sql
-- Connect to MySQL (you can use MySQL Workbench, phpMyAdmin, or command line)
-- Create the database
DROP DATABASE IF EXISTS resourcely;
CREATE DATABASE resourcely;
USE resourcely;

-- Create Users table first
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    RoleType VARCHAR(50) NOT NULL
);

-- Create Buildings table
CREATE TABLE Buildings (
    BuildingID INT AUTO_INCREMENT PRIMARY KEY,
    BuildingName VARCHAR(255) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Floors table
CREATE TABLE Floors (
    FloorID INT AUTO_INCREMENT PRIMARY KEY,
    FloorName VARCHAR(255) NOT NULL,
    FloorNumber INT NOT NULL,
    Description TEXT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    BuildingID INT NOT NULL,
    FOREIGN KEY (BuildingID) REFERENCES Buildings(BuildingID) ON DELETE CASCADE,
    UNIQUE KEY (BuildingID, FloorNumber)
);

-- Create Blocks table
CREATE TABLE Blocks (
    BlockID INT AUTO_INCREMENT PRIMARY KEY,
    BlockName VARCHAR(255) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FloorID INT NOT NULL,
    FOREIGN KEY (FloorID) REFERENCES Floors(FloorID) ON DELETE CASCADE,
    UNIQUE KEY (FloorID, BlockName)
);

-- Create Locations table
CREATE TABLE Locations (
    LocationID INT AUTO_INCREMENT PRIMARY KEY,
    LocationName VARCHAR(255) NOT NULL,
    LocationType VARCHAR(50) NOT NULL,
    Description TEXT,
    Capacity INT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    BlockID INT NOT NULL,
    FOREIGN KEY (BlockID) REFERENCES Blocks(BlockID) ON DELETE CASCADE,
    UNIQUE KEY (BlockID, LocationName)
);

-- Create Bookings table
CREATE TABLE Bookings (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    CreatedBy INT NOT NULL,
    LocationID INT NOT NULL,
    StartsAt DATETIME NOT NULL,
    EndsAt DATETIME NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'pending',
    Purpose TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ApprovedBy INT NULL,
    ApprovedDateTime DATETIME NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID) ON DELETE RESTRICT,
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID) ON DELETE CASCADE,
    FOREIGN KEY (ApprovedBy) REFERENCES Users(UserID) ON DELETE RESTRICT
);

-- Insert sample data
INSERT INTO Users (UserID, Email, FirstName, LastName, RoleType) VALUES
(1, 'admin@university.edu', 'Admin', 'User', 'admin'),
(2, 'john.lecturer@university.edu', 'John', 'Lecturer', 'lecturer'),
(3, 'jane.student@university.edu', 'Jane', 'Student', 'student');

INSERT INTO Buildings (BuildingID, BuildingName, Description) VALUES
(1, 'Main Building', 'Primary academic building'),
(2, 'Engineering Block', 'Engineering and technology departments');

INSERT INTO Floors (FloorID, BuildingID, FloorName, FloorNumber, Description) VALUES
(1, 1, 'Ground Floor', 0, 'Main entrance and reception'),
(2, 1, 'First Floor', 1, 'Lecture halls and classrooms'),
(3, 2, 'Ground Floor', 0, 'Engineering labs');

INSERT INTO Blocks (BlockID, FloorID, BlockName, Description) VALUES
(1, 1, 'Block A', 'Administration block'),
(2, 2, 'Block A', 'Lecture hall block'),
(3, 2, 'Block B', 'Classroom block'),
(4, 3, 'Block A', 'Computer labs');

INSERT INTO Locations (LocationID, BlockID, LocationName, LocationType, Capacity, Description) VALUES
(1, 2, 'A101', 'lectureHalls', 100, 'Large lecture hall with projector'),
(2, 2, 'A102', 'lectureHalls', 80, 'Medium lecture hall'),
(3, 3, 'B201', 'Labs', 30, 'Computer lab'),
(4, 3, 'B202', 'meetingRooms', 15, 'Small meeting room'),
(5, 4, 'E101', 'Labs', 25, 'Engineering lab');

-- Insert sample bookings
INSERT INTO Bookings (CreatedBy, LocationID, StartsAt, EndsAt, Status, Purpose) VALUES
(2, 1, '2025-09-24 09:00:00', '2025-09-24 11:00:00', 'approved', 'Software Engineering Lecture'),
(2, 2, '2025-09-24 14:00:00', '2025-09-24 16:00:00', 'pending', 'Database Systems Lecture'),
(3, 4, '2025-09-25 10:00:00', '2025-09-25 12:00:00', 'pending', 'Study Group Meeting'),
(2, 3, '2025-09-24 13:00:00', '2025-09-24 15:00:00', 'pending', 'Programming Lab Session');

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Update approved bookings
UPDATE Bookings SET
    ApprovedBy = 1,
    ApprovedDateTime = NOW()
WHERE Status = 'approved';

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
```

## Step 2: Verify Database

```sql
SELECT 'VERIFICATION' as Status;
SELECT COUNT(*) as Users FROM Users;
SELECT COUNT(*) as Buildings FROM Buildings;
SELECT COUNT(*) as Bookings FROM Bookings;
SELECT COUNT(*) as PendingBookings FROM Bookings WHERE Status = 'pending';
```
