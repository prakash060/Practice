/****** Object:  Table [dbo].[ChallengedQuestionDetail]    Script Date: 17-08-2024 11:27:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChallengedQuestionDetail](
	[Id] [uniqueidentifier] NOT NULL,
	[ChallengedQuestionId] [uniqueidentifier] NOT NULL,
	[ChallengedBy] [nvarchar](50) NOT NULL,
	[ChallengedDate] [datetime2](7) NOT NULL,
	[ChallengeNotes] [nvarchar](1000) NOT NULL,
	[ReviewedBy] [nvarchar](50) NULL,
	[ReviewedDate] [datetime2](7) NULL,
	[ReviewNotes] [nvarchar](1000) NULL,
	[Status] [int] NOT NULL,
	[ChangedDate] [datetime2](7) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ChallengedQuestionDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ChallengedQuestionDetail]  WITH CHECK ADD  CONSTRAINT [FK_ChallengedQuestionDetail_ChallengedQuestion_ChallengedQuestionId] FOREIGN KEY([ChallengedQuestionId])
REFERENCES [dbo].[ChallengedQuestion] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChallengedQuestionDetail] CHECK CONSTRAINT [FK_ChallengedQuestionDetail_ChallengedQuestion_ChallengedQuestionId]
GO
