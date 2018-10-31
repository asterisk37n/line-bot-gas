function generateQuickReplyTopMessage() {
  return {
    type: "text",
    text: "メニューを選んでください",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://www.newsclick.in/sites/default/files/2018-03/rese12.jpg",
          action: {
            type: "postback",
            label: "予約",
            displayText: "予約メニューを表示",
            data: JSON.stringify({
              state: "RESERVATION"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Fitness/580x350/Push-Up.jpg",
          action: {
            type: "postback",
            label: "筋トレ",
            displayText: "筋トレのメニューを表示して",
            data: JSON.stringify({
              state: "WORKOUT"
            })
          }
        }
      ]
    }
  }
}

function generateQuickReplyReservationMessage() {
  return {
    type: "text",
    text: "予約メニューを選んでください",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://cdn5.vectorstock.com/i/1000x1000/90/64/the-pen-icon-fountain-pen-symbol-flat-vector-5429064.jpg",
          action: {
            type: "datetimepicker",
            label: "新規予約",
            data: JSON.stringify({
              state: "RESERVATION_CREATE_CONFIRMATION"
            }),
            mode: "datetime"
            //                initial: 
            //                max:
            //                min:
          }
        },
        {
          type: "action",
          imageUrl: "https://image.freepik.com/free-icon/calendar-interface-symbol-tool_318-58214.jpg",
          action: {
            type: "postback",
            label: "予約確認",
            displayText: "予約を確認",
            data: JSON.stringify({
              state: "RESERVATION_READ"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://image.freepik.com/free-icon/trash-bin-symbol_318-10194.jpg",
          action: {
            type: "postback",
            label: "予約削除",
            displayText: "予約を削除",
            data: JSON.stringify({
              state: "RESERVATION_DELETE"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://image.freepik.com/free-icon/home_318-42210.jpg",
          action: {
            type: "postback",
            label: "最初に戻る",
            displayText: "最初に戻る",
            data: JSON.stringify({
              state: "ROOT"
            })
          }
        }
      ]
    }
  }
}

function generateMessageForReservationByDatetimePicker(event) {
  var userId = event.source.userId;
  var reservation_datetime = new Date(event.postback.params.datetime);
  var counted = reservation.countReservation(new Date(), null);
  var messages = [];
  if (counted.hasOwnProperty(reservation_datetime) && counted[reservation_datetime] >= 6) {
    return {
      type: "text",
      text: toJapaneseDate(reservation_datetime) + "は満席です. 他の日時を試してください."
    };
  }
  reservation.createReservation(userId, reservation_datetime);
  return {
    type: "text",
    text: toJapaneseDate(reservation_datetime) + "が予約されました. 以下のリンクからCalendarに追加できます.\n" + getGoogleCalendarLink(reservation_datetime)
  };
}

function generateMessageForReadReservation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var reservations = reservation.readReservation(userId, new Date());
  var text = reservations.map(function(row) {
    return toJapaneseDate(parseInt(row[1])) + ' ' + getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName;
  }).join("\n");
  text = text || "予約がありません.";
  
  return {
    type: "text",
    text: text
  };
}

function generateMessageForDeleteReservation(event) {
  var userId = event.source.userId;
  var allReservations = reservation.readReservation(userId, new Date());
  reservations = allReservations.slice(-4, allReservations.length); // Line Message API allows up to four items
  var actions = reservations.map(function(row) {
    var timestamp = parseInt(row[1]);
    return {
      type: "postback",
      label: toJapaneseDate(timestamp),
      data: JSON.stringify({
        state: "RESERVATION_DELETE_CONFIRMATION",
        userId: userId,
        timestamp: timestamp
      })
    }
  });
  
  if (actions.length === 0) {
    return {
      type: "text",
      text: '予約がありません.'
    };
  }
  
  return {
    type: "template",
    altText: "バディトレ出席キャンセル",
    template: {
      "type": "buttons",
      "title": "バディトレ出席キャンセル",
      "text": "該当する日付を選択してください.",
      "actions": actions
    }
  };
}

function generateMessageForDeleteReservationConfirmation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var data = JSON.parse(event.postback.data);
  var response = reservation.deleteReservation(userId, data.timestamp);
  var text;
  if (response.status == 200) {
    text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + toJapaneseDate(data.timestamp) + "の予約をキャンセルしました.";
  } else if (response.status == 404) {
    text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + toJapaneseDate(data.timestamp) + "の予約は削除済みです.";
  }
  return {
    type: "text",
    text: text
  };
}

function generateQuickReplyWorkoutMessage() {
  return {
    type: "text",
    text: "筋トレのメニューを選んでください",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://cdn5.vectorstock.com/i/1000x1000/90/64/the-pen-icon-fountain-pen-symbol-flat-vector-5429064.jpg",
          action: {
            type: "camera",
            label: "トレーニング回数追加",
          }
        },
        {
          type: "action",
          imageUrl: "https://image.freepik.com/free-icon/calendar-interface-symbol-tool_318-58214.jpg",
          action: {
            type: "postback",
            label: "回数確認",
            displayText: "今月のトレーニング回数を確認",
            data: JSON.stringify({
              state: "WORKOUT_COUNT"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://image.freepik.com/free-icon/home_318-42210.jpg",
          action: {
            type: "postback",
            label: "最初に戻る",
            displayText: "最初に戻る",
            data: JSON.stringify({
              state: "ROOT"
            })
          }
        }
      ]
    }
  }
}

function generateMessageForAddWorkout(event) {
  var userId = event.source.userId;
  var messageId = event.message.id
  training.create(userId, messageId);
  var today = new Date();
  var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  var count = training.count(userId, firstDay)[0][1]; // training.count() returns [[userid, count]];
  var message = {
    type: "text",
    text: "GOOD JOB! 今月" + count + '回目のトレーニングです.'
  };
  return message;
}

function generateMessageForRandomMaxim() {
  var message = {
    type: "text",
    text: maxim.readMaxim()[0]
  };
  return message;
}

function generateMessageForCountWorkout(event, getProfile, CANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var date = new Date();
  var monthToCount = date.getMonth() + 1;
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
//    if (user_message.match(/.*先月.*/)) {
//      monthToCount--;
//      var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
//      var lastDay = new Date(date.getFullYear(), date.getMonth(), 1);
//    }
//
//    var userToCount;
//    if (user_message.match(/.*全員.*/)) {
//      userToCount = null;
//    } else {
//      userToCount = userId;
//    }

  var counts = training.count(userId, firstDay, lastDay);
  var text = counts.map(function(row) {
    return getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName + 'さんの' + monthToCount.toString() + '月のトレーニングは' + row[1].toString() + '回です.';
  }).join('\n').toString();
  text = text || 'トレーニング記録はありません.';
  
  return {
    type: "text",
    text: text
  };
}

function generateWelcomeMessage(){}