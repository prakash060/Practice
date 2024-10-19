/****** Object:  Table [dbo].[RoleConfiguration]    Script Date: 17-08-2024 11:27:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoleConfiguration](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[EmailId] [nvarchar](max) NOT NULL,
	[RoleId] [int] NOT NULL,
	[ChangedDate] [datetime2](7) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_RoleConfiguration] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
