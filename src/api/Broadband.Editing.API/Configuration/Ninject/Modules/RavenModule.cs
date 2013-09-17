using System.Net;
using Broadband.Editing.API.Database.Indexes;
using Ninject.Activation;
using Ninject.Modules;
using Raven.Client;
using Raven.Client.Document;

namespace Broadband.Editing.API.Configuration.Ninject.Modules
{
    public class RavenModule : NinjectModule
    {
        public override void Load()
        {
            Bind<IDocumentStore>()
                .ToMethod(Init)
                .InSingletonScope();
        }

        private static IDocumentStore Init(IContext context)
        {
            var documentStore = new DocumentStore
            {
                ConnectionStringName = "RavenDb"
            }.Initialize();

            documentStore.JsonRequestFactory.ConfigureRequest +=
                (sender, args) =>
                {
                    args.Request.PreAuthenticate = true;
                    ((HttpWebRequest)args.Request).UnsafeAuthenticatedConnectionSharing = true;
                };

            RavenConfig.Register(typeof(LeaderboardIndex), documentStore);

            return documentStore;
        }
    }
}