using System;

namespace Broadband.Editing.API.Models
{
    public class UserActivity
    {
        public string UserName { get; set; }
        public string[] Changes { get; set; }

        public DateTime Date
        {
            get { return DateTime.UtcNow; }
        }
    }
}