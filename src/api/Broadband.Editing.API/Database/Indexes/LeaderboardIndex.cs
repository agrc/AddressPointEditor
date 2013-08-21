using System.Linq;
using Broadband.Editing.API.Models;
using Raven.Abstractions.Indexing;
using Raven.Client.Indexes;

namespace Broadband.Editing.API.Database.Indexes
{
    public class LeaderboardIndex : AbstractIndexCreationTask<UserActivity, LeaderboardIndex.ReduceResult>
    {
        public LeaderboardIndex()
        {
            Map = activity => from acts in activity
                              select new
                                  {
                                      acts.Username,
                                      EditCount = 1
                                  };

            Reduce = results => from result in results
                                group result by result.Username
                                into g
                                select new
                                    {
                                        Username = g.Key,
                                        EditCount = g.Sum(x => x.EditCount)
                                    };

            Sort(x => x.EditCount, SortOptions.Int);
        }

        public class ReduceResult
        {
            public string Username { get; set; }
            public int EditCount { get; set; }
        }
    }
}