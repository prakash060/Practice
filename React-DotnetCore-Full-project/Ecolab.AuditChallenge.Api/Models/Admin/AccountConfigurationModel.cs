namespace Ecolab.AuditChallenge.Api.Models.Admin
{
    public class AccountConfigurationModel
    {
        public int Id { get; set; }

        public Guid AccountId { get; set; }

        public string AccountName { get; set; }

        public int LimitToChallenge { get; set; }

        public int LimitToReview { get; set; }

        public DateTime ChangedDate { get; set; }

        public bool IsActive { get; set; }
    }
}
