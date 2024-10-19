namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class LocationAlignment
    {
        public Guid LocationAlignmentId { get; set; }
        public Guid LocationId { get; set; }
        public Guid CustomerAlignmentId { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual CustomerAlignment CustomerAlignment { get; set; } = null!;
        public virtual Location Location { get; set; } = null!;
    }
}
