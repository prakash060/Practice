using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Models;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.RetryPolicies;
using System.Reflection;

namespace Ecolab.AuditChallenge.Api.Services
{
    public class BlobService : IBlobService
    {
        private CloudStorageAccount _storageAccount { get; set; }
        private CloudBlobClient _blobClient { get; set; }
        private readonly IConfigReader _configuration;
        private readonly ILogger _logger;
        public BlobService(IConfigReader configuration, ILogger<BlobService> logger)
        {
            _configuration = configuration;
            _storageAccount = CloudStorageAccount.Parse(_configuration.FinishVisitStorageConnectionString);
            _logger = logger;
        }

        public async Task<BlobObject> GetCloudBlob(string blobContainerName, string blobPath)
        {
            CloudBlockBlob blockBlob = await GetCloudBlockBlob(blobContainerName, blobPath);
            try
            {
                await blockBlob.FetchAttributesAsync();
                long fileByteLength = blockBlob.Properties.Length;
                if (fileByteLength == 0) return null;

                var result = new BlobObject
                {
                    Url = blockBlob.Uri.AbsoluteUri,
                    Data = new byte[fileByteLength],
                    ContentType = blockBlob.Properties.ContentType
                };
               await blockBlob.DownloadToByteArrayAsync(result.Data, 0);
                return result;
            }
            
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error occurred in {MethodBase.GetCurrentMethod()?.Name} for Blob Container {blobContainerName} with Path {blobPath}.", ex);
                return null;
            }
        }

        public async Task<CloudBlockBlob> GetCloudBlockBlob(string blobContainerName, string blobPath)
        {
            CloudBlobContainer blobContainer;
            try
            {
                if (!EnsureBlobClient()) return null;

                blobContainer = _blobClient.GetContainerReference(blobContainerName);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to retrieve Blob Container {blobContainerName} with Path {blobPath}.", ex);
                return null;
            }


            CloudBlockBlob blob;
            try
            {
                blob = blobContainer.GetBlockBlobReference(blobPath);
                _logger.LogInformation($"Success to retrieve Blob Container {blobContainerName} with Path {blobPath}. ");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to retrieve Blob Container {blobContainerName} with Path {blobPath}.", ex);
                return null;
            }

            return await Task.FromResult(blob);
        }

        private bool EnsureBlobClient()
        {
            try
            {
                if (_storageAccount == null) return false;

                if (_blobClient == null)
                {
                    _blobClient = _storageAccount.CreateCloudBlobClient();
                    _blobClient.DefaultRequestOptions.RetryPolicy = new LinearRetry(new TimeSpan(0, 0, 1), 3);
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error occurred in EnsureBlobClient - ", ex);
                return false;
            }

        }
    }
}
