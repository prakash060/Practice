USE [AuditChallenge]

IF NOT EXISTS (SELECT 1 FROM [dbo].[AccountConfiguration])
BEGIN
	INSERT INTO [dbo].[AccountConfiguration] 
           ([AccountId]
           ,[AccountName]
           ,[LimitToChallenge]
           ,[LimitToReview]
           ,[ChangedDate]
           ,[IsActive])
     VALUES
           (NEWID(),'Test account',150,150,GETDATE(),1)
END
GO

IF NOT EXISTS (SELECT [EmailId] FROM [dbo].[RoleConfiguration] where [EmailId] = 'TestAccount@ecolab.com')
BEGIN
	INSERT INTO [dbo].[RoleConfiguration]
           ([EmailId]
           ,[RoleId]
           ,[ChangedDate]
           ,[IsActive])
     VALUES
           ('TestAccount@ecolab.com',3,GETDATE(),1)
END
GO

IF NOT EXISTS (SELECT [EmailId] FROM [dbo].[RoleConfiguration] where [EmailId] = 'prakash.betageri@ecolab.com')
BEGIN
	INSERT INTO [dbo].[RoleConfiguration]
           ([EmailId]
           ,[RoleId]
           ,[ChangedDate]
           ,[IsActive])
     VALUES
           ('prakash.betageri@ecolab.com',3,GETDATE(),1)
END
GO

IF NOT EXISTS (SELECT [EmailId] FROM [dbo].[RoleConfiguration] where [EmailId] = 'hamza.tahirkheli@ecolab.com')
BEGIN
	INSERT INTO [dbo].[RoleConfiguration]
           ([EmailId]
           ,[RoleId]
           ,[ChangedDate]
           ,[IsActive])
     VALUES
           ('hamza.tahirkheli@ecolab.com',3,GETDATE(),1)
END
GO