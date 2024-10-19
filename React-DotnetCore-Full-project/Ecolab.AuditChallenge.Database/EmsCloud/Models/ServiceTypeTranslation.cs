namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ServiceTypeTranslation
    {
        public string CultureCode { get; set; } = null!;
        public int ServiceTypeId { get; set; }
        public string Name { get; set; } = null!;
        public DateTime ChangeDate { get; set; }
        public bool? IsActive { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual ServiceType ServiceType { get; set; } = null!;
    }
}
