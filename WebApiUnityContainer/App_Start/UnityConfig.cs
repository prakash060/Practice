using System.Web.Http;
using Unity;
using Unity.WebApi;
using WebApiUnityContainer.BusinessLogic;
using WebApiUnityContainer.DatabaseLogic;
using WebApiUnityContainer.Interfaces;

namespace WebApiUnityContainer
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
			var container = new UnityContainer();

            // register all your components with the container here
            // it is NOT necessary to register your controllers

            // e.g. container.RegisterType<ITestService, TestService>();
            container.RegisterType<IProductBl, ProductBl>();
            container.RegisterType<IProductDl, ProductDl>();
            GlobalConfiguration.Configuration.DependencyResolver = new UnityDependencyResolver(container);
        }
    }
}