namespace Ecolab.AuditChallenge.Api.Models
{
    public class FileDownloadResponse
    {
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public byte[] FileContent { get; set; }
    }
}
