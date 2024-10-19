namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class LocationVisit
    {
        public LocationVisit()
        {
            LocationLastSurveyVisits = new HashSet<LocationLastSurveyVisit>();
            RepeatViolationPreviousVisits = new HashSet<RepeatViolationPreviousVisit>();
            RepeatViolations = new HashSet<RepeatViolation>();
            ServiceReports = new HashSet<ServiceReport>();
            ServiceResponses = new HashSet<ServiceResponse>();
        }

        public Guid LocationVisitId { get; set; }
        public Guid? EmployeeId { get; set; }
        public Guid LocationId { get; set; }
        public DateTimeOffset VisitStartTime { get; set; }
        public string? InternalComment { get; set; }
        public Guid? LocationEmployeeId { get; set; }
        public string? VisitComment { get; set; }
        public DateTimeOffset? VisitEndTime { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public string CultureCode { get; set; } = null!;
        public Guid? OriginalLocationId { get; set; }
        public int LocationVisitStateId { get; set; }
        public bool IsDirty { get; set; }
        public Guid? TimeZoneId { get; set; }
        public string? CustomTimeZone { get; set; }
        public string? LocationRepSignaturePath { get; set; }
        public string? TerritoryRepSignaturePath { get; set; }
        public Guid? CustomerEmployeeId { get; set; }

        public virtual ICollection<LocationLastSurveyVisit> LocationLastSurveyVisits { get; set; }
        public virtual ICollection<RepeatViolationPreviousVisit> RepeatViolationPreviousVisits { get; set; }
        public virtual ICollection<RepeatViolation> RepeatViolations { get; set; }
        public virtual ICollection<ServiceReport> ServiceReports { get; set; }
        public virtual ICollection<ServiceResponse> ServiceResponses { get; set; }
    }
}
