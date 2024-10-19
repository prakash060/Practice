namespace Ecolab.AuditChallenge.Api.Models.Admin
{
    public class RoleConfigurationModel
    {
        public int Id { get; set; }

        public string EmailId { get; set; }

        public int RoleId { get; set; }

        public DateTime ChangedDate { get; set; }

        public bool IsActive { get; set; }
    }
}
