namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyZoneSectionScore
    {
        public SurveyZoneSectionScore()
        {
            ServiceResponseSurveyPoints = new HashSet<ServiceResponseSurveyPoint>();
            SurveyResponseZoneSectionSummaries = new HashSet<SurveyResponseZoneSectionSummary>();
        }

        public Guid SurveyZoneSectionScoreId { get; set; }
        public Guid SurveyId { get; set; }
        public int? ScoreTypeId { get; set; }
        public bool ScoreZone { get; set; }
        public bool ScoreSection { get; set; }
        public DateTime ChangeDate { get; set; }
        public Guid ScoringGroupId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsDefault { get; set; }
        public bool IsCurrentlyActive { get; set; }
        public int? TotalDecimalPoints { get; set; }
        public bool IsObservationRequired { get; set; }

        public virtual ScoringGroup ScoringGroup { get; set; } = null!;
        public virtual Survey Survey { get; set; } = null!;
        public virtual ICollection<ServiceResponseSurveyPoint> ServiceResponseSurveyPoints { get; set; }
        public virtual ICollection<SurveyResponseZoneSectionSummary> SurveyResponseZoneSectionSummaries { get; set; }
    }
}
