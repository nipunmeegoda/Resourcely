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

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Bookings] (
        [Id] INT NOT NULL IDENTITY(1,1),
        [UserId] NVARCHAR(50) NULL,
        [Location] NVARCHAR(255) NOT NULL,
        [ResourceType] NVARCHAR(50) NOT NULL DEFAULT 'Regular',
        [BookingAt] DATETIME2(6) NOT NULL,
        [Reason] NVARCHAR(MAX) NOT NULL,
        [Capacity] INT NOT NULL,
        [Contact] NVARCHAR(255) NOT NULL,
        [CreatedAt] DATETIME2(6) NOT NULL DEFAULT SYSDATETIME(),
        PRIMARY KEY ([Id])
    );
END