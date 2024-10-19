namespace Ecolab.AuditChallenge.Database.CdmCloud.Models
{
    public partial class ConnectUserAccount
    {
        public int AccountKey { get; set; }
        public int UserKey { get; set; }
        public string AlignmentType { get; set; } = null!;
        public bool IsInherited { get; set; }
        public string? DivisionalBusinessUnitCode { get; set; }
        public string? PartnerFunction { get; set; }
        public int? DataIntgExecId { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime ModifiedOn { get; set; }
        public int ConnectUserAccountStageId { get; set; }
    }
}
