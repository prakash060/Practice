namespace Ecolab.AuditChallenge.Api.Models.Admin
{
    public class CustomerCreateRequest
    {

        public Guid AccountId { get; set; }

        public string AccountName { get; set; }

        public int LimitToChallenge { get; set; }

        public int LimitToReview { get; set; }
    }
}
