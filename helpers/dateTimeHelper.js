exports.humanizeDateTime = function(dateTime) {
  return new Date(dateTime).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  )
}