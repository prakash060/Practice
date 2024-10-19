namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyQuestionScoringRule
    {
        public Guid SurveyQuestionScoringRuleId { get; set; }
        public Guid SurveyQuestionId { get; set; }
        public Guid? AccountId { get; set; }
        public Guid? ReasonId { get; set; }
        public Guid? IssueId { get; set; }
        public Guid? NumericComparisonRuleId { get; set; }
        public int PenaltyPoints { get; set; }
        public Guid ScoringCategoryId { get; set; }
        public DateTime ChangeDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrentlyActive { get; set; }
        public string? CountryCode { get; set; }
        public Guid? EqualityRuleId { get; set; }

        public virtual Account? Account { get; set; }
        public virtual Issue? Issue { get; set; }
        public virtual ScoringCategory ScoringCategory { get; set; } = null!;
        public virtual SurveyQuestion SurveyQuestion { get; set; } = null!;
    }
}
