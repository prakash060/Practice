using Ecolab.AuditChallenge.Api.Contracts;

namespace Ecolab.AuditChallenge.Api.Services
{
    public class ConfigReader : IConfigReader
    {
        private readonly IConfiguration _configuration;
        public ConfigReader(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string DefaultCultureCode => _configuration["AppSettings:DefaultCultureCode"];
        public string DefaultAccountId => _configuration["AppSettings:DefaultAccountId"];
        public string DefaultDateFormat => _configuration["AppSettings:DefaultDateFormat"];
        public string AllowedDomains => _configuration["AppSettings:AllowedDomains"];
        public string BaseReportPath => _configuration["AppSettings:BaseReportPath"];
        public string Environment => _configuration["AppSettings:Environment"];
        public string ApplicationCode => _configuration["AppSettings:ApplicationCode"];
        public string EmsIntegrationUrl => _configuration["AppSettings:EmsIntegrationUrl"];
        public string EmsCloudSolutionUrl => _configuration["AppSettings:EmsCloudSlnUrl"];
        public string FinishVisitStorageConnectionString => _configuration["AppSettings:FinishVisitStorageConnectionString"];
        public string FinishVisitReportsContainer => _configuration["AppSettings:FinishVisitReportsContainer"];
    }
}
