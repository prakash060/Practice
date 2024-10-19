namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringGroupTranslationView
    {
        public Guid ScoringGroupId { get; set; }
        public string CultureCode { get; set; } = null!;
        public string? Abbreviation { get; set; }
        public string? Name { get; set; }
    }
}
