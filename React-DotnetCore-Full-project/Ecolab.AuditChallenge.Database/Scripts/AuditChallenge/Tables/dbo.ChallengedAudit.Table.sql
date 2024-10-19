/****** Object:  Table [dbo].[ChallengedAudit]    Script Date: 17-08-2024 11:27:05 ******/
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
