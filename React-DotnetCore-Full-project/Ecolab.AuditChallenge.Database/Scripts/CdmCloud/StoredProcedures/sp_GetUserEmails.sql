/****** Object:  StoredProcedure [dbo].[sp_GetAccountNumbersForUser]    Script Date: 15-06-2024 11:52:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserEmails]
    @applicationCode NVARCHAR(100),
	@submitterCode NVARCHAR(100),
	@approverCode NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.Email FROM [User] u
    JOIN UserPermission up ON u.UserKey = up.UserKey
    WHERE up.ApplicationCode = @applicationCode
    AND (up.PermissionCode = @submitterCode OR up.PermissionCode = @approverCode)
END
GO
