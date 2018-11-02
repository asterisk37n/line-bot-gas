Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

Date.prototype.toLINEString = function() {
  // LINE datetime format follows RFC3339 but it drops seconds, milliseconds and timezone
  var japString = this.addHours(9).toISOString();
  var lineString = japString.substring(0, japString.length - 8);
  return lineString;
}

Date.prototype.toJPString = function(includeTime) {
  if (typeof includeTime === "undefined") {
    includeTime = true;
  }
  
  var result = "%Y-%m-%d(%a) %h:%M";
  var weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  result = result.replace('%Y-', '')
    .replace("%m", ("00" + (this.getMonth() + 1).toString()).slice(-2))
    .replace("%d", ("00" + this.getDate().toString()).slice(-2))
    .replace("%a", weekdays[this.getDay()]);
    
  if (includeTime) {
    result = result.replace("%h", ("00" + this.getHours().toString()).slice(-2))
      .replace("%M", ("00" + this.getMinutes().toString()).slice(-2));
      
  } else {
    result = result.replace(" %h:%M", "");
  }

  result = result.replace(/^\s*|\s*$/g, "");
  return result;
}