-- Drop tables if they exist (in reverse order due to foreign key constraints)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND type in (N'U'))
    DROP TABLE [dbo].[Bookings];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Resources]') AND type in (N'U'))
    DROP TABLE [dbo].[Resources];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Blocks]') AND type in (N'U'))
    DROP TABLE [dbo].[Blocks];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Floors]') AND type in (N'U'))
    DROP TABLE [dbo].[Floors];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Buildings]') AND type in (N'U'))
    DROP TABLE [dbo].[Buildings];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
    DROP TABLE [dbo].[Users];

GO

-- Create Users table
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

GO

-- Create Buildings table
CREATE TABLE [dbo].[Buildings] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
    [IsActive] BIT NOT NULL DEFAULT 1,
    PRIMARY KEY ([Id])
);

GO

-- Create Floors table
CREATE TABLE [dbo].[Floors] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    [BuildingId] INT NOT NULL,
    [FloorNumber] INT NOT NULL,
    [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
    [IsActive] BIT NOT NULL DEFAULT 1,
    PRIMARY KEY ([Id]),
    FOREIGN KEY ([BuildingId]) REFERENCES [Buildings]([Id])
);

GO

-- Create Blocks table
CREATE TABLE [dbo].[Blocks] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    [FloorId] INT NOT NULL,
    [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
    [IsActive] BIT NOT NULL DEFAULT 1,
    PRIMARY KEY ([Id]),
    FOREIGN KEY ([FloorId]) REFERENCES [Floors]([Id])
);

GO

-- Create Resources table
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

GO

-- Create Bookings table
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

GO

-- Insert sample data
-- Sample Buildings
INSERT INTO [Buildings] ([Name], [Description]) VALUES
('Main Building', 'Main university building with administrative offices'),
('Science Building', 'Building dedicated to science and research'),
('Library Building', 'Central library with reading halls and study areas');

GO

-- Sample Floors
INSERT INTO [Floors] ([Name], [Description], [BuildingId], [FloorNumber]) VALUES
('Ground Floor', 'Ground level of the building', 1, 0),
('First Floor', 'First floor of the building', 1, 1),
('Second Floor', 'Second floor of the building', 1, 2),
('Ground Floor', 'Ground level of the science building', 2, 0),
('First Floor', 'First floor of the science building', 2, 1),
('Ground Floor', 'Ground level of the library building', 3, 0);

GO

-- Sample Blocks
INSERT INTO [Blocks] ([Name], [Description], [FloorId]) VALUES
('Block A', 'Administrative block with offices', 1),
('Block B', 'General purpose block', 1),
('Block C', 'Academic block with classrooms', 2),
('Block D', 'Research and meeting block', 2),
('Lab Block', 'Laboratory facilities block', 4),
('Reading Hall', 'Quiet study and reading area', 6);

GO

-- Sample Resources
INSERT INTO [Resources] ([Name], [Type], [Description], [Capacity], [BlockId], [IsRestricted], [RestrictedToRoles]) VALUES
('Conference Room A', 'Meeting Room', 'Large conference room with projector', 20, 1, 0, ''),
('Lab 101', 'Lab', 'Computer Science Lab', 30, 5, 1, 'Student,Lecturer'),
('Study Hall', 'Study Room', 'Quiet study area', 50, 6, 0, ''),
('Meeting Room B', 'Meeting Room', 'Small meeting room', 8, 2, 1, 'Staff,Lecturer'),
('Auditorium', 'Auditorium', 'Main auditorium for events', 200, 3, 1, 'Admin,Lecturer');

GO

-- Note: Admin users should be created through the registration API and then promoted
-- For testing purposes, you can register with any email and password, then update the role manually if needed

GO