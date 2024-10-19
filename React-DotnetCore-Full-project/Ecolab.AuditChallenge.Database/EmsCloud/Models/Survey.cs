namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Survey
    {
        public Survey()
        {
            SurveyQuestions = new HashSet<SurveyQuestion>();
            SurveySurveyTypes = new HashSet<SurveySurveyType>();
            SurveyTranslations = new HashSet<SurveyTranslation>();
            SurveyZoneSectionScores = new HashSet<SurveyZoneSectionScore>();
            VisitServices = new HashSet<VisitService>();
        }

        public Guid SurveyId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsInternal { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsCurrentlyActive { get; set; }

        public virtual SurveyConfiguration? SurveyConfiguration { get; set; }
        public virtual ICollection<SurveyQuestion> SurveyQuestions { get; set; }
        public virtual ICollection<SurveySurveyType> SurveySurveyTypes { get; set; }
        public virtual ICollection<SurveyTranslation> SurveyTranslations { get; set; }
        public virtual ICollection<SurveyZoneSectionScore> SurveyZoneSectionScores { get; set; }
        public virtual ICollection<VisitService> VisitServices { get; set; }
    }
}
