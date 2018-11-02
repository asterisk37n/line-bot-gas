function generateMessagesToMessageEvent(event) {
  var messageId = event.message.id;
  var messageType = event.message.type;
  var userMessage = event.message.text;
  var replyToken = event.replyToken;
  var messages = [];
  if (messageType === "text") {
    var message = generateMessageToTextMessage(event);
    if (message) {
      messages.push(message);
    }
  } else if (messageType === "image") {

  } else if (messageType === "video") {
    messages.push(generateMessageForAddWorkout(event));
    var maximMessage = generateMessageForRandomMaxim();
    messages.push(maximMessage);
    var quickReplyWorkoutMessage = generateQuickReplyWorkoutMessage();
    messages.push(quickReplyWorkoutMessage);

  } else if (messageType === "audio") {

  } else if (messageType === "file") {

  } else if (messageType === "location") {

  } else if (messageType === "sticker") {

  }
  return messages;
}

function generateMessageToTextMessage(event) {
  var userMessage = event.message.text;
  userMessage = userMessage.replace(/　/g, " "); // replace full-width space with half-width space
  if (userMessage.match(/よく生きるとは/)) {
    return {
      type: "text",
      text: "「よく生きる」とは「幸福に生きる」ことではないことを知ること、それが決定的に重要なのだ。"
    };

  } else if (userMessage.match(/^(admin|Admin|ADMIN|root|Root|ROOT|管理|全員|管理者|管理用)$/)) {
    return generateQuickReplyAdminMessage();

  } else if (userMessage.match(/^debug$/)) {
    return generateMessageForCreateReservationByFlex();
  
  } else if (userMessage.match(/^.+$/)) {
    return generateQuickReplyTopMessage();
  }
}

function generateMessagesToMessageEvent(event) {
  var messageId = event.message.id;
  var messageType = event.message.type;
  var userMessage = event.message.text;
  var replyToken = event.replyToken;
  var messages = [];
  if (messageType === "text") {
    var message = generateMessageToTextMessage(event);
    if (message) {
      messages.push(message);
    }
  } else if (messageType === "image") {

  } else if (messageType === "video") {
    messages.push(generateMessageForAddWorkout(event));
    var maximMessage = generateMessageForRandomMaxim();
    messages.push(maximMessage);
    var quickReplyWorkoutMessage = generateQuickReplyWorkoutMessage();
    messages.push(quickReplyWorkoutMessage);

  } else if (messageType === "audio") {

  } else if (messageType === "file") {

  } else if (messageType === "location") {

  } else if (messageType === "sticker") {

  }
  return messages;
}

function generateMessagesToPostbackEvent(event) {
  var replyToken = event.replyToken;
  var data = JSON.parse(event.postback.data);
  var messages = [];
  var data = JSON.parse(event.postback.data);

  if (data.state === "ROOT") {
    var quickReplyTopMessage = generateQuickReplyTopMessage();
    messages.push(quickReplyTopMessage);

  } else if (data.state === 'RESERVATION') {
    var quickReplyReservationMessage = generateQuickReplyReservationMessage();
    messages.push(quickReplyReservationMessage);
    
  } else if (data.state === "RESERVATION_CREATE") {
    messages.push(generateMessageForCreateReservationByFlex());
    var quickReplyReservationMessage = generateQuickReplyReservationMessage();
    messages.push(quickReplyReservationMessage);

  } else if (data.state === "RESERVATION_CREATE_CONFIRMATION") {
    messages.push(generateMessageForConfirmReservation(event));
    var quickReplyReservationMessage = generateQuickReplyReservationMessage();
    messages.push(quickReplyReservationMessage);

  } else if (data.state === "RESERVATION_READ") {
    messages.push(generateMessageForReadReservation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    var quickReplyReservationMessage = generateQuickReplyReservationMessage();
    messages.push(quickReplyReservationMessage);

  } else if (data.state === "RESERVATION_DELETE") {
    messages.push(generateMessageForDeleteReservation(event));
    var quickReplyReservationMessage = generateQuickReplyReservationMessage();
    messages.push(quickReplyReservationMessage);

  } else if (data.state === "RESERVATION_DELETE_CONFIRMATION") {
    messages.push(generateMessageForDeleteReservationConfirmation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    var quickReplyReservationMessage = generateQuickReplyReservationMessage();
    messages.push(quickReplyReservationMessage);

  } else if (data.state === "WORKOUT") {
    var quickReplyWorkoutMessage = generateQuickReplyWorkoutMessage();
    messages.push(quickReplyWorkoutMessage);

  } else if (data.state === "WORKOUT_COUNT") {
    messages.push(generateMessageForCountWorkout(event, getProfile, CHANNEL_ACCESS_TOKEN));
    var quickReplyWorkoutMessage = generateQuickReplyWorkoutMessage();
    messages.push(quickReplyWorkoutMessage);

  } else if (data.state === "ADMIN_RESERVATION_READ") {
    messages.push(generateMessageForReadAllReservation());
    messages.push(generateQuickReplyAdminMessage());

  } else if (data.state === "RESERVATION_RETRIEVE") {
    messages.push(generateMessageForRetrieveReservation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyAdminMessage());

  } else if (data.state === "ADMIN_WORKOUT_COUNT") {
    messages.push(generateMessageForCountAllWorkouts(getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyAdminMessage());
  }

  return messages;
}