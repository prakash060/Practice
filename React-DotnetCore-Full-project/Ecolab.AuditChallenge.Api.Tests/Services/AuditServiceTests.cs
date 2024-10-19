using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Enums;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;
using Ecolab.AuditChallenge.Api.Services;
using Ecolab.AuditChallenge.Api.Unit.Tests.MockData;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using NSubstitute.ReturnsExtensions;

namespace Ecolab.AuditChallenge.Api.Unit.Tests.Services
{
    [TestFixture]
    public class AuditServiceTests
    {
        
        private IEmsCloudService _emsCloudService;
        private IChallengeService _challengeService;
        private IConfigReader _configuration;
        private Microsoft.Extensions.Logging.ILogger<AuditService> _logger;
        private IBlobService _blobService;
        private IAuditService _auditService;

        [SetUp]
        public void Setup()
        {
            _emsCloudService = Substitute.For<IEmsCloudService>();
            _challengeService = Substitute.For<IChallengeService>();
            _configuration = Substitute.For<IConfigReader>();
            _logger = Substitute.For<Microsoft.Extensions.Logging.ILogger<AuditService>>();
            _blobService= Substitute.For<IBlobService>();
            _auditService = new AuditService(_emsCloudService, _challengeService, _logger, _configuration, _blobService);
        }


        #region GetReviewAudits

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewAudits_Returns_ListOfAudits()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(EmsCloudMockData.FakeLocations());

           _challengeService.GetReviewAudits(Arg.Any<List<Guid>>()).Returns(ChallengeAuditMockData.FakeReviewAudits());

            var result = await _auditService.GetReviewAudits(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewAudits_Returns_EmptyListOfAudits_IfLocationsNotFound()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(new List<Guid>());

            _challengeService.GetReviewAudits(Arg.Any<List<Guid>>()).Returns(ChallengeAuditMockData.FakeReviewAudits());

            var result = await _auditService.GetReviewAudits(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewAudits_Returns_EmptyListOfAudits_IfAuditsNotFound()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(EmsCloudMockData.FakeLocations());

            _challengeService.GetReviewAudits(Arg.Any<List<Guid>>()).Returns(new List<ReviewAuditModel>());

            var result = await _auditService.GetReviewAudits(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewAudits_Returns_EmptyListOfAudits_IfEmailIsNull()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(EmsCloudMockData.FakeLocations());

            _challengeService.GetReviewAudits(Arg.Any<List<Guid>>()).Returns(new List<ReviewAuditModel>());

            var result = await _auditService.GetReviewAudits(null);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewAudits_Returns_EmptyListOfAudits_IfEmailIsEmpty()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(EmsCloudMockData.FakeLocations());

            _challengeService.GetReviewAudits(Arg.Any<List<Guid>>()).Returns(new List<ReviewAuditModel>());

            var result = await _auditService.GetReviewAudits(string.Empty);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewAudits_Returns_EmptyListOfAudits_IfThereIsAnException()
        {
            var mockException = new Exception("GetReviewAudits Test Exception");
            var result = await Task.FromResult(_auditService.GetReviewAudits(CommonFakeData.TestEmail1).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region GetChallengeAudits
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_ListOfAudits()
        {
            _emsCloudService.GetUserLocations(Arg.Any<string>()).Returns(EmsCloudMockData.FakeLocations());
            _emsCloudService.GetEmsAudits(Arg.Any<List<Guid>>()).Returns(EmsCloudMockData.FakeEmsAudits());
            _challengeService.GetChallengeAudits(Arg.Any<List<Guid>>()).Returns(ChallengeAuditMockData.FakeChallengeAuditModels());

            var result = await _auditService.GetChallengeAudits(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.True);

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_IfNoEmsAuditsFound()
        {
            _emsCloudService.GetUserLocations(Arg.Any<string>()).Returns(EmsCloudMockData.FakeLocations());
            _emsCloudService.GetEmsAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());
            _challengeService.GetChallengeAudits(Arg.Any<List<Guid>>()).Returns(ChallengeAuditMockData.FakeChallengeAuditModels());

            var result = await _auditService.GetChallengeAudits(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.True);
                Assert.That(result.ToList(), Has.Count.EqualTo(8));
            });
            result.ToList().ForEach(x =>
            {
                Assert.Multiple(() =>
                {
                    Assert.That(x.Status.StatusId, Is.Not.EqualTo((int)AuditStatusEnum.Challenge));
                    Assert.That(x.Status.StatusText, Is.Not.EqualTo("Challenge"));
                });
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_IfNoChallengedAuditsFound()
        {
            _emsCloudService.GetUserLocations(Arg.Any<string>()).Returns(EmsCloudMockData.FakeLocations());
            _emsCloudService.GetEmsAudits(Arg.Any<List<Guid>>()).Returns(EmsCloudMockData.FakeEmsAudits());
            _challengeService.GetChallengeAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());

            var result = await _auditService.GetChallengeAudits(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.True);
                Assert.That(result.ToList(), Has.Count.EqualTo(2));
            });
            result.ToList().ForEach(x =>
            {
                Assert.Multiple(() =>
                {
                    Assert.That(x.Status.StatusId, Is.EqualTo((int)AuditStatusEnum.Challenge));
                    Assert.That(x.Status.StatusText, Is.EqualTo("Challenge"));
                });
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_NewAudits_And_ChallengedAuditsCombined()
        {
            _emsCloudService.GetUserLocations(Arg.Any<string>()).Returns(EmsCloudMockData.FakeLocations());
            _emsCloudService.GetEmsAudits(Arg.Any<List<Guid>>()).Returns(EmsCloudMockData.FakeEmsAudits());
            _challengeService.GetChallengeAudits(Arg.Any<List<Guid>>()).Returns(ChallengeAuditMockData.FakeChallengeAuditModels());

            var result = await _auditService.GetChallengeAudits(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.True);
                Assert.That(result.ToList(), Has.Count.EqualTo(10));
            });

            //Assert new and challenged audit status
            var challengedIds = ChallengeAuditMockData.FakeChallengeAuditModels().Select(ca => ca.ServiceResponseId).Distinct();
            var newAudits = result.Where(a => !challengedIds.Contains(a.ServiceResponseId)).ToList();
            var challengedAudits = result.Where(a => challengedIds.Contains(a.ServiceResponseId)).ToList();

            Assert.That(newAudits, Has.Count.EqualTo(2));
            newAudits.ForEach(x =>
            {
                Assert.Multiple(() =>
                {
                    Assert.That(x.Status.StatusId, Is.EqualTo((int)AuditStatusEnum.Challenge));
                    Assert.That(x.Status.StatusText, Is.EqualTo("Challenge"));
                });
            });

            Assert.That(challengedAudits, Has.Count.EqualTo(8));
            challengedAudits.ForEach(x =>
            {
                Assert.Multiple(() =>
                {
                    Assert.That(x.Status.StatusId, Is.Not.EqualTo((int)AuditStatusEnum.Challenge));
                    Assert.That(x.Status.StatusText, Is.Not.EqualTo("Challenge"));
                });
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_EmptyListOfAudits_IfEmailIsNull()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(EmsCloudMockData.FakeLocations());
            _emsCloudService.GetEmsAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());
            _challengeService.GetChallengeAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());

            var result = await _auditService.GetChallengeAudits(null);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_EmptyListOfAudits_IfEmailIsEmpty()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(EmsCloudMockData.FakeLocations());
            _emsCloudService.GetEmsAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());
            _challengeService.GetChallengeAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());

            var result = await _auditService.GetChallengeAudits(string.Empty);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_EmptyListOfAudits_IfNoLocationsFound()
        {
            _emsCloudService.GetUserLocations(CommonFakeData.TestEmail1).Returns(new List<Guid>());
            _emsCloudService.GetEmsAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());
            _challengeService.GetChallengeAudits(Arg.Any<List<Guid>>()).Returns(new List<ChallengeAuditModel>());

            var result = await _auditService.GetChallengeAudits(string.Empty);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_EmptyListOfAudits_IfThereIsAnException()
        {
            var mockException = new Exception("GetReviewAudits Test Exception");
            var result = await Task.FromResult(_auditService.GetChallengeAudits(CommonFakeData.TestEmail1).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region GetChallengeQuestions
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeQuestions_Returns_ListOfChallengeQuestions()
        {
            _emsCloudService.GetEmsAuditQuestions(Arg.Any<Guid>()).Returns(EmsCloudMockData.FakeChallengeQuestions());
            _challengeService.GetChallengeQuestions(Arg.Any<Guid>()).Returns(ChallengeAuditMockData.FakeChallengeQuestions());

            var result = await _auditService.GetChallengeQuestions(CommonFakeData.ServiceResponseId1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.True);

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeQuestions_WhenNoEmsQuestions_Returns_ListOfChallengeQuestions()
        {
            _emsCloudService.GetEmsAuditQuestions(Arg.Any<Guid>()).Returns(new List<ChallengeQuestionModel>());
            _challengeService.GetChallengeQuestions(Arg.Any<Guid>()).Returns(ChallengeAuditMockData.FakeChallengeQuestions());

            var result = await _auditService.GetChallengeQuestions(CommonFakeData.ServiceResponseId1);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.True);
                Assert.That(result.ToList(), Has.Count.EqualTo(2));
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeQuestions_WhenNoChallengeQuestions_Returns_ListOfChallengeQuestions()
        {
            _emsCloudService.GetEmsAuditQuestions(Arg.Any<Guid>()).Returns(EmsCloudMockData.FakeChallengeQuestions());
            _challengeService.GetChallengeQuestions(Arg.Any<Guid>()).Returns(new List<ChallengeQuestionModel>());

            var result = await _auditService.GetChallengeQuestions(CommonFakeData.ServiceResponseId1);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.True);
                Assert.That(result.ToList(), Has.Count.EqualTo(2));
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeQuestions_WhenNoQuestions_Returns_EmptyListOfChallengeQuestions()
        {
            _emsCloudService.GetEmsAuditQuestions(Arg.Any<Guid>()).Returns(new List<ChallengeQuestionModel>());
            _challengeService.GetChallengeQuestions(Arg.Any<Guid>()).Returns(new List<ChallengeQuestionModel>());

            var result = await _auditService.GetChallengeQuestions(CommonFakeData.ServiceResponseId1);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.False);
                Assert.That(result.ToList(), Has.Count.EqualTo(0));
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeQuestions_Returns_EmptyListOfQuestions_IfThereIsAnException()
        {
            var mockException = new Exception("GetChallengeQuestions Test Exception");
            var result = await Task.FromResult(_auditService.GetChallengeQuestions(CommonFakeData.ServiceResponseId1).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }
        #endregion

        #region GetReviewQuestions

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewQuestions_Returns_ListOfReviewQuestions()
        {
            _challengeService.GetReviewQuestions(Arg.Any<Guid>()).Returns(ChallengeAuditMockData.FakeReviewQuestions());

            var result = await _auditService.GetReviewQuestions(CommonFakeData.ServiceResponseId3);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.True);
                Assert.That(result.ToList(), Has.Count.EqualTo(2));
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewQuestions_Returns_EmptyListOfReviewQuestions()
        {
            _challengeService.GetReviewQuestions(Arg.Any<Guid>()).Returns(new List<ReviewQuestionModel>());

            var result = await _auditService.GetReviewQuestions(CommonFakeData.ServiceResponseId3);

            Assert.That(result, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(result.ToList().Any(), Is.False);
                Assert.That(result.ToList(), Has.Count.EqualTo(0));
            });

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetReviewQuestions_Returns_EmptyListOfQuestions_IfThereIsAnException()
        {
            var mockException = new Exception("GetReviewQuestions Test Exception");
            var result = await Task.FromResult(_auditService.GetReviewQuestions(CommonFakeData.ServiceResponseId1).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }
        #endregion

        #region SaveChallenge
        [Test]
        [Author("Prakash Betageri")]
        public void Test_SaveChallenge_SavesData()
        {
            _challengeService.SaveChallenge(ChallengeAuditMockData.FakeChallengeModel()).Returns(Task.FromResult(""));
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_SaveChallenge_ThrowsEception_IfArgumentIsNul()
        {
            _challengeService.SaveChallenge(null).Returns(Task.FromResult(""));
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_SaveChallenge_LogsError_IfThereIsAnException()
        {
            var mockException = new Exception("SaveChallenge Test Exception");
            var result = await Task.FromResult(_auditService.SaveChallenge(ChallengeAuditMockData.FakeChallengeModel()).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }
        #endregion

        #region SaveReview
        [Test]
        [Author("Prakash Betageri")]
        public void Test_SaveReview_SavesData()
        {
            _challengeService.SaveReview(ChallengeAuditMockData.FakeReviewModel()).Returns(Task.FromResult(""));
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_SaveReview_ThrowsEception_IfArgumentIsNul()
        {
            _challengeService.SaveChallenge(null).Returns(Task.FromResult(""));
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_SaveReview_LogsError_IfThereIsAnException()
        {
            var mockException = new Exception("SaveReview Test Exception");
            var result = await Task.FromResult(_auditService.SaveReview(ChallengeAuditMockData.FakeReviewModel()).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }
        #endregion

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetServiceReportPath_Returns_ReportPath()
        {
            _emsCloudService.GetServiceReportDetails(CommonFakeData.ServiceResponseId1).Returns(EmsCloudMockData.FakeServiceReportModel());

            var result = await _auditService.GetServiceReportPath(CommonFakeData.ServiceResponseId1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetServiceReportPath_Returns_EmptyPath_IfNoServiceReportDetailsFound()
        {
            _emsCloudService.GetServiceReportDetails(CommonFakeData.ServiceResponseId1).ReturnsNull();

            var result = await _auditService.GetServiceReportPath(CommonFakeData.ServiceResponseId1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Empty);

            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetServiceReportPath_LogsError_IfThereIsAnException()
        {
            var mockException = new Exception("GetServiceReportPath Test Exception");
            var result = await Task.FromResult(_auditService.GetServiceReportPath(CommonFakeData.ServiceResponseId1).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

    }
}
