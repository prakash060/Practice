namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ZoneTranslation
    {
        public string CultureCode { get; set; } = null!;
        public Guid ZoneId { get; set; }
        public string Name { get; set; } = null!;
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual Zone Zone { get; set; } = null!;
    }
}
