namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyResponseZoneSectionSummary
    {
        public SurveyResponseZoneSectionSummary()
        {
            SurveyResponseZoneSectionCategoryCounts = new HashSet<SurveyResponseZoneSectionCategoryCount>();
        }

        public Guid ServiceResponseZoneSectionSummaryId { get; set; }
        public Guid ServiceResponseSurveyId { get; set; }
        public Guid SurveyZoneSectionScoreId { get; set; }
        public Guid? ZoneId { get; set; }
        public Guid? SectionId { get; set; }
        public int NumberNegativeObservation { get; set; }
        public int NumberObservation { get; set; }
        public decimal? EarnedPoints { get; set; }
        public decimal? PointsAvailable { get; set; }
        public decimal? Score { get; set; }
        public Guid? ScoringGradeId { get; set; }
        public int? NumberRepeats { get; set; }
        public int? CriticalRepeat { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }
        public int? ThresholdXvalue { get; set; }
        public int? ThresholdYvalue { get; set; }
        public int? MajorRepeat { get; set; }

        public virtual ScoringGrade? ScoringGrade { get; set; }
        public virtual ServiceResponse ServiceResponseSurvey { get; set; } = null!;
        public virtual SurveyZoneSectionScore SurveyZoneSectionScore { get; set; } = null!;
        public virtual Zone? Zone { get; set; }
        public virtual ICollection<SurveyResponseZoneSectionCategoryCount> SurveyResponseZoneSectionCategoryCounts { get; set; }
    }
}
