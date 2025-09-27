-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [Email] NVARCHAR(255) NOT NULL UNIQUE,
        [Username] NVARCHAR(255) NOT NULL,
        [PasswordHash] NVARCHAR(MAX) NOT NULL,
        [PasswordSalt] NVARCHAR(MAX) NOT NULL,
        [Role] NVARCHAR(50) NOT NULL DEFAULT 'User',
        [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
        PRIMARY KEY ([Id])
    );
END

-- Create Buildings table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Buildings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Buildings] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [Name] NVARCHAR(255) NOT NULL,
        [Description] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
        [IsActive] BIT NOT NULL DEFAULT 1,
        PRIMARY KEY ([Id])
    );
END
ELSE
BEGIN
    -- Check if Address column exists and rename it to Description
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Buildings]') AND name = 'Address')
    AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Buildings]') AND name = 'Description')
    BEGIN
        EXEC sp_rename '[Buildings].[Address]', 'Description', 'COLUMN';
    END
END

-- Create Floors table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Floors]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Floors] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [Name] NVARCHAR(255) NOT NULL,
        [BuildingId] INT NOT NULL,
        [FloorNumber] INT NOT NULL,
        [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
        [IsActive] BIT NOT NULL DEFAULT 1,
        PRIMARY KEY ([Id]),
        FOREIGN KEY ([BuildingId]) REFERENCES [Buildings]([Id])
    );
END

-- Create Blocks table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Blocks]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Blocks] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [Name] NVARCHAR(255) NOT NULL,
        [FloorId] INT NOT NULL,
        [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
        [IsActive] BIT NOT NULL DEFAULT 1,
        PRIMARY KEY ([Id]),
        FOREIGN KEY ([FloorId]) REFERENCES [Floors]([Id])
    );
END

-- Create Resources table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Resources]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Resources] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [Name] NVARCHAR(255) NOT NULL,
        [Type] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(1000) NULL,
        [Capacity] INT NOT NULL,
        [BlockId] INT NOT NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [IsRestricted] BIT NOT NULL DEFAULT 0,
        [RestrictedToRoles] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
        PRIMARY KEY ([Id]),
        FOREIGN KEY ([BlockId]) REFERENCES [Blocks]([Id])
    );
END

-- Create Bookings table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Bookings] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [ResourceId] INT NOT NULL,
        [UserId] NVARCHAR(450) NOT NULL,
        [BookingAt] DATETIME2(6) NOT NULL,
        [EndAt] DATETIME2(6) NOT NULL,
        [Reason] NVARCHAR(500) NOT NULL,
        [Capacity] INT NOT NULL,
        [Contact] NVARCHAR(255) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        [ApprovedBy] NVARCHAR(255) NULL,
        [ApprovedAt] DATETIME2(6) NULL,
        [RejectionReason] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
        PRIMARY KEY ([Id]),
        FOREIGN KEY ([ResourceId]) REFERENCES [Resources]([Id])
    );
END

-- Insert sample data for testing
-- Sample Buildings
IF NOT EXISTS (SELECT * FROM [Buildings])
BEGIN
    INSERT INTO [Buildings] ([Name], [Description]) VALUES
    ('Main Building', 'Main university building with administrative offices'),
    ('Science Building', 'Building dedicated to science and research'),
    ('Library Building', 'Central library with reading halls and study areas');
END

-- Sample Floors
IF NOT EXISTS (SELECT * FROM [Floors])
BEGIN
    INSERT INTO [Floors] ([Name], [BuildingId], [FloorNumber]) VALUES
    ('Ground Floor', 1, 0),
    ('First Floor', 1, 1),
    ('Second Floor', 1, 2),
    ('Ground Floor', 2, 0),
    ('First Floor', 2, 1),
    ('Ground Floor', 3, 0);
END

-- Sample Blocks
IF NOT EXISTS (SELECT * FROM [Blocks])
BEGIN
    INSERT INTO [Blocks] ([Name], [FloorId]) VALUES
    ('Block A', 1),
    ('Block B', 1),
    ('Block C', 2),
    ('Block D', 2),
    ('Lab Block', 4),
    ('Reading Hall', 6);
END

-- Sample Resources
IF NOT EXISTS (SELECT * FROM [Resources])
BEGIN
    INSERT INTO [Resources] ([Name], [Type], [Description], [Capacity], [BlockId], [IsRestricted], [RestrictedToRoles]) VALUES
    ('Conference Room A', 'Meeting Room', 'Large conference room with projector', 20, 1, 0, ''),
    ('Lab 101', 'Lab', 'Computer Science Lab', 30, 5, 1, 'Student,Lecturer'),
    ('Study Hall', 'Study Room', 'Quiet study area', 50, 6, 0, ''),
    ('Meeting Room B', 'Meeting Room', 'Small meeting room', 8, 2, 1, 'Staff,Lecturer'),
    ('Auditorium', 'Auditorium', 'Main auditorium for events', 200, 3, 1, 'Admin,Lecturer');
END

-- Sample Admin User (password is "admin123")
IF NOT EXISTS (SELECT * FROM [Users] WHERE [Email] = 'admin@resourcely.com')
BEGIN
    INSERT INTO [Users] ([Email], [Username], [PasswordHash], [PasswordSalt], [Role]) VALUES
    ('admin@resourcely.com', 'admin', 
     'AQAAAAIAAYagAAAAENxF8xY8yKzQ1J8F9v9F8F9F8F9F8F9F8F9F8F9F8F9F8F9F8F9F8F9F8F9F8F9F8F9F8Q==', 
     'salt123', 'Admin');
END