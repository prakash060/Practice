namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyQuestion
    {
        public SurveyQuestion()
        {
            SurveyQuestionDetails = new HashSet<SurveyQuestionDetail>();
            SurveyQuestionScoringRules = new HashSet<SurveyQuestionScoringRule>();
            SurveyQuestionTranslations = new HashSet<SurveyQuestionTranslation>();
        }

        public Guid SurveyQuestionId { get; set; }
        public Guid SurveyId { get; set; }
        public Guid QuestionId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrentlyActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual Survey Survey { get; set; } = null!;
        public virtual ICollection<SurveyQuestionDetail> SurveyQuestionDetails { get; set; }
        public virtual ICollection<SurveyQuestionScoringRule> SurveyQuestionScoringRules { get; set; }
        public virtual ICollection<SurveyQuestionTranslation> SurveyQuestionTranslations { get; set; }
    }
}
