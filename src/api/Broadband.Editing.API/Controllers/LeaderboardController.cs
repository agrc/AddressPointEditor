using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Broadband.Editing.API.Controllers.Infrastructure;
using Broadband.Editing.API.Database.Indexes;
using Broadband.Editing.API.Models;
using Raven.Client;

namespace Broadband.Editing.API.Controllers
{
    public class LeaderboardController : RavenApiController
    {
        // GET api/leaderboard
        [HttpGet]
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                IList<LeaderboardIndex.ReduceResult> standings;
                LeaderboardIndex.ReduceResult currentRank;

                using (var s = AsyncSession)
                {
                    standings = await s.Query<LeaderboardIndex.ReduceResult, LeaderboardIndex>()
                                       .Take(3)
                                       .OrderByDescending(x=>x.EditCount)
                                       .ToListAsync();
                }

                var leaderboard = new Leaderboard(null, standings);

                return Request.CreateResponse(HttpStatusCode.OK, leaderboard);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}