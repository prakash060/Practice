CREATE TABLE [dbo].[ChallengedQuestionDetail] (
    [Id]                   UNIQUEIDENTIFIER NOT NULL,
    [ChallengedQuestionId] UNIQUEIDENTIFIER NOT NULL,
    [ChallengedBy]         NVARCHAR (50)    NOT NULL,
    [ChallengedDate]       DATETIME2 (7)    NOT NULL,
    [ChallengeNotes]       NVARCHAR (1000)  NOT NULL,
    [ReviewedBy]           NVARCHAR (50)    NULL,
    [ReviewedDate]         DATETIME2 (7)    NULL,
    [ReviewNotes]          NVARCHAR (1000)  NULL,
    [Status]               INT              NOT NULL,
    [ChangedDate]          DATETIME2 (7)    NOT NULL,
    [IsActive]             BIT              NOT NULL,
    [DepartmentName]       NCHAR (100)      NULL,
    CONSTRAINT [PK_ChallengedQuestionDetail] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ChallengedQuestionDetail_ChallengedQuestion_ChallengedQuestionId] FOREIGN KEY ([ChallengedQuestionId]) REFERENCES [dbo].[ChallengedQuestion] ([Id]) ON DELETE CASCADE
);

