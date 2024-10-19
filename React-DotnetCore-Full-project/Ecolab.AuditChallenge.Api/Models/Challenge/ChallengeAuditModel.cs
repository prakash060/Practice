namespace Ecolab.AuditChallenge.Api.Models.Challenge
{
    public class ChallengeAuditModel
    {
        public Guid Id { get; set; }
        public Guid ServiceResponseId { get; set; }
        public Guid LocationId { get; set; }
        public Guid AccountId { get; set; }
        public string Location { get; set; }
        public string SurveyName { get; set; }
        public string UnitNumber { get; set; }
        public DateTime VisitDate { get; set; }
        public int FindingsCount { get; set; }
        public DateTime? ChangedDate { get; set; }
        public AuditStatus Status { get; set; }
        public bool IsActive { get; set; }
    }
}
