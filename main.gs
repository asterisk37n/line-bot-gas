function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var events = contents.events;
  console.log(contents);
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var messages = generateMessagesToEvent(event);
    if (messages.length) { // TODO: think about when message length is greater than four
      console.log(messages);
      replyMessages(messages, event.replyToken);
    }
  }
  return;
}
