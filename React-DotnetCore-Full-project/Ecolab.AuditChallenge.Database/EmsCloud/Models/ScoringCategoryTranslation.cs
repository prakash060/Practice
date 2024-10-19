namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringCategoryTranslation
    {
        public string CultureCode { get; set; } = null!;
        public Guid ScoringCategoryId { get; set; }
        public string Name { get; set; } = null!;
        public string Abbreviation { get; set; } = null!;
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public string? OverrideName { get; set; }
        public string? DisplayName { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual ScoringCategory ScoringCategory { get; set; } = null!;
    }
}
