using Ecolab.AuditChallenge.Api.Models;
using Microsoft.WindowsAzure.Storage.Blob;

namespace Ecolab.AuditChallenge.Api.Contracts
{
    public interface IBlobService
    {
        Task<CloudBlockBlob> GetCloudBlockBlob(string blobContainerName, string blobPath);

        Task<BlobObject> GetCloudBlob(string blobContainerName, string blobPath);
    }
}
