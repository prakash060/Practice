namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class LocationLastSurveyVisit
    {
        public Guid LocationId { get; set; }
        public Guid AccountId { get; set; }
        public Guid LocationVisitId { get; set; }
        public DateTimeOffset VisitStartTime { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }

        public virtual Account Account { get; set; } = null!;
        public virtual Location Location { get; set; } = null!;
        public virtual LocationVisit LocationVisit { get; set; } = null!;
    }
}
