namespace Ecolab.AuditChallenge.Api.Models
{
    public class ServiceReportModel
    {
        public Guid ServiceReportId { get; set; }
        public int VersionNumber { get; set; }
        public Guid ReportGroupId { get; set; }
        public Guid LocationVisitId { get; set; }
        public Guid? ServiceResponseId { get; set; }
        public string ReportPath { get; set; } = null!;
        public bool IsReportUploaded { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset GenerationDate { get; set; }
        public DateTime ChangeDate { get; set; }
        public string? CultureCode { get; set; }
    }
}
