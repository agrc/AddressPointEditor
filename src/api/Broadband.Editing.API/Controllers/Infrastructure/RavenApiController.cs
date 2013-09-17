using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using Ninject;
using Raven.Client;

namespace Broadband.Editing.API.Controllers.Infrastructure
{
    public abstract class RavenApiController : ApiController
    {
        private IDocumentSession _session;
        private IAsyncDocumentSession _asyncSession;
        private string _database;
        public string Database
        {
            get { return string.IsNullOrEmpty(_database) ? null : "app_" + _database.ToLowerInvariant(); }
            set { _database = value; }
        }

        [Inject]
        public IDocumentStore DocumentStore { get; set; }

        public IDocumentSession Session
        {
            get
            {
                if (_asyncSession != null)
                    throw new NotSupportedException("Can't use both sync & async sessions in the same action");
                return _session ?? (_session = DocumentStore.OpenSession(Database));
            }
            set { _session = value; }
        }

        public IAsyncDocumentSession AsyncSession
        {
            get
            {
                if (_session != null)
                    throw new NotSupportedException("Can't use both sync & async sessions in the same action");
                return _asyncSession ?? (_asyncSession = DocumentStore.OpenAsyncSession(Database));
            }
            set { _asyncSession = value; }
        }

        public override async Task<HttpResponseMessage> ExecuteAsync(HttpControllerContext controllerContext,
                                                                     CancellationToken cancellationToken)
        {
            var result = await base.ExecuteAsync(controllerContext, cancellationToken);

            if (_session != null)
                _session.SaveChanges();

            if (_asyncSession != null)
                await _asyncSession.SaveChangesAsync();

            return result;
        }
    }
}