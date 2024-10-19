/****** Object:  StoredProcedure [dbo].[sp_GetToBeChallengedAudits]    Script Date: 16-08-2024 22:01:27 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetToBeChallengedAudits]
	@limit DATETIME,
    @locationsIds [dbo].[GuidList] READONLY,
	@cultureCode NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT sr.ServiceResponseId,
           lo.[Name] AS LocationName,
           st.[Name] AS SurveyName,
           lo.LocationIdentifier,
           lv.VisitStartTime,
           lv.LocationId,
           lo.AccountId
    FROM [Location] lo
	JOIN LocationVisit lv ON lo.LocationId = lv.LocationId
	JOIN ServiceResponse sr ON  lv.LocationVisitId = sr.LocationVisitId
	JOIN VisitService vs ON sr.VisitServiceId = vs.VisitServiceId
	JOIN SurveyTranslation st ON vs.SurveyId = st.SurveyId
	WHERE lv.LocationVisitStateId >= 9
	AND lv.IsActive = 1
	AND lo.IsActive = 1
	AND lv.LocationId IN (SELECT Id FROM @locationsIds)
	AND lv.VisitStartTime > @limit
	AND st.CultureCode = @cultureCode
END
