namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyQuestionTranslationView
    {
        public string CultureCode { get; set; } = null!;
        public Guid SurveyQuestionId { get; set; }
        public string? QuestionText { get; set; }
        public string? QuestionHelpText { get; set; }
        public string? CollectionLocationName { get; set; }
    }
}
