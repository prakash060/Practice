namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyResponseZoneSectionCategoryCount
    {
        public Guid SurveyResponseZoneSectionCategoryCountId { get; set; }
        public Guid ServiceResponseZoneSectionSummaryId { get; set; }
        public Guid ScoringCategoryId { get; set; }
        public int NumberObservation { get; set; }
        public int? NumberRepeats { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ScoringCategory ScoringCategory { get; set; } = null!;
        public virtual SurveyResponseZoneSectionSummary ServiceResponseZoneSectionSummary { get; set; } = null!;
    }
}
