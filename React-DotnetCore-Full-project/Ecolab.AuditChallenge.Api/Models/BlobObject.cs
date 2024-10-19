namespace Ecolab.AuditChallenge.Api.Models
{
    public class BlobObject
    {
        public string Message { get; set; }
        public byte[] Data { get; set; }
        public string ContentType { get; set; }
        public string Url { get; set; }
    }
}
