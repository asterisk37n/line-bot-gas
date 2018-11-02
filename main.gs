function doPost(e) {
  console.log(e);
  var contents = JSON.parse(e.postData.contents);
  var events = contents.events;
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var replyToken = event.replyToken;
    var messages = generateMessagesToEvent(event);
    
    if (messages.length) {
      console.log(messages);
      replyMessages(messages, replyToken);
    }
  }
  return;
}
