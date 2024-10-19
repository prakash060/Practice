namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class RepeatViolationPreviousVisit
    {
        public Guid RepeatViolationPreviousVisitId { get; set; }
        public Guid RepeatViolationId { get; set; }
        public Guid LocationVisitId { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual LocationVisit LocationVisit { get; set; } = null!;
        public virtual RepeatViolation RepeatViolation { get; set; } = null!;
    }
}
