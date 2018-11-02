function doGet(e) {
  return ContentService.createTextOutput(UrlFetchApp.fetch("http://ip-api.com/json"));
}

function doPost(e) {
  console.log(e);
  var contents = JSON.parse(e.postData.contents);
  var events = contents.events;
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var replyToken = event.replyToken;
    var messages = generateMessagesToEvent(event);
    
    if (messages.length) {
      replyMessages(messages, replyToken);
    }
  }
  return;
}
