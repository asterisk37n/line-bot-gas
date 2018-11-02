function generateMessagesToEvent(event) {
  var messages = [];

  if (event.type === "message") {
    messages = messages.concat(generateMessagesToMessageEvent(event));

  } else if (event.type === "follow") {

  } else if (event.type === "unfollow") {

  } else if (event.type === "join") {
    messages.push(generateWelcomeMessage());
    messages.push(generateQuickReplyTopMessage());

  } else if (event.type === "leave") {

  } else if (event.type === "postback") {
    messages = generateMessagesToPostbackEvent(event);

  } else if (event.type === "beacon") {

  } else if (event.type === "accountLink") {

  }
  return messages;
}

function generateMessagesToMessageEvent(event) {
  var messageType = event.message.type;
  var messages = [];

  if (messageType === "text") {
    var messageToTextMessage = generateMessageToTextMessage(event);
    if (messageToTextMessage) { // message can be null depeding on recieved message text
      messages.push(messageToTextMessage);
    }

  } else if (messageType === "image") {

  } else if (messageType === "video") {
    messages.push(generateMessageForAddWorkout(event));
    messages.push(generateMessageForRandomMaxim());
    messages.push(generateQuickReplyWorkoutMessage());

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

function generateMessagesToPostbackEvent(event) {
  var data = JSON.parse(event.postback.data);
  var messages = [];

  if (data.state === "ROOT") {
    messages.push(generateQuickReplyTopMessage());

  } else if (data.state === 'RESERVATION') {
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_CREATE") {
    messages.push(generateMessageForCreateReservationByFlex());
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_CREATE_CONFIRMATION") {
    messages.push(generateMessageForConfirmReservation(event));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_READ") {
    messages.push(generateMessageForReadReservation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_DELETE") {
    messages.push(generateMessageForDeleteReservation(event));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_DELETE_CONFIRMATION") {
    messages.push(generateMessageForDeleteReservationConfirmation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "WORKOUT") {
    messages.push(generateQuickReplyWorkoutMessage());

  } else if (data.state === "WORKOUT_COUNT") {
    messages.push(generateMessageForCountWorkout(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyWorkoutMessage());

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
