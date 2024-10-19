namespace Ecolab.AuditChallenge.Database.CdmCloud.Models
{
    public partial class CustomerSiteCvocFlat
    {
        public int HierarchyReferenceNodeKey { get; set; }
        public string HierarchyReferenceNodeName { get; set; } = null!;
        public string HierarchyReferenceNodeDescription { get; set; } = null!;
        public int CustsiteContextPointKey { get; set; }
        public string CustsiteContextPointName { get; set; } = null!;
        public string CustsiteContextPointDescription { get; set; } = null!;
        public int CustomerKey { get; set; }
        public string CustomerName { get; set; } = null!;
        public int SiteKey { get; set; }
        public string SourceSystemCode { get; set; } = null!;
        public string? Level1ContextPointKey { get; set; }
        public string? Level1ContextPointName { get; set; }
        public string? Level1ContextPointDescription { get; set; }
        public string? Level2ContextPointKey { get; set; }
        public string? Level2ContextPointName { get; set; }
        public string? Level2ContextPointDescription { get; set; }
        public string? Level3ContextPointKey { get; set; }
        public string? Level3ContextPointName { get; set; }
        public string? Level3ContextPointDescription { get; set; }
        public string? Level4ContextPointKey { get; set; }
        public string? Level4ContextPointName { get; set; }
        public string? Level4ContextPointDescription { get; set; }
        public string? Level5ContextPointKey { get; set; }
        public string? Level5ContextPointName { get; set; }
        public string? Level5ContextPointDescription { get; set; }
        public string? Level6ContextPointKey { get; set; }
        public string? Level6ContextPointName { get; set; }
        public string? Level6ContextPointDescription { get; set; }
        public string? Level7ContextPointKey { get; set; }
        public string? Level7ContextPointName { get; set; }
        public string? Level7ContextPointDescription { get; set; }
        public string? Level8ContextPointKey { get; set; }
        public string? Level8ContextPointName { get; set; }
        public string? Level8ContextPointDescription { get; set; }
        public string? Level9ContextPointKey { get; set; }
        public string? Level9ContextPointName { get; set; }
        public string? Level9ContextPointDescription { get; set; }
        public string? Level10ContextPointKey { get; set; }
        public string? Level10ContextPointName { get; set; }
        public string? Level10ContextPointDescription { get; set; }
        public DateTime? HierarchyModifiedDate { get; set; }
        public int CustomerSiteCvocFlatId { get; set; }
    }
}
