USE [EmsCloud]

SET ANSI_PADDING ON
GO

--------------------------------ServiceReport table---------------------------------------

/****** Object:  Index [UserStage_Email]    Script Date: 15-06-2024 11:55:03 ******/
CREATE NONCLUSTERED INDEX [ServiceReport_ServiceResponseId] ON [dbo].[ServiceReport]
(
	[ServiceResponseId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO