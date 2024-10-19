namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ZoneTranslationView
    {
        public Guid ZoneId { get; set; }
        public string CultureCode { get; set; } = null!;
        public string? Name { get; set; }
    }
}
