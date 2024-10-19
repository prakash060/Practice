namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class VisitService
    {
        public Guid VisitServiceId { get; set; }
        public int ServiceTypeId { get; set; }
        public Guid? EcoSystemId { get; set; }
        public Guid? SurveyId { get; set; }
        public Guid? TrainingServiceTrainingTopicId { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public Guid? RequiredVisitDocumentId { get; set; }
        public int VisitServiceAvailabilityFlag { get; set; }

        public virtual Survey? Survey { get; set; }
    }
}
