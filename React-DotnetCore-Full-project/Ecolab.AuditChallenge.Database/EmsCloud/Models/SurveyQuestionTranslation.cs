namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyQuestionTranslation
    {
        public string CultureCode { get; set; } = null!;
        public Guid SurveyQuestionId { get; set; }
        public string? QuestionText { get; set; }
        public string? QuestionHelpText { get; set; }
        public string? CollectionLocationName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrentlyActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual SurveyQuestion SurveyQuestion { get; set; } = null!;
    }
}
