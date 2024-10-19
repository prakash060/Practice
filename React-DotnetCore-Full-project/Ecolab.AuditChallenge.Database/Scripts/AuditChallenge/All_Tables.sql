USE [AuditChallenge]

/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 17-08-2024 11:32:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__EFMigrationsHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AccountConfiguration]    Script Date: 17-08-2024 11:32:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountConfiguration](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[AccountId] [uniqueidentifier] NOT NULL,
	[AccountName] [nvarchar](max) NOT NULL,
	[LimitToChallenge] [int] NOT NULL,
	[LimitToReview] [int] NOT NULL,
	[ChangedDate] [datetime2](7) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_AccountConfiguration] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChallengedAudit]    Script Date: 17-08-2024 11:32:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChallengedAudit](
	[Id] [uniqueidentifier] NOT NULL,
	[ServiceResponseId] [uniqueidentifier] NOT NULL,
	[AccountId] [uniqueidentifier] NOT NULL,
	[LocationId] [uniqueidentifier] NOT NULL,
	[Location] [nvarchar](200) NOT NULL,
	[SurveyName] [nvarchar](200) NOT NULL,
	[UnitNumber] [nvarchar](20) NOT NULL,
	[VisitDate] [datetime2](7) NOT NULL,
	[FindingsCount] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[ChangedDate] [datetime2](7) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ChallengedAudit] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChallengedQuestion]    Script Date: 17-08-2024 11:32:46 ******/
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
/****** Object:  Table [dbo].[ChallengedQuestionDetail]    Script Date: 31-08-2024 10:53:37 ******/
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
	[DepartmentName] [nchar](100) NULL,
 CONSTRAINT [PK_ChallengedQuestionDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoleConfiguration]    Script Date: 17-08-2024 11:32:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoleConfiguration](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[EmailId] [nvarchar](max) NOT NULL,
	[RoleId] [int] NOT NULL,
	[ChangedDate] [datetime2](7) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_RoleConfiguration] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[ChallengedQuestion]  WITH CHECK ADD  CONSTRAINT [FK_ChallengedQuestion_ChallengedAudit_ChallengedAuditId] FOREIGN KEY([ChallengedAuditId])
REFERENCES [dbo].[ChallengedAudit] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChallengedQuestion] CHECK CONSTRAINT [FK_ChallengedQuestion_ChallengedAudit_ChallengedAuditId]
GO
ALTER TABLE [dbo].[ChallengedQuestionDetail]  WITH CHECK ADD  CONSTRAINT [FK_ChallengedQuestionDetail_ChallengedQuestion_ChallengedQuestionId] FOREIGN KEY([ChallengedQuestionId])
REFERENCES [dbo].[ChallengedQuestion] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ChallengedQuestionDetail] CHECK CONSTRAINT [FK_ChallengedQuestionDetail_ChallengedQuestion_ChallengedQuestionId]
GO
