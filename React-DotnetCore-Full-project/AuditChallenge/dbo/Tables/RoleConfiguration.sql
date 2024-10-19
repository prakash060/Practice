CREATE TABLE [dbo].[RoleConfiguration] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [EmailId]     NVARCHAR (MAX) NOT NULL,
    [RoleId]      INT            NOT NULL,
    [ChangedDate] DATETIME2 (7)  NOT NULL,
    [IsActive]    BIT            NOT NULL,
    CONSTRAINT [PK_RoleConfiguration] PRIMARY KEY CLUSTERED ([Id] ASC)
);

