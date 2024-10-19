namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class RepeatViolationScoringGroup
    {
        public Guid RepeatViolationScoringGroupId { get; set; }
        public Guid RepeatViolationId { get; set; }
        public Guid ScoringGroupId { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual RepeatViolation RepeatViolation { get; set; } = null!;
        public virtual ScoringGroup ScoringGroup { get; set; } = null!;
    }
}
