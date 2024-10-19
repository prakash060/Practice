namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyTranslationView
    {
        public Guid SurveyId { get; set; }
        public string CultureCode { get; set; } = null!;
        public string? Abbreviation { get; set; }
        public string? Name { get; set; }
        public string? SurveyDescription { get; set; }
    }
}
