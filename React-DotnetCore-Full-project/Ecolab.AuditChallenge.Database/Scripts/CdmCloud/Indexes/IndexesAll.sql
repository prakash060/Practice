
--------------------------------User table---------------------------------------

SET ANSI_PADDING ON
GO

/****** Object:  Index [UserStage_Email]    Script Date: 15-06-2024 11:55:03 ******/
CREATE NONCLUSTERED INDEX [UserStage_Email] ON [dbo].[UserStage]
(
	[Email] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


/****** Object:  Index [UserStage_UserKey]    Script Date: 15-06-2024 11:55:54 ******/
CREATE NONCLUSTERED INDEX [UserStage_UserKey] ON [dbo].[UserStage]
(
	[UserKey] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO



--------------------------------UserPermission table---------------------------------------

/****** Object:  Index [UserPermissionStage_UserKey]    Script Date: 15-06-2024 11:57:06 ******/
CREATE NONCLUSTERED INDEX [UserPermissionStage_UserKey] ON [dbo].[UserPermissionStage]
(
	[UserKey] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


--------------------------------ConnectAccount table---------------------------------------

/****** Object:  Index [ConnectAccountStage_AccountKey]    Script Date: 15-06-2024 11:58:05 ******/
CREATE NONCLUSTERED INDEX [ConnectAccountStage_AccountKey] ON [dbo].[ConnectAccount]
(
	[AccountKey] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


--------------------------------ConnectUserAccount table---------------------------------------
/****** Object:  Index [ConnectUserAccountStage_UserKey]    Script Date: 15-06-2024 12:01:00 ******/
CREATE NONCLUSTERED INDEX [ConnectUserAccountStage_UserKey] ON [dbo].[ConnectUserAccountStage]
(
	[UserKey] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


--------------------------------UserPermission table---------------------------------------

/****** Object:  Index [UserPermission_UserKey_PermissionCode]    Script Date: 17-10-2024 11:55:03 ******/
CREATE NONCLUSTERED INDEX [UserPermission_UserKey_PermissionCode] ON [dbo].[UserPermission]
(
	[UserKey], PermissionCode
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

