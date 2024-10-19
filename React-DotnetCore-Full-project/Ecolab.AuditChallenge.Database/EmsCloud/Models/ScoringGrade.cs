namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringGrade
    {
        public ScoringGrade()
        {
            ScoringGradeTranslations = new HashSet<ScoringGradeTranslation>();
            ServiceResponseSurveyPoints = new HashSet<ServiceResponseSurveyPoint>();
            SurveyResponseZoneSectionSummaries = new HashSet<SurveyResponseZoneSectionSummary>();
        }

        public Guid ScoringGradeId { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public int? ScoreGradeSeverity { get; set; }
        public int? CategoryLevel { get; set; }

        public virtual ICollection<ScoringGradeTranslation> ScoringGradeTranslations { get; set; }
        public virtual ICollection<ServiceResponseSurveyPoint> ServiceResponseSurveyPoints { get; set; }
        public virtual ICollection<SurveyResponseZoneSectionSummary> SurveyResponseZoneSectionSummaries { get; set; }
    }
}
