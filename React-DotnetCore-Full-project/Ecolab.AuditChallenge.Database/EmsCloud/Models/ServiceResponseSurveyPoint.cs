namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ServiceResponseSurveyPoint
    {
        public Guid ServiceResponseSurveyPointsId { get; set; }
        public Guid ServiceResponseSurveyId { get; set; }
        public decimal SurveyEarnedPoints { get; set; }
        public decimal SurveyPossiblePoints { get; set; }
        public Guid? ScoringGradeId { get; set; }
        public int? ThresholdXvalue { get; set; }
        public int? ThresholdYvalue { get; set; }
        public int? NumRepeats { get; set; }
        public decimal? Score { get; set; }
        public int? NumberNegativeObservations { get; set; }
        public int? NumberObservations { get; set; }
        public int? CriticalRepeat { get; set; }
        public Guid? SurveyZoneSectionScoreId { get; set; }

        public virtual ScoringGrade? ScoringGrade { get; set; }
        public virtual ServiceResponse ServiceResponseSurvey { get; set; } = null!;
        public virtual SurveyZoneSectionScore? SurveyZoneSectionScore { get; set; }
    }
}
