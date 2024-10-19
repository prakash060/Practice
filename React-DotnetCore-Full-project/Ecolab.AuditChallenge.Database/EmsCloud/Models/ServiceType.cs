namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ServiceType
    {
        public ServiceType()
        {
            ServiceTypeTranslations = new HashSet<ServiceTypeTranslation>();
        }

        public int ServiceTypeId { get; set; }
        public string EnumValue { get; set; } = null!;

        public virtual ICollection<ServiceTypeTranslation> ServiceTypeTranslations { get; set; }
    }
}
