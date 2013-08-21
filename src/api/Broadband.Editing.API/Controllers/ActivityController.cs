using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using Broadband.Editing.API.Models;

namespace Broadband.Editing.API.Controllers
{
    public class ActivityController : ApiController
    {
        // POST api/register
        [HttpPost]
        public async Task<ResponseContainer<ActivityResponse>> SaveEdits()
        {
            return new ResponseContainer();
        }

        // GET api/values/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}