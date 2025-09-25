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