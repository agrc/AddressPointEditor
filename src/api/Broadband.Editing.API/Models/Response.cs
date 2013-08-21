using System.Net;
using Newtonsoft.Json;

namespace Broadband.Editing.API.Models
{
    /// <summary>
    ///     A container class for returning api call results with status messages.
    /// </summary>
    public class ResponseContainer
    {
        public ResponseContainer()
        {
        }

        public ResponseContainer(int status)
        {
            Status = status;
        }
        
        public ResponseContainer(HttpStatusCode status) : this((int) status)
        {
        }

        public ResponseContainer(HttpStatusCode status, string message) : this((int) status)
        {
            Message = message;
        }

        [JsonProperty(PropertyName = "status")]
        public int Status { get; set; }

        [JsonProperty(PropertyName = "message")]
        public string Message { get; set; }

        public bool ShouldSerializeMessage()
        {
            return !string.IsNullOrEmpty(Message);
        }
    }

    /// <summary>
    ///     Generic Container for passing result data
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class ResponseContainer<T> : ResponseContainer where T : class
    {
        public ResponseContainer()
        {
        }

        public ResponseContainer(int status) : base(status)
        {
        }

        public ResponseContainer(HttpStatusCode status)
            : base((int) status)
        {
        }

        public ResponseContainer(int status, T result) : base(status)
        {
            Result = result;
        }

        public ResponseContainer(HttpStatusCode status, T result)
            : base((int) status)
        {
            Result = result;
        }

        [JsonProperty(PropertyName = "result")]
        public T Result { get; set; }
    }
}