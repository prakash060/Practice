using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Models.Challenge;

namespace Ecolab.AuditChallenge.Api.Unit.Tests.MockData
{
    public static class EmsCloudMockData
    {
        public static List<Guid> FakeLocations()
        {
            var fakeLocations = new List<Guid>
            {
                CommonFakeData.LocationId1,
                CommonFakeData.LocationId2
            };

            return fakeLocations;
        }

        public static List<ChallengeAuditModel> FakeEmsAudits()
        {
            var fakeEmsAudits = new List<ChallengeAuditModel>
            {
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId1,
                   SurveyName ="Test survey1",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=1,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },

               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId2,
                   SurveyName ="Test survey2",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               }
            };

            return fakeEmsAudits;
        }

        public static List<ChallengeQuestionModel> FakeChallengeQuestions()
        {
            var fakeChallengeQuestions = new List<ChallengeQuestionModel>
            {
                new ChallengeQuestionModel
                {
                    ChallengeNotes = "Test",
                    ChangedDate= DateTime.Now,
                    Id= CommonFakeData.ChallengeQuestionId1,
                    IsActive= true,
                    ServiceResponseId= CommonFakeData.ServiceResponseId1,
                    SurveyQuestionId = CommonFakeData.SurveyQuestionId1
                },
                new ChallengeQuestionModel
                {
                    ChallengeNotes = "Test",
                    ChangedDate= DateTime.Now,
                    Id= CommonFakeData.ChallengeQuestionId2,
                    IsActive= true,
                    ServiceResponseId= CommonFakeData.ServiceResponseId2,
                    SurveyQuestionId = CommonFakeData.SurveyQuestionId2
                }
            };

            return fakeChallengeQuestions;
        }

        public static ServiceReportModel FakeServiceReportModel()
        {
            var fakeServiceReportModel = new ServiceReportModel
            {
                ServiceReportId = new Guid(),
                ServiceResponseId = CommonFakeData.ServiceResponseId1,
                ChangeDate= DateTime.Now,
                IsActive= true,
                CultureCode = "en-US",
                ReportPath = "Test path"
            };

            return fakeServiceReportModel;
        }
    }
}
