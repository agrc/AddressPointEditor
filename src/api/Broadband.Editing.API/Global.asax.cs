using System.Web.Http;
using Ninject;

namespace Broadband.Editing.API
{
    public class App : System.Web.HttpApplication
    {
        public static IKernel Kernel { get; set; }

        protected void Application_Start()
        {
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FormatterConfig.Register(GlobalConfiguration.Configuration.Formatters);
        }
    }
}