namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyTypeTranslationView
    {
        public int SurveyTypeId { get; set; }
        public string CultureCode { get; set; } = null!;
        public string? Name { get; set; }
    }
}
