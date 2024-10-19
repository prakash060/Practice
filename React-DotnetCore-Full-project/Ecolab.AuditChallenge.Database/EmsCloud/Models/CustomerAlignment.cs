namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class CustomerAlignment
    {
        public CustomerAlignment()
        {
            CustomerAlignmentLevels = new HashSet<CustomerAlignmentLevel>();
            LocationAlignments = new HashSet<LocationAlignment>();
        }

        public Guid CustomerAlignmentId { get; set; }
        public string CustomerAlignmentReferenceId { get; set; } = null!;
        public Guid AccountId { get; set; }
        public int AlignmentTypeId { get; set; }
        public int MaxLevelDepth { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrentlyActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual Account Account { get; set; } = null!;
        public virtual ICollection<CustomerAlignmentLevel> CustomerAlignmentLevels { get; set; }
        public virtual ICollection<LocationAlignment> LocationAlignments { get; set; }
    }
}
