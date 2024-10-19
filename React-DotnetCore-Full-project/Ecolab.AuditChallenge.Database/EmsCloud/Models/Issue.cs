namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Issue
    {
        public Issue()
        {
            IssueTranslations = new HashSet<IssueTranslation>();
            ObservationIssues = new HashSet<ObservationIssue>();
            SurveyQuestionScoringRules = new HashSet<SurveyQuestionScoringRule>();
        }

        public Guid IssueId { get; set; }
        public Guid ReasonId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime ChangeDate { get; set; }
        public Guid? IssueOpportunityId { get; set; }
        public bool IsCurrentlyActive { get; set; }

        public virtual ICollection<IssueTranslation> IssueTranslations { get; set; }
        public virtual ICollection<ObservationIssue> ObservationIssues { get; set; }
        public virtual ICollection<SurveyQuestionScoringRule> SurveyQuestionScoringRules { get; set; }
    }
}
