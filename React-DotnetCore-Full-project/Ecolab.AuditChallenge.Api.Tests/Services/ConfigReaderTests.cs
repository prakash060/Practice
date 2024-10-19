using Ecolab.AuditChallenge.Api.Services;
using Ecolab.AuditChallenge.Api.Unit.Tests.MockData;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace Ecolab.AuditChallenge.Api.Unit.Tests.Services
{
    public class ConfigReaderTests
    {
        private IConfiguration _configuration;
        private ConfigReader _confiReader;

        [SetUp]
        public void Setup()
        {
            _configuration = Substitute.For<IConfiguration>();
            _confiReader = new ConfigReader(_configuration);
        }

        #region DefaultCultureCode
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_DefaultCultureCode()
        {
            _configuration["AppSettings:DefaultCultureCode"].Returns("en-Us");

            var result = _confiReader.DefaultCultureCode;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("en-Us"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_DefaultCultureCode_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.DefaultCultureCode;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_DefaultCultureCode_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.DefaultCultureCode;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region DefaultAccountId
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_DefaultAccountId()
        {
            _configuration["AppSettings:DefaultAccountId"].Returns(CommonFakeData.AccountId1.ToString());

            var result = _confiReader.DefaultAccountId;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo(CommonFakeData.AccountId1.ToString()));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_DefaultAccountId_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.DefaultAccountId;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_DefaultAccountId_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.DefaultAccountId;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region DefaultDateFormat
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_DefaultDateFormat()
        {
            _configuration["AppSettings:DefaultDateFormat"].Returns("MM/dd/yyyy H:mm");

            var result = _confiReader.DefaultDateFormat;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("MM/dd/yyyy H:mm"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_DefaultDateFormat_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.DefaultDateFormat;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_DefaultDateFormat_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.DefaultDateFormat;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region AllowedDomains
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_AllowedDomains()
        {
            _configuration["AppSettings:AllowedDomains"].Returns("http://localhost:3000");

            var result = _confiReader.AllowedDomains;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("http://localhost:3000"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_AllowedDomains_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.AllowedDomains;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_AllowedDomains_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.AllowedDomains;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region BaseReportPath
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_BaseReportPath()
        {
            _configuration["AppSettings:BaseReportPath"].Returns("C:/Temp");

            var result = _confiReader.BaseReportPath;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("C:/Temp"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_BaseReportPath_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.BaseReportPath;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_BaseReportPath_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.BaseReportPath;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region Environment
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_Environment()
        {
            _configuration["AppSettings:Environment"].Returns("Dev");

            var result = _confiReader.Environment;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("Dev"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Environment_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.Environment;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Environment_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.Environment;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region ApplicationCode
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_ApplicationCode()
        {
            _configuration["AppSettings:ApplicationCode"].Returns("KEMA");

            var result = _confiReader.ApplicationCode;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("KEMA"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_ApplicationCode_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.ApplicationCode;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_ApplicationCode_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.ApplicationCode;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region EmsIntegrationUrl
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_EmsIntegrationUrl()
        {
            _configuration["AppSettings:EmsIntegrationUrl"].Returns("http://localhost:63242/");

            var result = _confiReader.EmsIntegrationUrl;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("http://localhost:63242/"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_EmsIntegrationUrl_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.EmsIntegrationUrl;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_EmsIntegrationUrl_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.EmsIntegrationUrl;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region EmsCloudSolutionUrl
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_EmsCloudSolutionUrl()
        {
            _configuration["AppSettings:EmsCloudSlnUrl"].Returns("https://localhost:44310/");

            var result = _confiReader.EmsCloudSolutionUrl;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("https://localhost:44310/"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_EmsCloudSolutionUrl_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.EmsCloudSolutionUrl;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_EmsCloudSolutionUrl_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.EmsCloudSolutionUrl;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region FinishVisitStorageConnectionString
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_FinishVisitStorageConnectionString()
        {
            _configuration["AppSettings:FinishVisitStorageConnectionString"].Returns("DefaultEndpointsProtocol=https;AccountName=ecokayfinishvisitsqa;EndpointSuffix=core.windows.net");

            var result = _confiReader.FinishVisitStorageConnectionString;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("DefaultEndpointsProtocol=https;AccountName=ecokayfinishvisitsqa;EndpointSuffix=core.windows.net"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_FinishVisitStorageConnectionString_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.FinishVisitStorageConnectionString;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_FinishVisitStorageConnectionString_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.FinishVisitStorageConnectionString;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion

        #region FinishVisitReportsContainer
        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_Returns_FinishVisitReportsContainer()
        {
            _configuration["AppSettings:FinishVisitReportsContainer"].Returns("finishvisitreports");

            var result = _confiReader.FinishVisitReportsContainer;

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result, Is.EqualTo("finishvisitreports"));
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_FinishVisitReportsContainer_ReturnsNull()
        {
            _configuration["AppSettings:WrongKey"].ReturnsNull();

            var result = _confiReader.FinishVisitReportsContainer;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }

        [Test]
        [Author("Prakash Betageri")]
        public void Test_ConfigReader_FinishVisitReportsContainer_ReturnsEmpty()
        {
            _configuration["AppSettings:WrongKey"].Returns(string.Empty);

            var result = _confiReader.FinishVisitReportsContainer;

            Assert.That(string.IsNullOrEmpty(result), Is.True);
        }
        #endregion
    }
}
