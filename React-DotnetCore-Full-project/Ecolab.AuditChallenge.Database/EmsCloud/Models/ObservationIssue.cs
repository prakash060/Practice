namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ObservationIssue
    {
        public Guid ObservationIssueId { get; set; }
        public Guid ObservationId { get; set; }
        public string? AdditionalComments { get; set; }
        public bool CorrectedOnSite { get; set; }
        public Guid? CustomIssueId { get; set; }
        public bool? InformedTheMic { get; set; }
        public Guid? IssueId { get; set; }
        public bool? TrainingPerformed { get; set; }
        public bool WorkOrderSubmitted { get; set; }
        public Guid? ScoringCategoryId { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual Issue? Issue { get; set; }
        public virtual Observation Observation { get; set; } = null!;
        public virtual ScoringCategory? ScoringCategory { get; set; }
    }
}
