CREATE TABLE [dbo].[ChallengedAudit] (
    [Id]                UNIQUEIDENTIFIER NOT NULL,
    [ServiceResponseId] UNIQUEIDENTIFIER NOT NULL,
    [AccountId]         UNIQUEIDENTIFIER NOT NULL,
    [LocationId]        UNIQUEIDENTIFIER NOT NULL,
    [Location]          NVARCHAR (200)   NOT NULL,
    [SurveyName]        NVARCHAR (200)   NOT NULL,
    [UnitNumber]        NVARCHAR (20)    NOT NULL,
    [VisitDate]         DATETIME2 (7)    NOT NULL,
    [FindingsCount]     INT              NOT NULL,
    [Status]            INT              NOT NULL,
    [ChangedDate]       DATETIME2 (7)    NOT NULL,
    [IsActive]          BIT              NOT NULL,
    CONSTRAINT [PK_ChallengedAudit] PRIMARY KEY CLUSTERED ([Id] ASC)
);

