namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyQuestionDetail
    {
        public Guid SurveyQuestionDetailId { get; set; }
        public Guid SurveyQuestionId { get; set; }
        public int QuestionTypeId { get; set; }
        public Guid SectionId { get; set; }
        public int QuestionNumber { get; set; }
        public string? QuestionNumberSuffix { get; set; }
        public string? QuestionNumberDotSuffix { get; set; }
        public int NegativeObservationCaptureOptionsId { get; set; }
        public int PositiveObservationCaptureOptionsId { get; set; }
        public bool IsAllPositive { get; set; }
        public bool IsInternal { get; set; }
        public bool IsScored { get; set; }
        public Guid? ListOptionGroupId { get; set; }
        public int? MaximumScore { get; set; }
        public decimal? NumericQuestionMaxValue { get; set; }
        public decimal? NumericQuestionMinValue { get; set; }
        public Guid? DefaultScoringCategoryId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrentlyActive { get; set; }
        public DateTime ChangeDate { get; set; }
        public string? QuestionNumberPrefix { get; set; }

        public virtual ScoringCategory? DefaultScoringCategory { get; set; }
        public virtual SurveyQuestion SurveyQuestion { get; set; } = null!;
    }
}
