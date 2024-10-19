USE [EmsCloud]

SET ANSI_PADDING ON
GO

--------------------------------ObservationIssue table---------------------------------------

/****** Object:  Index [Location_ChangeDate]    Script Date: 28-06-2024 11:55:03 ******/
CREATE NONCLUSTERED INDEX [ObservationIssue_ObservationId_IsActive] ON [dbo].[ObservationIssue]
(
	[ObservationId], IsActive
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO