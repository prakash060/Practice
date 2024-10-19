/****** Object:  StoredProcedure [dbo].[sp_GetAccountNumbersForUser]    Script Date: 15-06-2024 11:52:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_GetAccountNumbersForUser]
    @email NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ca.AccountNumber, ca.AccountName FROM UserStage u
	JOIN ConnectUserAccountStage cua ON u.UserKey = cua.UserKey
	JOIN ConnectAccountStage ca ON ca.AccountKey = cua.AccountKey
	WHERE u.Email = @email
END
GO


