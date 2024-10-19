namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringGradeTranslationView
    {
        public Guid ScoringGradeId { get; set; }
        public string CultureCode { get; set; } = null!;
        public string? Abbreviation { get; set; }
        public string? ColorBallPath { get; set; }
        public string? HtmlColorCode { get; set; }
        public string? Name { get; set; }
    }
}
