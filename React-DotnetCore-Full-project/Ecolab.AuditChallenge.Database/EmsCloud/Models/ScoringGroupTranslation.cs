namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringGroupTranslation
    {
        public string CultureCode { get; set; } = null!;
        public Guid ScoringGroupId { get; set; }
        public string Name { get; set; } = null!;
        public string Abbreviation { get; set; } = null!;
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual ScoringGroup ScoringGroup { get; set; } = null!;
    }
}
