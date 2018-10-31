function toJapaneseDate(date, show_time) {
  if (typeof date === "number") {
    date = new Date(date);
  }
  if (typeof show_time === "undefined") {
    show_time = true;
  }
  
  var result = "%Y-%m-%d(%a) %h:%M";
  var weekdays = ["日", "月", "火", "水", "木", "金", "土"];
//  var result = result.replace('%Y', date.getFullYear().toString()) Strip year as LINE assumes dddd-dd-dd as TEL number
  var result = result.replace('%Y-', '')
    .replace("%m", ("00" + (date.getMonth() + 1).toString()).slice(-2))
    .replace("%d", ("00" + date.getDate().toString()).slice(-2))
    .replace("%a", weekdays[date.getDay()]);
  if (show_time) {
    result = result.replace("%h", ("00" + date.getHours().toString()).slice(-2))
      .replace("%M", ("00" + date.getMinutes().toString()).slice(-2));
  } else {
    result = result.replace(" %h:%M", "");
  }
  result = result.replace(/^\s*|\s*$/g, "");
  return result;
}


function toUniqueArray(arrArg) {
  return arrArg.filter(function(elem, pos, arr) {
    return arr.indexOf(elem) == pos;
  });
};


var closestDate = {
  monday: function() {
    var d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 + 1) % 7);
    return d;
  },
  thursday: function() {
    var d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 + 4) % 7);
    return d;
  },
  sunday: function() {
    var d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 + 0) % 7);
    return d;
  }
}

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}
