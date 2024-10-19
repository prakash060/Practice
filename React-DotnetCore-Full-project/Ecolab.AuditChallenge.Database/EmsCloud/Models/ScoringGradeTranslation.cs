namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringGradeTranslation
    {
        public string CultureCode { get; set; } = null!;
        public Guid ScoringGradeId { get; set; }
        public string Name { get; set; } = null!;
        public string Abbreviation { get; set; } = null!;
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public string? ColorBallPath { get; set; }
        public string? HtmlColorCode { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual ScoringGrade ScoringGrade { get; set; } = null!;
    }
}
