namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ServiceResponse
    {
        public ServiceResponse()
        {
            RepeatViolations = new HashSet<RepeatViolation>();
            ServiceResponseSurveyPoints = new HashSet<ServiceResponseSurveyPoint>();
            SurveyResponseDetails = new HashSet<SurveyResponseDetail>();
            SurveyResponseZoneSectionSummaries = new HashSet<SurveyResponseZoneSectionSummary>();
        }

        public Guid ServiceResponseId { get; set; }
        public Guid? LocationVisitId { get; set; }
        public DateTimeOffset ServiceDate { get; set; }
        public Guid VisitServiceId { get; set; }
        public string? CancelComment { get; set; }
        public Guid? InstalledSystemId { get; set; }
        public bool IsSystemAdded { get; set; }
        public string? ServiceComment { get; set; }
        public Guid? StandardCommentId { get; set; }
        public Guid? ScheduledMaintenanceId { get; set; }
        public bool ForEsr { get; set; }
        public Guid? CustomerResponseId { get; set; }
        public string? ServiceAppointmentNumber { get; set; }

        public virtual LocationVisit? LocationVisit { get; set; }
        public virtual ICollection<RepeatViolation> RepeatViolations { get; set; }
        public virtual ICollection<ServiceResponseSurveyPoint> ServiceResponseSurveyPoints { get; set; }
        public virtual ICollection<SurveyResponseDetail> SurveyResponseDetails { get; set; }
        public virtual ICollection<SurveyResponseZoneSectionSummary> SurveyResponseZoneSectionSummaries { get; set; }
    }
}
