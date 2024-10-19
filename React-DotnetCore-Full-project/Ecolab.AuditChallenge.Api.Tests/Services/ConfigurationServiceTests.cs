using AutoMapper;
using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Models.Admin;
using Ecolab.AuditChallenge.Api.Services;
using Ecolab.AuditChallenge.Api.Unit.Tests.MockData;
using Ecolab.AuditChallenge.Database.AuditChallenge;
using Ecolab.AuditChallenge.Database.AuditChallenge.Models;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using NSubstitute.ReturnsExtensions;

namespace Ecolab.AuditChallenge.Api.Unit.Tests.Services
{
    public class ConfigurationServiceTests
    {
        private IUnitOfWork _uow;
        private IMapper _mapper;
        private Microsoft.Extensions.Logging.ILogger<ConfigurationService> _logger;
        private IConfigurationService _configurationService;

        [SetUp]
        public void Setup()
        {
            _uow = Substitute.For<IUnitOfWork>();
            _mapper = Substitute.For<IMapper>();
            _logger = Substitute.For<Microsoft.Extensions.Logging.ILogger<ConfigurationService>>();
            _configurationService = new ConfigurationService(_uow, _mapper, _logger);
        }

        #region GetAccountConfigurations
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurations_Returns_ListOfAccountConfigurationModel()
        {
            _uow.AccountConfigurations.GetAccountConfigurations().Returns(ChallengeAuditMockData.FakeAccountConfigurations());

            var result = await _configurationService.GetAccountConfigurations();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.True);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurations_Returns_EmptyListOfAccountConfigurationModel()
        {
            _uow.AccountConfigurations.GetAccountConfigurations().Returns(new List<AccountConfiguration>());

            var result = await _configurationService.GetAccountConfigurations();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurations_Returns_EmptyList_WhenMapperThorwsException_ForValidList()
        {
            var mockException = new Exception("GetAccountConfigurations Test Exception");
            var mockedList = ChallengeAuditMockData.FakeAccountConfigurations();
            _uow.AccountConfigurations.GetAccountConfigurations().Returns(mockedList);
            _mapper.Map<AccountConfigurationModel>(mockedList).Throws(mockException);

            var result = await Task.FromResult(_configurationService.GetAccountConfigurations().Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurations_Returns_EmptyList_WhenMapperThorwsException_ForEmptyList()
        {
            var mockException = new Exception("GetAccountConfigurations Test Exception");
            var emptyList = new List<AccountConfiguration>();
            _uow.AccountConfigurations.GetAccountConfigurations().Returns(emptyList);
            _mapper.Map<AccountConfigurationModel>(emptyList).Throws(mockException);

            var result = await _configurationService.GetAccountConfigurations();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurations_Returns_EmptyList_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("GetAccountConfigurations Test Exception");
            var result = await Task.FromResult(_configurationService.GetAccountConfigurations().Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region GetAccountConfigurationByAccountId
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurationByAccountId_Returns_AccountConfigurationModel()
        {
            var fakeModel = ChallengeAuditMockData.FakeAccountConfigurations().First(x=> x.AccountId.Equals(CommonFakeData.AccountId1));
            _uow.AccountConfigurations.GetAccountConfigurationByAccountId(Arg.Any<Guid>()).Returns(fakeModel);

            var result = await _configurationService.GetAccountConfigurationByAccountId(Arg.Any<Guid>());

            Assert.That(result, Is.Not.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurationByAccountId_Returns_EmptyAccountConfigurationModel_IfAccountNotFound()
        {
            _uow.AccountConfigurations.GetAccountConfigurationByAccountId(Arg.Any<Guid>()).ReturnsNull();

            var result = await _configurationService.GetAccountConfigurationByAccountId(Arg.Any<Guid>());

            Assert.That(result, Is.Not.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurationByAccountId_Returns_EmptyAccountConfigurationModel_IfUoWThorwsException()
        {
            var mockException = new Exception("GetAccountConfigurationByAccountId Test Exception");
            _uow.AccountConfigurations.GetAccountConfigurationByAccountId(Arg.Any<Guid>()).Throws(mockException);

            var result = await _configurationService.GetAccountConfigurationByAccountId(Arg.Any<Guid>());

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurationByAccountId_Returns_EmptyAccountConfigurationModel_IfMapperThorwsException()
        {
            var mockException = new Exception("GetAccountConfigurationByAccountId Test Exception");
            _mapper.Map<AccountConfigurationModel>(null).Throws(mockException);

            var result = await _configurationService.GetAccountConfigurationByAccountId(Arg.Any<Guid>());

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurationByAccountId_Returns_EmptyModel_IfMapperAndUoWThorwsException()
        {
            var mockException = new Exception("GetAccountConfigurationByAccountId Test Exception");
            _uow.AccountConfigurations.GetAccountConfigurationByAccountId(Arg.Any<Guid>()).Throws(mockException);
            _mapper.Map<AccountConfigurationModel>(null).Throws(mockException);

            var result = await _configurationService.GetAccountConfigurationByAccountId(Arg.Any<Guid>());

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetAccountConfigurationByAccountId_Returns_EmptyList_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("GetAccountConfigurationByAccountId Test Exception");
            var result = await Task.FromResult(_configurationService.GetAccountConfigurations().Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region CreateAccountConfiguration
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_AccountConfigurationModel()
        {
            var fakeAccountConfiguration = ChallengeAuditMockData.FakeAccountConfigurations().First(x => x.AccountId.Equals(CommonFakeData.AccountId1));
            var fakeAccountConfigurationModel = ChallengeAuditMockData.FakeAccountConfigurationModels().First(x => x.AccountId.Equals(CommonFakeData.AccountId1));

            _mapper.Map<AccountConfigurationModel>(Arg.Any<AccountConfiguration>()).Returns(fakeAccountConfigurationModel);
            _mapper.Map<AccountConfiguration>(Arg.Any<AccountConfigurationModel>()).Returns(fakeAccountConfiguration);
            _uow.AccountConfigurations.InsertAccountConfiguration(fakeAccountConfiguration).Returns(fakeAccountConfiguration);

            var result = await _configurationService.CreateAccountConfiguration(fakeAccountConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_AccountConfigurationModel_IfInputIsNull()
        {
            var fakeAccountConfiguration = ChallengeAuditMockData.FakeAccountConfigurations().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));
            var fakeAccountConfigurationModel = ChallengeAuditMockData.FakeAccountConfigurationModels().FirstOrDefault(x => x.AccountId.Equals(new Guid()));

            _mapper.Map<AccountConfigurationModel>(Arg.Any<AccountConfiguration>()).Returns(fakeAccountConfigurationModel);
            _mapper.Map<AccountConfiguration>(Arg.Any<AccountConfigurationModel>()).Returns(fakeAccountConfiguration);
            _uow.AccountConfigurations.InsertAccountConfiguration(fakeAccountConfiguration).Returns(fakeAccountConfiguration);

            var result = await _configurationService.CreateAccountConfiguration(fakeAccountConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_EmptyModel_IfInputMapperThorwsException()
        {

            var mockException = new Exception("CreateAccountConfiguration Test Exception");
            var fakeAccountConfiguration = ChallengeAuditMockData.FakeAccountConfigurations().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));
            var fakeAccountConfigurationModel = ChallengeAuditMockData.FakeAccountConfigurationModels().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));

            _mapper.Map<AccountConfigurationModel>(Arg.Any<AccountConfiguration>()).Throws(mockException);
            _mapper.Map<AccountConfiguration>(Arg.Any<AccountConfigurationModel>()).Returns(fakeAccountConfiguration);
            _uow.AccountConfigurations.InsertAccountConfiguration(fakeAccountConfiguration).Returns(fakeAccountConfiguration);

            var result = await _configurationService.CreateAccountConfiguration(fakeAccountConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_EmptyModel_IfOutputMapperThorwsException()
        {

            var mockException = new Exception("CreateAccountConfiguration Test Exception");
            var fakeAccountConfiguration = ChallengeAuditMockData.FakeAccountConfigurations().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));
            var fakeAccountConfigurationModel = ChallengeAuditMockData.FakeAccountConfigurationModels().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));

            _mapper.Map<AccountConfigurationModel>(Arg.Any<AccountConfiguration>()).Returns(fakeAccountConfigurationModel);
            _mapper.Map<AccountConfiguration>(Arg.Any<AccountConfigurationModel>()).Throws(mockException);
            _uow.AccountConfigurations.InsertAccountConfiguration(fakeAccountConfiguration).Returns(fakeAccountConfiguration);

            var result = await _configurationService.CreateAccountConfiguration(fakeAccountConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_EmptyModel_IfBothInputAndOutputMapperThorwsException()
        {

            var mockException = new Exception("CreateAccountConfiguration Test Exception");
            var fakeAccountConfiguration = ChallengeAuditMockData.FakeAccountConfigurations().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));
            var fakeAccountConfigurationModel = ChallengeAuditMockData.FakeAccountConfigurationModels().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));

            _mapper.Map<AccountConfigurationModel>(Arg.Any<AccountConfiguration>()).Throws(mockException);
            _mapper.Map<AccountConfiguration>(Arg.Any<AccountConfigurationModel>()).Throws(mockException);
            _uow.AccountConfigurations.InsertAccountConfiguration(fakeAccountConfiguration).Returns(fakeAccountConfiguration);

            var result = await _configurationService.CreateAccountConfiguration(fakeAccountConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_EmptyModel_IfUoWThorwsException()
        {

            var mockException = new Exception("CreateAccountConfiguration Test Exception");
            var fakeAccountConfiguration = ChallengeAuditMockData.FakeAccountConfigurations().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));
            var fakeAccountConfigurationModel = ChallengeAuditMockData.FakeAccountConfigurationModels().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));

            _mapper.Map<AccountConfigurationModel>(Arg.Any<AccountConfiguration>()).Returns(fakeAccountConfigurationModel);
            _mapper.Map<AccountConfiguration>(Arg.Any<AccountConfigurationModel>()).Returns(fakeAccountConfiguration);
            _uow.AccountConfigurations.InsertAccountConfiguration(fakeAccountConfiguration).Throws(mockException);

            var result = await _configurationService.CreateAccountConfiguration(fakeAccountConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_EmptyModel_IfSaveThorwsException()
        {

            var mockException = new Exception("CreateAccountConfiguration Test Exception");
            var fakeAccountConfiguration = ChallengeAuditMockData.FakeAccountConfigurations().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));
            var fakeAccountConfigurationModel = ChallengeAuditMockData.FakeAccountConfigurationModels().FirstOrDefault(x => x.AccountId.Equals(CommonFakeData.AccountId1));

            _mapper.Map<AccountConfigurationModel>(Arg.Any<AccountConfiguration>()).Returns(fakeAccountConfigurationModel);
            _mapper.Map<AccountConfiguration>(Arg.Any<AccountConfigurationModel>()).Returns(fakeAccountConfiguration);
            _uow.Save().Throws(mockException);

            var result = await _configurationService.CreateAccountConfiguration(fakeAccountConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateAccountConfiguration_Returns_EmptyModel_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("CreateAccountConfiguration Test Exception");
            var result = await Task.FromResult(_configurationService.CreateAccountConfiguration(null).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region DeleteAccountConfiguration
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteAccountConfiguration_DeletesRecord()
        {
            await _configurationService.DeleteAccountConfiguration(Arg.Any<int>());
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteAccountConfiguration_DeleteFails_When_UoWThrowsAnException()
        {
            var mockException = new Exception("DeleteAccountConfiguration test exception");
            _uow.AccountConfigurations.DeleteAccountConfiguration(1).Throws(mockException);
            await _configurationService.DeleteAccountConfiguration(1);

            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteAccountConfiguration_DeleteFails_When_SaveThrowsAnException()
        {
            var mockException = new Exception("DeleteAccountConfiguration test exception");
            _uow.Save().Throws(mockException);
            await _configurationService.DeleteAccountConfiguration(1);

            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteAccountConfiguration_Returns_EmptyModel_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("DeleteAccountConfiguration Test Exception");
            var result = await Task.FromResult(_configurationService.DeleteAccountConfiguration(Arg.Any<int>()).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }
        #endregion

        #region GetRoleConfigurations
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurations_Returns_ListOfRoleConfigurationModel()
        {
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(ChallengeAuditMockData.FakeRoleConfigurations());

            var result = await _configurationService.GetRoleConfigurations();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.True);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurations_Returns_EmptyListOfRoleConfigurationModel()
        {
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(new List<RoleConfiguration>());

            var result = await _configurationService.GetRoleConfigurations();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurations_Returns_EmptyList_WhenUoWThorwsException()
        {
            var mockException = new Exception("RoleConfigurations Test Exception");
            var mockedList = ChallengeAuditMockData.FakeRoleConfigurations();
            _uow.RoleConfigurations.GetRoleConfigurations().Throws(mockException);
            _mapper.Map<RoleConfigurationModel>(mockedList).Throws(mockException);

            var result = await _configurationService.GetRoleConfigurations();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurations_Returns_EmptyList_ForEmptyList()
        {
            _logger.ClearReceivedCalls();
            var mockException = new Exception("RoleConfigurations Test Exception");
            var emptyList = new List<RoleConfiguration>();
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(emptyList);

            var result = await _configurationService.GetRoleConfigurations();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.ToList().Any(), Is.False);
            _logger.Received(0);
            
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurations_Returns_EmptyList_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("RoleConfigurations Test Exception");
            var result = await Task.FromResult(_configurationService.GetRoleConfigurations().Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region GetRoleConfigurationByEmail
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_RoleConfigurationModel()
        {
            var fakeConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(ChallengeAuditMockData.FakeRoleConfigurations());
            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeConfigurationModel);

            var result = await _configurationService.GetRoleConfigurationByEmail(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_Null_WhenEmailIsNull()
        {
           
            var result = await _configurationService.GetRoleConfigurationByEmail(null);

            Assert.That(result, Is.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_Null_WhenEmailIsEmpty()
        {

            var result = await _configurationService.GetRoleConfigurationByEmail(string.Empty);

            Assert.That(result, Is.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_Null_WhenUoWReturnsNull()
        {
            var fakeConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            _uow.RoleConfigurations.GetRoleConfigurations().ReturnsNull();
            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeConfigurationModel);

            var result = await _configurationService.GetRoleConfigurationByEmail(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_Null_WhenUoWReturnsEmptyList()
        {
            var fakeConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(new List<RoleConfiguration>());
            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeConfigurationModel);

            var result = await _configurationService.GetRoleConfigurationByEmail(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_Null_WhenNoMatchingEmailFound()
        {
            var fakeConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(ChallengeAuditMockData.FakeRoleConfigurations());
            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeConfigurationModel);

            var result = await _configurationService.GetRoleConfigurationByEmail("FakeEmail@xyz.com");

            Assert.That(result, Is.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_Null_WhenMapperReturnsNull()
        {
            var fakeConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(ChallengeAuditMockData.FakeRoleConfigurations());
            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).ReturnsNull();

            var result = await _configurationService.GetRoleConfigurationByEmail(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_EmptyObject_WhenUoWThrowsException()
        {
            var mockException = new Exception("GetRoleConfigurationByEmail Test Exception");
            var fakeConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            _uow.RoleConfigurations.GetRoleConfigurations().Throws(mockException);
            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeConfigurationModel);

            var result = await _configurationService.GetRoleConfigurationByEmail(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_EmptyObject_WhenMapperThrowsException()
        {
            var mockException = new Exception("GetRoleConfigurationByEmail Test Exception");
            var fakeConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().FirstOrDefault(x => x.EmailId == CommonFakeData.TestEmail1);
            _uow.RoleConfigurations.GetRoleConfigurations().Returns(ChallengeAuditMockData.FakeRoleConfigurations());
            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Throws(mockException);

            var result = await _configurationService.GetRoleConfigurationByEmail(CommonFakeData.TestEmail1);

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_GetRoleConfigurationByEmail_Returns_EmptyList_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("GetRoleConfigurationByEmail Test Exception");
            var result = await Task.FromResult(_configurationService.GetRoleConfigurationByEmail(CommonFakeData.TestEmail1).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region CreateRoleConfiguration
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateRoleConfiguration_Returns_RoleConfigurationModel()
        {
            var fakeRoleConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().First(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeRoleConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().First(x => x.EmailId == CommonFakeData.TestEmail1);

            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeRoleConfigurationModel);
            _mapper.Map<RoleConfiguration>(Arg.Any<RoleConfigurationModel>()).Returns(fakeRoleConfiguration);
            _uow.RoleConfigurations.InsertRoleConfiguration(fakeRoleConfiguration).Returns(fakeRoleConfiguration);

            var result = await _configurationService.CreateRoleConfiguration(fakeRoleConfigurationModel);

            Assert.That(result, Is.Not.Null);
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateRoleConfiguration_ReturnsNull_IfInputIsNull()
        {
            
            var result = await _configurationService.CreateRoleConfiguration(null);

            Assert.That(result, Is.Null);
            _logger.Received(0);
        }


        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateRoleConfiguration_Returns_EmptyModel_IfInputMapperThorwsException()
        {
            var mockException = new Exception("CreateRoleConfiguration Test Exception");
            var fakeRoleConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().First(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeRoleConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().First(x => x.EmailId == CommonFakeData.TestEmail1);

            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeRoleConfigurationModel);
            _mapper.Map<RoleConfiguration>(Arg.Any<RoleConfigurationModel>()).Throws(mockException);
            _uow.RoleConfigurations.InsertRoleConfiguration(fakeRoleConfiguration).Returns(fakeRoleConfiguration);

            var result = await _configurationService.CreateRoleConfiguration(fakeRoleConfigurationModel);

            Assert.That(result, Is.Not.Null);
            Assert.That(string.IsNullOrEmpty(result.EmailId), Is.True);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateRoleConfiguration_Returns_EmptyModel_IfOuputMapperThorwsException()
        {
            var mockException = new Exception("CreateRoleConfiguration Test Exception");
            var fakeRoleConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().First(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeRoleConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().First(x => x.EmailId == CommonFakeData.TestEmail1);

            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Throws(mockException);
            _mapper.Map<RoleConfiguration>(Arg.Any<RoleConfigurationModel>()).Returns(fakeRoleConfiguration);
            _uow.RoleConfigurations.InsertRoleConfiguration(fakeRoleConfiguration).Returns(fakeRoleConfiguration);

            var result = await _configurationService.CreateRoleConfiguration(fakeRoleConfigurationModel);

            Assert.That(result, Is.Not.Null);
            Assert.That(string.IsNullOrEmpty(result.EmailId), Is.True);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateRoleConfiguration_Returns_EmptyModel_IfUoWThorwsException()
        {
            var mockException = new Exception("CreateRoleConfiguration Test Exception");
            var fakeRoleConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().First(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeRoleConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().First(x => x.EmailId == CommonFakeData.TestEmail1);

            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeRoleConfigurationModel);
            _mapper.Map<RoleConfiguration>(Arg.Any<RoleConfigurationModel>()).Returns(fakeRoleConfiguration);
            _uow.RoleConfigurations.InsertRoleConfiguration(fakeRoleConfiguration).Throws(mockException);

            var result = await _configurationService.CreateRoleConfiguration(fakeRoleConfigurationModel);

            Assert.That(result, Is.Not.Null);
            Assert.That(string.IsNullOrEmpty(result.EmailId), Is.True);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateRoleConfiguration_Returns_EmptyModel_IfSaveThorwsException()
        {
            var mockException = new Exception("CreateRoleConfiguration Test Exception");
            var fakeRoleConfiguration = ChallengeAuditMockData.FakeRoleConfigurations().First(x => x.EmailId == CommonFakeData.TestEmail1);
            var fakeRoleConfigurationModel = ChallengeAuditMockData.FakeRoleConfigurationModels().First(x => x.EmailId == CommonFakeData.TestEmail1);

            _mapper.Map<RoleConfigurationModel>(Arg.Any<RoleConfiguration>()).Returns(fakeRoleConfigurationModel);
            _mapper.Map<RoleConfiguration>(Arg.Any<RoleConfigurationModel>()).Returns(fakeRoleConfiguration);
            _uow.RoleConfigurations.InsertRoleConfiguration(fakeRoleConfiguration).Returns(fakeRoleConfiguration);
            _uow.Save().Throws(mockException);

            var result = await _configurationService.CreateRoleConfiguration(fakeRoleConfigurationModel);

            Assert.That(result, Is.Not.Null);
            Assert.That(string.IsNullOrEmpty(result.EmailId), Is.True);
            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_CreateRoleConfiguration_Returns_EmptyModel_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("CreateRoleConfiguration Test Exception");
            var result = await Task.FromResult(_configurationService.CreateRoleConfiguration(null).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }

        #endregion

        #region DeleteRoleConfiguration
        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteRoleConfiguration_DeletesRecord()
        {
            await _configurationService.DeleteRoleConfiguration(Arg.Any<int>());
            _logger.Received(0);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteRoleConfiguration_DeleteFails_When_UoWThrowsAnException()
        {
            var mockException = new Exception("DeleteRoleConfiguration test exception");
            _uow.RoleConfigurations.DeleteRoleConfiguration(1).Throws(mockException);
            await _configurationService.DeleteRoleConfiguration(1);

            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteRoleConfiguration_DeleteFails_When_SaveThrowsAnException()
        {
            var mockException = new Exception("DeleteRoleConfiguration test exception");
            _uow.Save().Throws(mockException);
            await _configurationService.DeleteRoleConfiguration(1);

            _logger.Received(1);
        }

        [Test]
        [Author("Prakash Betageri")]
        public async Task Test_DeleteRoleConfiguration_Returns_EmptyModel_IfThereIsAnUnhandledException()
        {
            var mockException = new Exception("DeleteRoleConfiguration Test Exception");
            var result = await Task.FromResult(_configurationService.DeleteRoleConfiguration(Arg.Any<int>()).Throws(mockException));

            Assert.That(result, Is.Not.Null);
            _logger.Received(1);
        }
        #endregion
    }
}
