/****** Object:  Table [dbo].[ChallengedQuestion]    Script Date: 17-08-2024 11:27:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChallengedQuestion](
	[Id] [uniqueidentifier] NOT NULL,
	[ChallengedAuditId] [uniqueidentifier] NOT NULL,
	[SurveyQuestionId] [uniqueidentifier] NOT NULL,
	[QuestionNumber] [int] NOT NULL,
	[QuestionText] [nvarchar](500) NOT NULL,
	[PickLists] [nvarchar](1000) NOT NULL,
	[Notes] [nvarchar](1000) NOT NULL,
	[IsChallenged] [bit] NOT NULL,
	[IsReviewed] [bit] NOT NULL,
	[ChangedDate] [datetime2](7) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ChallengedQuestion] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ChallengedQuestion]  WITH CHECK ADD  CONSTRAINT [FK_ChallengedQuestion_ChallengedAudit_ChallengedAuditId] FOREIGN KEY([ChallengedAuditId])
REFERENCES [dbo].[ChallengedAudit] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChallengedQuestion] CHECK CONSTRAINT [FK_ChallengedQuestion_ChallengedAudit_ChallengedAuditId]
GO
