using Ecolab.AuditChallenge.Api.Enums;
using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Models.Admin;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;
using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Api.Unit.Tests.MockData
{
    public static class ChallengeAuditMockData
    {
        public static List<ReviewAuditModel> FakeReviewAudits()
        {
            var fakeAudits = new List<ReviewAuditModel>
            {
                new ReviewAuditModel
                {
                    Id = CommonFakeData.ChallengeAuditId1,
                    AccountId= CommonFakeData.AccountId1,
                    LocationId = CommonFakeData.LocationId1,
                    ChallengedBy= "Test 1",
                    ChallengedDate= DateTime.Now,
                    ChangedDate= DateTime.Now,
                    FindingsCount= 10,
                },
                new ReviewAuditModel
                {
                    Id = CommonFakeData.ChallengeAuditId2,
                    AccountId= CommonFakeData.AccountId1,
                    LocationId = CommonFakeData.LocationId2,
                    ChallengedBy= "Test 2",
                    ChallengedDate= DateTime.Now,
                    ChangedDate= DateTime.Now,
                    FindingsCount= 5,
                }
            };

            return fakeAudits;
        }

        public static List<ChallengeAuditModel> FakeChallengeAuditModels()
        {
            var fakeEmsAudits = new List<ChallengeAuditModel>
            {
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId3,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=1,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= CommonFakeData.ChallengeAuditId1,
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.Submitted, StatusText = "Submitted" },
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),

               },

               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId4,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= CommonFakeData.ChallengeAuditId1,
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.Approved, StatusText = "Approved" },
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId5,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.PartiallyApproved, StatusText = "PartiallyApproved" },
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId6,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.PartiallyReviewed, StatusText = "PartiallyReviewed" },
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId7,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.New, StatusText = "New" },
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId8,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.Declined, StatusText = "Declined" },
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId9,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.Submitted, StatusText = "Submitted" },
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengeAuditModel
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId10,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= new AuditStatus { StatusId = (int)AuditStatusEnum.Closed, StatusText = "Closed" },
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
                    ChallengedAuditId= CommonFakeData.ChallengeAuditId1,
                    ChallengeNotes = "Test",
                    ChangedDate= DateTime.Now,
                    Id= CommonFakeData.ChallengeQuestionId3,
                    IsActive= true,
                    ServiceResponseId= CommonFakeData.ServiceResponseId3,
                    SurveyQuestionId = CommonFakeData.SurveyQuestionId3
                },
                new ChallengeQuestionModel
                {
                    ChallengedAuditId= CommonFakeData.ChallengeAuditId2,
                    ChallengeNotes = "Test",
                    ChangedDate= DateTime.Now,
                    Id= CommonFakeData.ChallengeQuestionId4,
                    IsActive= true,
                    ServiceResponseId= CommonFakeData.ServiceResponseId4,
                    SurveyQuestionId = CommonFakeData.SurveyQuestionId4
                }
            };

            return fakeChallengeQuestions;
        }

        public static List<ReviewQuestionModel> FakeReviewQuestions()
        {
            var fakeReviewQuestions = new List<ReviewQuestionModel>
            {
                new ReviewQuestionModel
                {
                    ChallengedAuditId= CommonFakeData.ChallengeAuditId1,
                    ChallengeNotes = "Test",
                    ChangedDate= DateTime.Now,
                    Id= CommonFakeData.ChallengeQuestionId3,
                    IsActive= true,
                    ServiceResponseId= CommonFakeData.ServiceResponseId3,
                    SurveyQuestionId = CommonFakeData.SurveyQuestionId3
                },
                new ReviewQuestionModel
                {
                    ChallengedAuditId= CommonFakeData.ChallengeAuditId2,
                    ChallengeNotes = "Test",
                    ChangedDate= DateTime.Now,
                    Id= CommonFakeData.ChallengeQuestionId4,
                    IsActive= true,
                    ServiceResponseId= CommonFakeData.ServiceResponseId4,
                    SurveyQuestionId = CommonFakeData.SurveyQuestionId4
                }
            };

            return fakeReviewQuestions;
        }

        public static ChallengeModel FakeChallengeModel()
        {
            var fakeChallengeModel = new ChallengeModel
            {

                ChallengeAudit = FakeChallengeAuditModels().First(x => x.Id == CommonFakeData.ChallengeAuditId1),
                ChallengeQuestions = FakeChallengeQuestions().Where(x => x.ChallengedAuditId == CommonFakeData.ChallengeAuditId1).ToList(),
                UserName = CommonFakeData.TestEmail1
            };

            return fakeChallengeModel;
        }

        public static ReviewModel FakeReviewModel()
        {
            var fakeReviewModel = new ReviewModel
            {
                ReviewAudit = FakeReviewAudits().First(x => x.Id == CommonFakeData.ChallengeAuditId1),
                ReviewQuestions = FakeReviewQuestions().Where(x => x.ChallengedAuditId == CommonFakeData.ChallengeAuditId1).ToList()
            };

            return fakeReviewModel;
        }

        public static List<ChallengedAudit> FakeChallengeAudits()
        {
            var fakeEmsAuditsByLocations = new List<ChallengedAudit>
            {
               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId3,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=1,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= CommonFakeData.ChallengeAuditId1,
                   IsActive= true,
                   Status= (int)AuditStatusEnum.Submitted,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),

               },

               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId4,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= CommonFakeData.ChallengeAuditId1,
                   IsActive= true,
                   Status= (int)AuditStatusEnum.Approved,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId5,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= (int)AuditStatusEnum.PartiallyApproved,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId6,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status=  (int)AuditStatusEnum.PartiallyReviewed,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId7,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= (int)AuditStatusEnum.New,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId8,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status=  (int)AuditStatusEnum.Declined,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId9,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= (int)AuditStatusEnum.Submitted,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               },
               new ChallengedAudit
               {
                   AccountId= CommonFakeData.AccountId1,
                   ServiceResponseId = CommonFakeData.ServiceResponseId10,
                   SurveyName ="Test survey",
                   LocationId= CommonFakeData.LocationId1,
                   FindingsCount=10,
                   ChangedDate = DateTime.Now,
                   Location = "Test Location",
                   Id= Guid.NewGuid(),
                   IsActive= true,
                   Status= (int)AuditStatusEnum.Closed,
                   UnitNumber = "100",
                   VisitDate = DateTime.Now.AddDays(-200),
               }
            };

            return fakeEmsAuditsByLocations;
        }

        public static List<AccountConfigurationModel> FakeAccountConfigurationModels()
        {
            var fakeAccountConfigurationModels = new List<AccountConfigurationModel>
            {
                new AccountConfigurationModel
                {
                    AccountId = CommonFakeData.AccountId1,
                    AccountName = "Test Account 1",
                    ChangedDate= DateTime.Now,
                    Id = 100,
                    IsActive= true,
                    LimitToChallenge= 100,
                    LimitToReview = 100
                },
                new AccountConfigurationModel
                {
                    AccountId = CommonFakeData.AccountId2,
                    AccountName = "Test Account 2",
                    ChangedDate= DateTime.Now,
                    Id = 100,
                    IsActive= true,
                    LimitToChallenge= 200,
                    LimitToReview = 200
                }
            };

            return fakeAccountConfigurationModels;
        }

        public static List<AccountConfiguration> FakeAccountConfigurations()
        {
            var fakeAccountConfigurations = new List<AccountConfiguration>
            {
                new AccountConfiguration
                {
                    AccountId = CommonFakeData.AccountId1,
                    AccountName = "Test Account 1",
                    ChangedDate= DateTime.Now,
                    Id = 100,
                    IsActive= true,
                    LimitToChallenge= 100,
                    LimitToReview = 100
                },
                new AccountConfiguration
                {
                    AccountId = CommonFakeData.AccountId2,
                    AccountName = "Test Account 2",
                    ChangedDate= DateTime.Now,
                    Id = 100,
                    IsActive= true,
                    LimitToChallenge= 200,
                    LimitToReview = 200
                }
            };

            return fakeAccountConfigurations;
        }

        public static List<RoleConfigurationModel> FakeRoleConfigurationModels()
        {
            var fakeRoleConfigurationModels = new List<RoleConfigurationModel>
            {
                new RoleConfigurationModel
                {
                    RoleId = 1,
                    EmailId = CommonFakeData.TestEmail1,
                    ChangedDate= DateTime.Now,
                    Id = 100,
                    IsActive= true
                },
                new RoleConfigurationModel
                {
                    RoleId = 2,
                    EmailId = CommonFakeData.TestEmail2,
                    ChangedDate= DateTime.Now,
                    Id = 100,
                    IsActive= true
                }
            };

            return fakeRoleConfigurationModels;
        }

        public static List<RoleConfiguration> FakeRoleConfigurations()
        {
            var fakeRoleConfigurations = new List<RoleConfiguration>
            {
                new RoleConfiguration
                {
                    RoleId = 1,
                    EmailId = CommonFakeData.TestEmail1,
                    ChangedDate= DateTime.Now,
                    Id = 100,
                    IsActive= true,
                },
                new RoleConfiguration
                {
                    RoleId = 2,
                    EmailId = CommonFakeData.TestEmail2,
                    ChangedDate= DateTime.Now,
                    Id = 200,
                    IsActive= true
                }
            };

            return fakeRoleConfigurations;
        }
    }
}
