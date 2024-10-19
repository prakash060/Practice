namespace Ecolab.AuditChallenge.Api.Models
{
    public class ServiceReportRequest
    {
        public Guid? ServiceReportId { get; set; }
        public Guid? LocationVisitId { get; set; }
        public Guid? ServiceResponseId { get; set; }
        public int? VersionNumber { get; set; }
    }
}
