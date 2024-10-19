USE [EmsCloud]

SET ANSI_PADDING ON
GO

--------------------------------SurveyTranslation table---------------------------------------

/****** Object:  Index [SurveyTranslation]    Script Date: 28-06-2024 11:55:03 ******/
CREATE NONCLUSTERED INDEX [SurveyTranslation_SurveyId_CultureCode_IsActive] ON [dbo].[SurveyTranslation]
(
	[SurveyId],CultureCode, IsActive
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO