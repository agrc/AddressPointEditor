using System.Net.Http.Formatting;
using WebApiContrib.Formatting.Jsonp;

namespace Broadband.Editing.API
{
    public class FormatterConfig
    {
        private static void RegisterFormatters(MediaTypeFormatterCollection formatters)
        {
            var jsonpFormatter = new JsonpMediaTypeFormatter(formatters.JsonFormatter);
            formatters.Insert(0, jsonpFormatter);
        }

        public static void Register(MediaTypeFormatterCollection config)
        {
            RegisterFormatters(config);
        }
    }
}