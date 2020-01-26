USE [PracticeDb]
GO

INSERT INTO [dbo].[tblDepartment]
           ([Name])         
     VALUES
           ('CS'),
           ('E&C'),
           ('Mech'),
           ('BTech'),
           ('E&E')
GO




USE [PracticeDb]
GO
declare @did int = 5

INSERT INTO [dbo].[tblStudent]
           ([Name]
           ,[DepartmentId]
           ,[Address])           
     VALUES
           ('Prakash' + convert(varchar(1),@did),@did,'Adress'),
           ('Ramesh' + convert(varchar(1),@did),@did,'Adress'),
           ('Amit' + convert(varchar(1),@did),@did,'Adress'),
           ('Giri' + convert(varchar(1),@did),@did,'Adress'),
           ('Sunil' + convert(varchar(1),@did),@did,'Adress')
GO


--select distinct name, DepartmentId from [dbo].[tblStudent]


select s.name as StudentName, d.Id as DepartmentId from tblStudent s
join tblDepartment d
on s.DepartmentId = d.Id
--group by d.id,s.name
--order by s.name asc, d.Id desc





