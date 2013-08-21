using System.Collections.Generic;
using System.Collections.ObjectModel;
using Broadband.Editing.API.Database.Indexes;

namespace Broadband.Editing.API.Models
{
    public class Leaderboard
    {
        public Leaderboard(LeaderItem currentUser, IList<LeaderboardIndex.ReduceResult> standings)
        {
            Current = currentUser;

        }

        public LeaderItem Current { get; set; }
        public IList<LeaderItem> Standings { get; set; }
    }

    public class LeaderItem
    {
        public string Name { get; set; }
        public int EditCount { get; set; }
        public string RankCss { get; set; }
    }
}