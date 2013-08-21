using System.Net;
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
        public async Task<ResponseContainer> Save(UserActivity activity)
        {
            //Open connection to raven
            using (var s = AsyncSession)
            {
                //persist the change
                await s.StoreAsync(activity);
                await s.SaveChangesAsync();
            }

            

            //return response
            return new ResponseContainer(HttpStatusCode.Created);
        }
    }
}