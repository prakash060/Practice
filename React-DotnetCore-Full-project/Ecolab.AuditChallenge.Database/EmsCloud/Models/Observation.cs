namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Observation
    {
        public Observation()
        {
            ObservationIssues = new HashSet<ObservationIssue>();
            RepeatViolations = new HashSet<RepeatViolation>();
        }

        public Guid ObservationId { get; set; }
        public DateTimeOffset ObservationTime { get; set; }
        public Guid SurveyResponseDetailId { get; set; }
        public bool? IsNegative { get; set; }
        public string? ObservationComment { get; set; }
        public string? Product { get; set; }
        public Guid? ProductCaseId { get; set; }
        public Guid? ProductLocationId { get; set; }
        public Guid? ProductCategoryId { get; set; }
        public string? Response { get; set; }
        public Guid? ResponseListOptionId { get; set; }
        public int? TotalMinutesInCase { get; set; }
        public bool UnableToObserve { get; set; }
        public string? UnableToObserveComment { get; set; }
        public Guid? ScoringCategoryId { get; set; }
        public decimal? EarnedPoints { get; set; }
        public Guid? StandardCommentId { get; set; }
        public DateTime? CalendarCaptureDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ScoringCategory? ScoringCategory { get; set; }
        public virtual SurveyResponseDetail SurveyResponseDetail { get; set; } = null!;
        public virtual ICollection<ObservationIssue> ObservationIssues { get; set; }
        public virtual ICollection<RepeatViolation> RepeatViolations { get; set; }
    }
}
