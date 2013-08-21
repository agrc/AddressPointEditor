using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Broadband.Editing.API.Controllers.Infrastructure;
using Broadband.Editing.API.Models;

namespace Broadband.Editing.API.Controllers
{
    public class ActivityController : RavenApiController
    {
        // POST api/activity/save
        [HttpPost]
        public async Task<HttpResponseMessage> Save(UserActivity activity)
        {
            try
            {
                using (var s = AsyncSession)
                {
                    await s.StoreAsync(activity);
                    await s.SaveChangesAsync();
                }
            }
            catch(Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                              new ResponseContainer(HttpStatusCode.InternalServerError, ex.Message));
            }
            
            //return response
            return Request.CreateResponse(HttpStatusCode.OK,
                new ResponseContainer(HttpStatusCode.Created));
        }
    }
}