namespace Ecolab.AuditChallenge.Api.Contracts
{
    public interface IConfigReader
    {
        public string DefaultCultureCode { get; }
        public string DefaultAccountId { get; }
        public string DefaultDateFormat { get; }
        public string AllowedDomains { get; }
        public string BaseReportPath { get; }
        public string Environment { get; }
        public string ApplicationCode { get; }
        public string EmsIntegrationUrl { get; }
        public string EmsCloudSolutionUrl { get; }
        public string FinishVisitStorageConnectionString { get; }
        public string FinishVisitReportsContainer { get; }
    }
}
