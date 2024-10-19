namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringCategoryTranslationView
    {
        public Guid ScoringCategoryId { get; set; }
        public string CultureCode { get; set; } = null!;
        public string? Abbreviation { get; set; }
        public string? Name { get; set; }
        public string? DisplayName { get; set; }
    }
}
