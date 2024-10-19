namespace Ecolab.AuditChallenge.Database.CdmCloud.Models
{
    public partial class Permission
    {
        public string PermissionCode { get; set; } = null!;
        public string PermissionName { get; set; } = null!;
        public bool IsActive { get; set; }
        public string? ApplicationCode { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime ModifiedOn { get; set; }
        public int? DataIntgExecId { get; set; }
        public int PermissionId { get; set; }
    }
}
