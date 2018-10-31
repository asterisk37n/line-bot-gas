var line_endpoint = 'https://api.line.me/v2/bot/message/reply';

function doGet(e) {
  return ContentService.createTextOutput(UrlFetchApp.fetch("http://ip-api.com/json"));
}

function generateMessageToTextMessage(event) {
  var userMessage = event.message.text;
  userMessage = userMessage.replace(/　/g, " "); // replace full-width space with half-width space
  if (userMessage.match(/よく生きるとは/)) {
    return {
      type: "text",
      text: "「よく生きる」とは「幸福に生きる」ことではないことを知ること、それが決定的に重要なのだ。"
    };
    
  } else if (userMessage.match(/^(admin|Admin|ADMIN|root|Root|ROOT|管理|全員|管理者)$/)) {
    return generateQuickReplyAdminMessage();
    
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
    
  } else if (data.state === "RESERVATION_CREATE_CONFIRMATION") {
    messages.push(generateMessageForReservationByDatetimePicker(event));
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

function doPost(e) {
  console.log(e);
  var contents = JSON.parse(e.postData.contents);
  var events = contents.events;

  for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var reply_token = event.replyToken;
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
      if (messages.length) {
        replyMessages(messages, reply_token);
      }
    console.log(contents.events[i]);
  }

  var user_message = '';
  return;
  if (user_message.match(/^予約作成$/)) {
    var monday = closestDate.monday();
    var thursday = closestDate.thursday();
    var sunday = closestDate.sunday()
    monday.setHours(0, 0, 0);
    thursday.setHours(0, 0, 0);
    sunday.setHours(0, 0, 0);

    var counted = reservation.countReservation(new Date(), null);

    var actions = [monday, thursday, sunday].sort(function(a, b) {
      return a - b;
    }).map(function(day) {
      return {
        type: "postback",
        label: toJapaneseDate(day.getTime(), time = false),
        data: JSON.stringify({
          action: "CREATE RESERVATION",
          phase: "SELECT TIME",
          userId: userId,
          timestamp: day.getTime()
        }),
      }
    });
    messages = [{
      type: "template",
      altText: "バディトレ出席登録",
      template: {
        "type": "buttons",
        "title": "バディトレ出席登録",
        "text": "該当する日付を選択してください.",
        "actions": actions
      }
    }];
  } else if (contents.events[0].type == "postback" && data.action == "CREATE RESERVATION" && data.phase == "SELECT TIME") {
    // user sent a day to come. GAS asks what time to come.
    var timestamp = data.timestamp;
    var date19h30 = new Date(timestamp);
    date19h30.setHours(19, 30, 0, 0);
    var date21h00 = new Date(timestamp);
    date21h00.setHours(20, 30, 0, 0);
    var counted = reservation.countReservation(new Date(), null);
    var users_reservation = reservation.readReservation(userId);
    var actions = [date19h30, date21h00].filter(function(date) { // Do not show user's reservation
      var user_reservation_unixtimes = users_reservation.map(function(row) {
        return row[1]
      });
      return user_reservation_unixtimes.indexOf(date.getTime()) == -1;
    }).filter(function(date) { // Do not show fully occupied event
      var unixtime = date.getTime()
      return !(counted.hasOwnProperty(unixtime) && counted[unixtime] >= 6);
    }).map(function(date) {
      return {
        "type": "postback",
        "label": toJapaneseDate(date),
        "data": JSON.stringify({
          action: "CREATE RESERVATION",
          phase: "CREATE RECORD",
          userId: userId,
          timestamp: date.getTime()
        }),
      }
    });

    if (actions.length == 0) {
      messages = [{
        type: "text",
        text: "この日は満席です. 他の日を選択してください"
      }];
    } else {
      console.log(actions);
      messages = [{
        "type": "template",
        "altText": "バディトレの開始時間を選んでください !",
        "template": {
          "type": "buttons",
          "title": "バディトレの開始時間を選んでください !",
          "text": "何時から参加しますか",
          "actions": actions
        }
      }];
    }

  } else if (contents.events[0].type == "postback" && data.action == "CREATE RESERVATION" && data.phase == "CREATE RECORD") {
    // user sent a timestamp to come. Put it into a sheet
    var timestamp = data.timestamp;
    var datetime = new Date(timestamp);
    var counted = reservation.countReservation(new Date(), null);
    if (counted.hasOwnProperty(timestamp) && counted[timestamp] >= 6) {
      messages = [{
        type: "text",
        text: toJapaneseDate(timestamp) + "は満席です. 他の日時を試してください."
      }];
    } else {
      var response = reservation.createReservation(userId, datetime);
      var text;
      if (response.status == 201) {
        text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + toJapaneseDate(timestamp) + "のバディトレ出席を予約しました."
      } else if (response.status == 409) {
        text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + toJapaneseDate(timestamp) + "のバディトレ出席は予約済みです."
      }
      messages = [{
        type: "text",
        text: text
      }];
    }
  } else if (user_message.match(/^予約(確認|表示)( 全員)?$/)) {
    if (user_message.match(/.*全員.*$/)) {
      var reservations = reservation.readReservation(null, new Date());
    } else {
      var reservations = reservation.readReservation(userId, new Date());
    }
    var text = reservations.map(function(row) {
      return toJapaneseDate(parseInt(row[1])) + ' ' + getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName;
    }).join("\n") || "予約がありません.";
    messages = [{
      type: "text",
      text: text
    }];
  } else if (user_message.match(/^予約(削除|キャンセル|取り?消し?)$/)) {
    var allReservations = reservation.readReservation(userId, new Date());
    reservations = allReservations.slice(-4, allReservations.length); // Line Message API allows up to four items
    var actions = reservations.map(function(row) {
      var timestamp = parseInt(row[1]);
      return {
        type: "postback",
        label: toJapaneseDate(timestamp),
        data: JSON.stringify({
          action: "DELETE RESERVATION",
          phase: "DELETE RECORD",
          userId: userId,
          timestamp: timestamp
        })
      }
    });

    if (actions.length == 0) {
      messages = [{
        type: "text",
        text: '予約がありません.'
      }];
    } else {
      messages = [{
        type: "template",
        altText: "バディトレ出席キャンセル",
        template: {
          "type": "buttons",
          "title": "バディトレ出席キャンセル",
          "text": "該当する日付を選択してください.",
          "actions": actions
        }
      }];
    }
  } else if (contents.events[0].type == "postback" && data.action == "DELETE RESERVATION") {
    var response = reservation.deleteReservation(userId, data.timestamp);
    var text;
    if (response.status == 200) {
      text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + toJapaneseDate(data.timestamp) + "の予約をキャンセルしました.";
    } else if (response.status == 404) {
      text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + toJapaneseDate(data.timestamp) + "の予約は削除済みです."
    }
    messages = [{
      type: "text",
      text: text
    }]
  } else if (message_type === "video") {
    training.create(userId, messageId);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var count = training.count(userId, firstDay)[0][1]; // training.count() returns [[userid, count]];
    console.log(count);
    messages = [{
      type: "text",
      text: "GOOD JOB! 今月" + count + '回目のトレーニングです。'
    }];
    messages.push({
      type: "text",
      text: maxim.readMaxim()[0]
    });

  } else if (user_message.match(/^カウント/)) {
    var date = new Date();
    var monthToCount = date.getMonth() + 1;
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    if (user_message.match(/.*先月.*/)) {
      monthToCount--;
      var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      var lastDay = new Date(date.getFullYear(), date.getMonth(), 1);
    }

    var userToCount;
    if (user_message.match(/.*全員.*/)) {
      userToCount = null;
    } else {
      userToCount = userId;
    }

    var counts = training.count(userToCount, firstDay, lastDay);
    var text = counts.map(function(row) {
      return getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName + 'さんの' + monthToCount.toString() + '月のトレーニングは' + row[1].toString() + '回です.';
    }).join('\n').toString();
    text = text || 'トレーニング記録はありません.';

    messages = [{
      type: "text",
      text: text
    }]

  } else if (contents.events[0].type === "postback" && data.action == "history" && data.phase == "retrieve") {
    console.log(data.timestamp);
    var res = reservation.retrieve(data.timestamp);
    var userIds = res.userIds;
    var users = userIds.map(function(userId){
      return getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName
    });

    messages = [{
      type: "text",
      text: toJapaneseDate(new Date(data.timestamp), true) + "\n"  + users.join('\n')
    }]
  }

  if (!messages) return;
  UrlFetchApp.fetch(line_endpoint, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': reply_token,
      'messages': messages || [{
        type: "text",
        text: "Error Occured"
      }],
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({
    'content': 'post ok'
  })).setMimeType(ContentService.MimeType.JSON);
}