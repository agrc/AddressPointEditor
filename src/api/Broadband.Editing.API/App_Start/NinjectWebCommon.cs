using System;
using System.Web;
using System.Web.Http;
using Broadband.Editing.API;
using Broadband.Editing.API.Configuration.Ninject;
using Broadband.Editing.API.Configuration.Ninject.Modules;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;
using Ninject;
using Ninject.Web.Common;

[assembly: WebActivator.PreApplicationStartMethod(typeof(NinjectWebCommon), "Start")]
[assembly: WebActivator.ApplicationShutdownMethodAttribute(typeof(NinjectWebCommon), "Stop")]

namespace Broadband.Editing.API
{
    public static class NinjectWebCommon
    {
        private static readonly Bootstrapper Bootstrapper = new Bootstrapper();

        /// <summary>
        /// Starts the application
        /// </summary>
        public static void Start()
        {
            DynamicModuleUtility.RegisterModule(typeof(OnePerRequestHttpModule));
            DynamicModuleUtility.RegisterModule(typeof(NinjectHttpModule));
            Bootstrapper.Initialize(CreateKernel);
        }

        /// <summary>
        /// Stops the application.
        /// </summary>
        public static void Stop()
        {
            Bootstrapper.ShutDown();
        }

        /// <summary>
        /// Creates the kernel that will manage your application.
        /// </summary>
        /// <returns>The created kernel.</returns>
        private static IKernel CreateKernel()
        {
            App.Kernel = new StandardKernel();

            App.Kernel.Bind<Func<IKernel>>().ToMethod(ctx => () => new Bootstrapper().Kernel);
            App.Kernel.Bind<IHttpModule>().To<HttpApplicationInitializationHttpModule>();

            // Register Dependencies
            RegisterServices(App.Kernel);

            // Set Web API Resolver
            GlobalConfiguration.Configuration.DependencyResolver = new NinjectDependencyResolver(App.Kernel);

            return App.Kernel;
        }

        /// <summary>
        /// Load your modules or register your services here!
        /// </summary>
        /// <param name="kernel">The kernel.</param>
        private static void RegisterServices(IKernel kernel)
        {
            kernel.Load(typeof(RavenModule).Assembly);
        }
    }
}
