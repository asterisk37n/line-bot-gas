var line_endpoint = 'https://api.line.me/v2/bot/message/reply';

function doGet(e) {
  return ContentService.createTextOutput(UrlFetchApp.fetch("http://ip-api.com/json"));
}

function generateMessageToTextMessage(event) {
  var userMessage = event.message.text;
  if (userMessage.match(/^.+$/)) {
    return generateQuickReplyTopMessage();
  }
  return {};
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
        messages = generateMessagesToMessageEvent(event);
      
      } else if (event.type === "follow") {
      
      } else if (event.type === "unfollow") {
      
      } else if (event.type === "join") {
      
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
  

  
  var reply_token = contents.events[0].replyToken;

  var user_message = "";
  var message_id = '';
  var data = {};

  if (contents.events[0].type == "postback") {
    console.log(contents.events[0].postback.data);
    data = JSON.parse(contents.events[0].postback.data);
    console.log(data);
  } else if (contents.events[0].type == "message") {
    var messageId = contents.events[0].message.id;
    var message_type = contents.events[0].message.type;
    if (message_type === "text") {
      user_message = contents.events[0].message.text;
    } else if (message_type === "video") {}
  }
  user_message = user_message.replace(/　/g, " "); // replace full-width space with half-width space

  var messages;
  var userId = contents.events[0].source.userId;

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

  } else if (user_message.match(/^記録$/)) {
    var contents = []
    var counts = reservation.countReservation(null, null);
    var counts = Object.keys(counts).map(function(key) {
      return [Number(key), counts[key]];
    });
    contents = counts.map(function(row) {
      return {
        type: "button",
        style: "link",
        action: {
          type: "postback",
          label: toJapaneseDate(new Date(parseInt(row[0])), true) + " " + row[1] + "人",
          displayText: toJapaneseDate(new Date(parseInt(row[0])), false),
          data: JSON.stringify({
            action: "history",
            phase: "retrieve",
            timestamp: parseInt(row[0])
          })
        }
      }
    })

    messages = [{
      "type": "flex",
      "altText": "This is a Flex Message",
      "contents": {
        "type": "carousel",
        "contents": [{
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": contents.filter(function(row) {
            return new Date(row.action.data.timestamp).getMonth() == new Date().getMonth()})
          }
        },
        {
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": contents
          }
        }
        ]
      }
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

  } else if (contents.events[0].type === "join") {
    messages = [];
    messages.push({
      type: "text",
      text: "＜予約ルールについて＞\nバディトレは少人数制ワークアウトに伴い、以前からテスト運用をしていたbotをより簡素化して、LINE上で使えるようにいたしました。"
    })
    messages.push({
      type: "text",
      text: "<コマンド一覧>\n予約作成: 直近の予約を行います\n予約確認: 自身の予約を確認\n予約削除: 自身の予約を削除\nカウント: 自身のトレーニング回数のカウント\nカウント 先月: 自身の先月のトレーニング回数のカウント\nヘルプ: 上記コマンドを参照\n\nのいずれかを入力してください.\n" +
        "また、動画を投稿するとトレーニング回数をカウントします。\n改善後の仕様としては、名前を登録する手間が省けました"
    })
    messages.push({
      type: "text",
      text: "＜カウントについて＞\n" +
        "バディトレでは、\n" +
        "・自身でトレーニングした際に動画をアップ\n" +
        "・バディトレに来た際にトレーニング動画をアップ\n" +
        "条件は1秒以上の動画であれば特に指定はありません。\n" +
        "30分以上の高い強度でのトレーニングをさします。\n" +
        "したがいまして、他の目的で動画をアップすることはお控えください。\n" +
        "その際に、過去の名将やボディビルダーの名言とともに、botが記憶します。\n" +
        "名言は単に意識が高くなるだけで、特に深い意味はありません笑 我々なりのユーモアです。\n" +
        "毎月トップの方にはプロテインか「燃え燃え」、そして２位の方にはBCAAをプレゼントします。botにデザイン変更してあります。\n" +
        "上記のコマンドを忘れてしまった時は\n" +
        "ヘルプ\n" +
        "と入力していただくことで、一覧が出ます。"
    })
    messages.push({
      type: "text",
      text: "＜キャンセルについて＞\n" +
        "今後は６人限定ということでこれまでテスト運用していたbotはしっかり運用してまいります。なお、最初は少々紛らわしかとは思いますが、６人を超えると予約ができなくなります。\n" +
        "ですので、キャンセルコマンドも用意しましたので、いけない場合は1時間前を目安にご連絡ください。\n" +
        "あまり無断キャンセルが多いとこちらも対応を考えないといけなくなります。\n" +
        "一方で、すぐに埋まるような現状が続きましたらクラス増設を検討いたします。一般的に皆様が夜これるであろう19−23時ごろまでは行うつもりです。"
    })
    //    messages.push({
    //      type: "text",
    //      text: JSON.stringify(e, null, 2)
    //    });

  } else if (user_message.match(/^(help|ヘルプ|へるぷ|使い方)$/)) {
    messages = [{
      type: "text",
      text: "<コマンド一覧>\n予約作成: 直近の予約を行います\n予約確認: 自身の予約を確認\n予約削除: 自身の予約を削除\nカウント: 自身のトレーニング回数のカウント\nカウント 先月: 自身の先月のトレーニング回数のカウント\nヘルプ: 上記コマンドを参照\n\nのいずれかを入力してください.\n" +
        "また、動画を投稿するとトレーニング回数をカウントします。\n改善後の仕様としては、名前を登録する手間が省けました"
    }]
  } else if (user_message.match(/よく生きるとは/)) {
    messages = [{
      type: "text",
      text: "「よく生きる」とは「幸福に生きる」ことではないことを知ること、それが決定的に重要なのだ。"
    }]
  } else if (user_message.match(/幸福とは/)) {
    messages = [{
      type: "text",
      text: "幸福とは、思考の停止であり、視野の切り捨てであり、感受性の麻痺である。つまり、大いなる錯覚である。世の中には、この錯覚に陥っている人と、陥りたいと願う人と、陥ることができなくてもがいている人と、陥ることをあきらめている人がいる。ただそれだけである。"
    }]
  } else if (user_message.match(/くいっく/)){

    
  } else if (user_message.match(/予約123/)) {
    messages = [
      {
        "type": "text", // ①
        "text": "Select your favorite food category or send me your location!",
        "quickReply": { // ②
          "items": [
            {
              "type": "action", // ③
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Various_sushi%2C_beautiful_October_night_at_midnight.jpg/1200px-Various_sushi%2C_beautiful_October_night_at_midnight.jpg",
              "action": {
                "type": "message",
                "label": "メニューに戻る",
                "text": "くいっく"
              }
            },
            {
              "type": "action",
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Various_sushi%2C_beautiful_October_night_at_midnight.jpg/1200px-Various_sushi%2C_beautiful_October_night_at_midnight.jpg",
              "action": {  
                "type":"datetimepicker",
                "label":"開始日時を選ぶ",
                "data":JSON.stringify({"state":"CREATE_RESERVATION"}),
                "mode":"datetime",
                "initial":"2017-12-25t00:00",
                "max":"2019-01-24t23:59",
                "min":"2017-12-25t00:00"
              }
            },
            {
              "type": "action", // ④
              "action": {
                "type": "location",
                "label": "Send location"
              }
            }
          ]
        }
      }
    ]
  } else if (contents.events[0].type == "postback" && data.state == "CREATE_RESERVATION") {
    console.log(contents.events[0].postback.params);
  }

  console.log({
    reply_token: reply_token,
    messages: messages
  });
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