CREATE TABLE [dbo].[ChallengedQuestion] (
    [Id]                UNIQUEIDENTIFIER NOT NULL,
    [ChallengedAuditId] UNIQUEIDENTIFIER NOT NULL,
    [SurveyQuestionId]  UNIQUEIDENTIFIER NOT NULL,
    [QuestionNumber]    INT              NOT NULL,
    [QuestionText]      NVARCHAR (500)   NOT NULL,
    [PickLists]         NVARCHAR (1000)  NOT NULL,
    [Notes]             NVARCHAR (1000)  NOT NULL,
    [IsChallenged]      BIT              NOT NULL,
    [IsReviewed]        BIT              NOT NULL,
    [ChangedDate]       DATETIME2 (7)    NOT NULL,
    [IsActive]          BIT              NOT NULL,
    CONSTRAINT [PK_ChallengedQuestion] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ChallengedQuestion_ChallengedAudit_ChallengedAuditId] FOREIGN KEY ([ChallengedAuditId]) REFERENCES [dbo].[ChallengedAudit] ([Id]) ON DELETE CASCADE
);

