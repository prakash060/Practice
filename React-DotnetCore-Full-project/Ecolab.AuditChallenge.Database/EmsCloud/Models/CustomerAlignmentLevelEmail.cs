namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class CustomerAlignmentLevelEmail
    {
        public Guid CustomerAlignmentLevelEmailId { get; set; }
        public Guid? CustomerAlignmentLevelId { get; set; }
        public string EmailAddress { get; set; } = null!;
        public string? RecipientName { get; set; }
        public string? EcosureNodeId { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual CustomerAlignmentLevel? CustomerAlignmentLevel { get; set; }
    }
}
