CREATE TABLE [dbo].[AccountConfiguration] (
    [Id]               INT              IDENTITY (1, 1) NOT NULL,
    [AccountId]        UNIQUEIDENTIFIER NOT NULL,
    [AccountName]      NVARCHAR (MAX)   NOT NULL,
    [LimitToChallenge] INT              NOT NULL,
    [LimitToReview]    INT              NOT NULL,
    [ChangedDate]      DATETIME2 (7)    NOT NULL,
    [IsActive]         BIT              NOT NULL,
    CONSTRAINT [PK_AccountConfiguration] PRIMARY KEY CLUSTERED ([Id] ASC)
);

