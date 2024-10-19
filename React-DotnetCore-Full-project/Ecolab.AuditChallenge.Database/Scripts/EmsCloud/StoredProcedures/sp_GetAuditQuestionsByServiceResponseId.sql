/****** Object:  StoredProcedure [dbo].[sp_GetAuditQuestionsByServiceResponseId]    Script Date: 28-06-2024 11:52:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAuditQuestionsByServiceResponseId]
	@serviceResponseId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM SurveyResponseDetail srd
	join Observation ob on srd.SurveyResponseDetailId = ob.SurveyResponseDetailId
	join ObservationIssue oi on ob.ObservationId = oi.ObservationId
	join IssueTranslation it on oi.IssueId = it.IssueId
	join SurveyQuestionDetail sqd on srd.SurveyQuestionId = sqd.SurveyQuestionId
	join SurveyQuestionTranslation sqt on sqd.SurveyQuestionId = sqt.SurveyQuestionId
    where srd.ServiceResponseSurveyId = @serviceResponseId
					  and sqd.IsCurrentlyActive = 1
                      and it.IsActive = 1 
					  and it.IsActive = 1
                      and oi.IsActive = 1
                      and ob.IsActive = 1
                      and sqt.IsCurrentlyActive = 1
END
GO
