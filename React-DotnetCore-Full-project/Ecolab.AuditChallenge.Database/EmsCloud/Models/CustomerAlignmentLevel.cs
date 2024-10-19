namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class CustomerAlignmentLevel
    {
        public CustomerAlignmentLevel()
        {
            CustomerAlignmentLevelEmails = new HashSet<CustomerAlignmentLevelEmail>();
        }

        public Guid CustomerAlignmentLevelId { get; set; }
        public Guid CustomerAlignmentId { get; set; }
        public int Depth { get; set; }
        public string LevelType { get; set; } = null!;
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeeNumber { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual CustomerAlignment CustomerAlignment { get; set; } = null!;
        public virtual ICollection<CustomerAlignmentLevelEmail> CustomerAlignmentLevelEmails { get; set; }
    }
}
