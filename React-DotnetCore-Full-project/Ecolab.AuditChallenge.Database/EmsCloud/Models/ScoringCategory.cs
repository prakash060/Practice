namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringCategory
    {
        public ScoringCategory()
        {
            ObservationIssues = new HashSet<ObservationIssue>();
            Observations = new HashSet<Observation>();
            RepeatViolations = new HashSet<RepeatViolation>();
            ScoringCategoryTranslations = new HashSet<ScoringCategoryTranslation>();
            SurveyQuestionDetails = new HashSet<SurveyQuestionDetail>();
            SurveyQuestionScoringRules = new HashSet<SurveyQuestionScoringRule>();
            SurveyResponseZoneSectionCategoryCounts = new HashSet<SurveyResponseZoneSectionCategoryCount>();
        }

        public Guid ScoringCategoryId { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsCritical { get; set; }

        public virtual ICollection<ObservationIssue> ObservationIssues { get; set; }
        public virtual ICollection<Observation> Observations { get; set; }
        public virtual ICollection<RepeatViolation> RepeatViolations { get; set; }
        public virtual ICollection<ScoringCategoryTranslation> ScoringCategoryTranslations { get; set; }
        public virtual ICollection<SurveyQuestionDetail> SurveyQuestionDetails { get; set; }
        public virtual ICollection<SurveyQuestionScoringRule> SurveyQuestionScoringRules { get; set; }
        public virtual ICollection<SurveyResponseZoneSectionCategoryCount> SurveyResponseZoneSectionCategoryCounts { get; set; }
    }
}
