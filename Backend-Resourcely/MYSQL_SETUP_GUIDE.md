# MySQL Setup and Testing Guide

## 🗄️ MySQL Database Setup

### Step 1: Install MySQL

1. **Download MySQL Community Server** from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. **Install MySQL Workbench** (optional but recommended for database management)
3. **During installation, note down your root password**

### Step 2: Create Database

Using MySQL Command Line:

```sql
mysql -u root -p
CREATE DATABASE ResourcelyDB;
CREATE DATABASE ResourcelyDB_Dev;
EXIT;
```

Using MySQL Workbench:

1. Connect to your local MySQL server
2. Right-click in the Navigator → Create Schema
3. Name it `ResourcelyDB` for production
4. Create another one named `ResourcelyDB_Dev` for development

### Step 3: Update Connection String

**IMPORTANT**: Update your password in the connection strings:

**appsettings.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=ResourcelyDB;uid=root;pwd=YOUR_MYSQL_PASSWORD;"
  }
}
```

**appsettings.Development.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=ResourcelyDB_Dev;uid=root;pwd=YOUR_MYSQL_PASSWORD;"
  }
}
```

Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password.

## 🔧 Database Migration Setup

### Step 1: Remove Old Migrations (if any)

```powershell
# Navigate to project directory
cd "C:\Users\draup\OneDrive\Documents\Github\Resourcely\Backend-Resourcely\Backend-Resourcely"

# Remove existing migrations
Remove-Item -Recurse -Force ".\Migrations" -ErrorAction SilentlyContinue
```

### Step 2: Create New MySQL Migration

```powershell
# Create initial migration for MySQL
dotnet ef migrations add InitialCreateMySQL

# Apply migration to database
dotnet ef database update
```

### Step 3: Verify Database Creation

- Open MySQL Workbench
- Connect to localhost
- Check that `ResourcelyDB_Dev` database exists with all tables

## 🚀 Running the Backend

```powershell
# Navigate to project directory
cd "C:\Users\draup\OneDrive\Documents\Github\Resourcely\Backend-Resourcely\Backend-Resourcely"

# Run the application
dotnet run
```

The API will be available at:

- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **Swagger UI**: `https://localhost:5001/swagger`

## 🧪 Testing Database Connection

### Quick Connection Test

Run this command to test the database connection:

```powershell
dotnet run --urls "http://localhost:5000"
```

If successful, you should see:

- No connection errors in the console
- Swagger UI accessible at the URLs above
- Sample data loaded in your MySQL database

### Verify Sample Data

In MySQL Workbench, run these queries to verify sample data:

```sql
USE ResourcelyDB_Dev;
SELECT * FROM Buildings;
SELECT * FROM Floors;
SELECT * FROM Blocks;
SELECT * FROM Locations;
SELECT * FROM Users;
```

## 🔍 Common Issues and Solutions

### Issue: "Access denied for user 'root'"

**Solution**: Check your password in the connection string

### Issue: "Unknown database 'ResourcelyDB_Dev'"

**Solution**: Create the database manually:

```sql
CREATE DATABASE ResourcelyDB_Dev;
```

### Issue: "Unable to connect to any of the specified MySQL hosts"

**Solution**: Ensure MySQL service is running:

- Windows: Services → MySQL80 → Start
- Or restart MySQL service

### Issue: Migration fails with "Table already exists"

**Solution**:

1. Drop the database and recreate it
2. Remove migrations folder and recreate migration

```sql
DROP DATABASE ResourcelyDB_Dev;
CREATE DATABASE ResourcelyDB_Dev;
```

```powershell
Remove-Item -Recurse -Force ".\Migrations"
dotnet ef migrations add InitialCreateMySQL
dotnet ef database update
```

## 📊 Database Schema Overview

After successful migration, your MySQL database will have:

### Tables Created:

- **Users** - User accounts with roles
- **Buildings** - Campus buildings
- **Floors** - Building floors
- **Blocks** - Floor blocks/sections
- **Locations** - Bookable resources/rooms
- **ResourceAvailability** - Availability time slots
- **Bookings** - Booking requests and approvals

### Sample Data Included:

- 3 Users (admin, lecturer, student)
- 2 Buildings (Main Building, Engineering Block)
- 3 Floors across buildings
- 4 Blocks across floors
- 5 Locations (lecture halls, labs, meeting rooms)

## ✅ Next Steps

Once your MySQL database is set up and running:

1. **Test API endpoints** using Postman (see POSTMAN_TESTING_GUIDE.md)
2. **Integrate with React frontend** using the integration guide
3. **Create additional test data** as needed

Your campus resource management system is now ready with MySQL! 🎉
