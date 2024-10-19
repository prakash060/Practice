namespace Ecolab.AuditChallenge.Database.CdmCloud.Models
{
    public partial class UserPermission
    {
        public int UserKey { get; set; }
        public string PermissionCode { get; set; } = null!;
        public bool IsActive { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime ModifiedOn { get; set; }
        public string ApplicationCode { get; set; } = null!;
        public int? DataIntgExecId { get; set; }
    }
}
