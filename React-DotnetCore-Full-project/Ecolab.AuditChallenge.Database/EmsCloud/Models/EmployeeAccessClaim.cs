namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class EmployeeAccessClaim
    {
        public int? AccessClaimId { get; set; }
        public Guid EmployeeId { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public Guid EmployeeAccessClaimId { get; set; }
        public Guid? AccessClaimGroupId { get; set; }

        public virtual Employee Employee { get; set; } = null!;
    }
}
