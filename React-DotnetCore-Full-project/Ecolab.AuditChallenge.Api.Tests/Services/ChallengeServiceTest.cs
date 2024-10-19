using AutoMapper;
using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Services;
using Ecolab.AuditChallenge.Api.Unit.Tests.MockData;
using Ecolab.AuditChallenge.Database.AuditChallenge;
using NSubstitute;
using NUnit.Framework.Internal;
using NSubstitute.ExceptionExtensions;

namespace Ecolab.AuditChallenge.Api.Unit.Tests.Services
{
    [TestFixture]
    public class ChallengeServiceTest
    {
        private IUnitOfWork _uow;
        private IMapper _mapper;
        private IConfigReader _configuration;
        private IConfigurationService _configurationService;
        
        private IChallengeService _challengeService;
        private Microsoft.Extensions.Logging.ILogger<ChallengeService> _logger;

        [SetUp]
        public void Setup()
        {
            _uow = Substitute.For<IUnitOfWork>();
            _mapper = Substitute.For<IMapper>();
            _configuration = Substitute.For<IConfigReader>();
            _configurationService = Substitute.For<IConfigurationService>();
            
            _logger = Substitute.For<Microsoft.Extensions.Logging.ILogger<ChallengeService>>();
            _challengeService = new ChallengeService(_uow,_mapper,_configurationService,_configuration,_logger);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_ListOfChallengeAuditModel()
        {
            _uow.ChallengedAudits.GetChallengedAuditsByLocations(Arg.Any<List<Guid>>(), Arg.Any<DateTime>()).Returns(ChallengeAuditMockData.FakeChallengeAudits());

            var result = await _challengeService.GetChallengeAudits(EmsCloudMockData.FakeLocations());

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.True);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_EmptyListOfChallengeAuditModel_IfLocationsEmpty()
        {
            var result = await _challengeService.GetChallengeAudits(new List<Guid>());

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_EmptyListOfChallengeAuditModel_IfLocationsNUll()
        {
            var result = await _challengeService.GetChallengeAudits(null);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetChallengeAudits_Returns_EmptyListOfChallengeAuditModel_IfThereIsAnException()
        {
            var mockException = new Exception("GetChallengeAudits Test Exception");
            var result = await Task.FromResult(_challengeService.GetChallengeAudits(null).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

    }
}