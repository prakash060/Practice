USE [EmsCloud]

SET ANSI_PADDING ON
GO

--------------------------------ServiceResponse table---------------------------------------

/****** Object:  Index [Location_ChangeDate]    Script Date: 28-06-2024 11:55:03 ******/
CREATE NONCLUSTERED INDEX [ServiceResponse_LocationVisitId_ServiceResponseId_VisitServiceId] ON [dbo].[ServiceResponse]
(
	[LocationVisitId],[ServiceResponseId],[VisitServiceId]
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO