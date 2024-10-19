namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class RepeatViolation
    {
        public RepeatViolation()
        {
            RepeatViolationPreviousVisits = new HashSet<RepeatViolationPreviousVisit>();
            RepeatViolationScoringGroups = new HashSet<RepeatViolationScoringGroup>();
        }

        public Guid RepeatViolationId { get; set; }
        public Guid LocationVisitId { get; set; }
        public Guid ServiceResponseId { get; set; }
        public Guid ObservationId { get; set; }
        public Guid ZoneId { get; set; }
        public Guid SectionId { get; set; }
        public Guid SurveyQuestionId { get; set; }
        public Guid? ReasonId { get; set; }
        public Guid? IssueId { get; set; }
        public Guid? ScoringCategoryId { get; set; }
        public string? Comment { get; set; }
        public int ViolationLevelTypeId { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual LocationVisit LocationVisit { get; set; } = null!;
        public virtual Observation Observation { get; set; } = null!;
        public virtual ScoringCategory? ScoringCategory { get; set; }
        public virtual ServiceResponse ServiceResponse { get; set; } = null!;
        public virtual Zone Zone { get; set; } = null!;
        public virtual ICollection<RepeatViolationPreviousVisit> RepeatViolationPreviousVisits { get; set; }
        public virtual ICollection<RepeatViolationScoringGroup> RepeatViolationScoringGroups { get; set; }
    }
}
