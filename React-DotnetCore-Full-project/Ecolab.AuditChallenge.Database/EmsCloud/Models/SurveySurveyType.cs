namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveySurveyType
    {
        public Guid SurveySurveyTypeId { get; set; }
        public Guid SurveyId { get; set; }
        public int SurveyTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsCurrentlyActive { get; set; }

        public virtual Survey Survey { get; set; } = null!;
    }
}
