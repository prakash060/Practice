namespace Ecolab.AuditChallenge.Database.CdmCloud.Models
{
    public partial class UserContextPointStage
    {
        public int UserContextPointKey { get; set; }
        public int ContextPointKey { get; set; }
        public int UserKey { get; set; }
        public string CreatedBy { get; set; } = null!;
        public DateTime CreatedOn { get; set; }
        public string ModifiedBy { get; set; } = null!;
        public DateTime ModifiedOn { get; set; }
        public int? DataIntgExecId { get; set; }
        public bool IsActive { get; set; }
    }
}
