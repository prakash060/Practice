namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public class ToBeChallengedAuditModel
    {
        public Guid ServiceResponseId { get; set; }
        public string LocationName { get; set; }
        public string SurveyName { get; set; }
        public string LocationIdentifier { get; set; }
        public DateTimeOffset VisitStartTime { get; set; }
        public Guid LocationId { get; set; }
        public Guid AccountId { get; set; }
    }
}
