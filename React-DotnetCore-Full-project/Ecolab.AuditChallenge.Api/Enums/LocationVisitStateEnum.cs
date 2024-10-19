namespace Ecolab.AuditChallenge.Api.Enums
{
    public enum LocationVisitStateEnum
    {

        Unfinished = 1,
        ReadyForUpload = 2,
        UploadedToServer = 3,
        PayloadProcessingComplete = 4,
        VisitSubmitted = 5,
        PendingNewStore = 6,
        PendingQaApproval = 7,
        PendingVisitChangeApproval = 8,
        ReadyForWarehouse = 9,
        SentToWarehouse = 10,
        AvailableForReporting = 11,
        Deactivated = 12,
        Error = 13
    }
}
