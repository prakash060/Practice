namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyResponseDetail
    {
        public SurveyResponseDetail()
        {
            Observations = new HashSet<Observation>();
        }

        public Guid SurveyResponseDetailId { get; set; }
        public Guid ServiceResponseSurveyId { get; set; }
        public Guid SurveyQuestionId { get; set; }
        public Guid ZoneId { get; set; }

        public virtual ServiceResponse ServiceResponseSurvey { get; set; } = null!;
        public virtual Zone Zone { get; set; } = null!;
        public virtual ICollection<Observation> Observations { get; set; }
    }
}
