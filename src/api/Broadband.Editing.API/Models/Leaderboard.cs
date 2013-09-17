using System;
using System.Collections.Generic;
using System.Linq;
using Broadband.Editing.API.Database.Indexes;

namespace Broadband.Editing.API.Models
{
    public class Leaderboard
    {
        private string[] RankCss = new[] {"gold", "silver", "bronze"};
        private IList<LeaderItem> _standings;

        public Leaderboard(LeaderItem currentUser, IEnumerable<LeaderboardIndex.ReduceResult> standings)
        {
            Current = currentUser;
            Standings = standings.Select(x => new LeaderItem(x.Username, x.EditCount))
                                 .ToList();
        }

        public LeaderItem Current { get; set; }
        public IList<LeaderItem> Standings
        {
            get { return _standings; }
            set
            {
                for (var i = 0; i < RankCss.Length; i++)
                {
                    try
                    {
                        value[i].RankCss = RankCss[i];
                    }
                    catch (ArgumentOutOfRangeException)
                    {
                        //not enough editors yet
                    }
                }

                _standings = value;
            }
        }
    }

    public class LeaderItem
    {
        public LeaderItem(string name, int editCount)
        {
            Name = name;
            EditCount = editCount;
        }

        public string Name { get; set; }
        public int EditCount { get; set; }
        public string RankCss { get; set; }
    }
}