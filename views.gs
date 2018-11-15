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

// --------
// Reservation Views
// --------

function generateQuickReplyReservationMessage() {

  // Add nine hours because ISO timezone is always zero offset to UTC as denoted by the suffix "Z"
  var initialDatetimeString = new Date().toLINEString();
  var maxDatetimeString = new Date().addHours(24 * 14).toLINEString();

  return {
    type: "text",
    text: "予約メニューを表示します.",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/86/Modern-ftn-pen-cursive.jpg",
          action: {
            type: "postback",
            label: "新規予約",
            displayText: "新規予約",
            data: JSON.stringify({
              state: "RESERVATION_CREATE"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://techflourish.com/images/clipart-calendar-august-2015-22.jpg",
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
          imageUrl: "https://vignette.wikia.nocookie.net/oscarthegrouch/images/b/be/Trash_Can.jpg/revision/latest?cb=20120928224249",
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
          imageUrl: "https://pickup.cinemacafe.net/uploads/article/image/1906/card_haul.jpg",
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

function generateMessageForCreateReservationByFlex() {
  // This way is a little tricky and lacks generality.
  // First, make array containing every 30 min from now
  // with minutes 0 to two weeks later, then filter them
  // to get valid datetime, then filter again to push out occupied datetime.
  var unoccupied_candidate = [];
  var datetime = new Date();
  datetime.setMinutes(0, 0, 0);
  datetime.setHours(datetime.getHours() + 1);

  // Generate array containing Dates of every thirty minutes from now to two weeks
  for (var i = 0; i < 14 * 24 * 60; i += 30) {
    var ele_datetime = new Date(datetime.getTime())
    ele_datetime.setMinutes(ele_datetime.getMinutes() + i);
    unoccupied_candidate.push(ele_datetime);
  }
  var counted = reservation.countReservation(new Date(), null);

  var unoccupied = unoccupied_candidate.filter(function(datetime) {
    return isValidReservationDatetime(datetime);
  }).filter(function(datetime) {
    var timestamp = datetime.getTime();
    var isOccupied = false;
    if (counted.hasOwnProperty(timestamp)) {
      if (counted[timestamp] >= 6) {
        isOccupied = true;
      }
    }
    return !isOccupied;
  });

  var buttons = unoccupied.map(function(datetime) {
    return {
      type: "button",
      style: "link",
      action: {
        type: "postback",
        label: datetime.toJPString(),
        displayText: datetime.toJPString(),
        data: JSON.stringify({
          state: "RESERVATION_CREATE_CONFIRMATION",
          timestamp: datetime.getTime()
        })
      }
    }

  })

  return {
    type: "flex",
    altText: "This is a Flex Message",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "予約"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: buttons
        }
      }]
    }
  };
}

function generateMessageForConfirmReservation(event) {
  var userId = event.source.userId;

  if (event.postback.hasOwnProperty("params")) {
    // datetimepicker
    // event.postback.params.datetime is in format like "2018-11-05T21:00"
    var reservationDatetime = new Date(event.postback.params.datetime);
    var reservationTimestamp = reservationDatetime.getTime();
  } else if (event.postback.hasOwnProperty("data")) {
    // postback
    var data = JSON.parse(event.postback.data);
    var reservationTimestamp = data.timestamp;
    var reservationDatetime = new Date(reservationTimestamp);
  }
  var counted = reservation.countReservation(new Date(), null);

  if (!isValidReservationDatetime(reservationDatetime)) {
    return {
      type: "text",
      text: reservationDatetime.toJPString() + "は予約を受け付けていない時間です."
    }
  }

  if (counted.hasOwnProperty(reservationTimestamp)) {
    if (counted[reservationTimestamp] >= 6) {
      return {
        type: "text",
        text: reservationDatetime.toJPString() + "は満席です. 他の日時を試してください."
      };
    }
  }

  reservation.createReservation(userId, reservationDatetime);
  return {
    type: "text",
    text: reservationDatetime.toJPString() + "が予約されました. 以下のリンクからCalendarに追加できます.\n" + getGoogleCalendarLink(reservationDatetime)
  };
}

function generateMessageForReadReservation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var reservations = reservation.readReservation(userId, new Date());
  var text = reservations.map(function(row) {
    return new Date(parseInt(row[1])).toJPString() + ' ' + getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName;
  }).join("\n");
  text = text || "予約がありません.";

  return {
    type: "text",
    text: text
  };
}

function generateMessageForDeleteReservation(event) {
  var userId = event.source.userId;
  var reservations = reservation.readReservation(userId, new Date());

  if (reservations.length === 0) {
    return {
      type: "text",
      text: '予約がありません.'
    };
  }

  var actions = reservations.map(function(row) {
    var timestamp = parseInt(row[1]);
    return {
      type: "button",
      style: "link",
      action: {
        type: "postback",
        label: new Date(timestamp).toJPString(),
        displayText: new Date(timestamp).toJPString(),
        data: JSON.stringify({
          state: "RESERVATION_DELETE_CONFIRMATION",
          userId: userId,
          timestamp: timestamp
        })
      }
    }
  });

  return {
    type: "flex",
    altText: "This is a Flex Message",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "予約削除"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: actions
        }
      }]
    }
  };
}

function generateMessageForDeleteReservationConfirmation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var data = JSON.parse(event.postback.data);
  var response = reservation.deleteReservation(userId, data.timestamp);
  var text;
  if (response.status == 200) {
    text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + new Date(data.timestamp).toJPString() + "の予約を削除しました.";
  } else if (response.status == 404) {
    text = getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + "さんの" + new Date(data.timestamp).toJPString() + "の予約は削除済みです.";
  }
  return {
    type: "text",
    text: text
  };
}

// --------
// Workout Views
// --------

function generateQuickReplyWorkoutMessage() {
  return {
    type: "text",
    text: "筋トレのメニューを表示します",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://us.123rf.com/450wm/newartgraphics/newartgraphics1402/newartgraphics140200108/26170093-red-round-speech-bubble-with-video-icon.jpg?ver=6",
          action: {
            type: "camera",
            label: "トレーニング回数追加",
          }
        },
        {
          type: "action",
          imageUrl: "https://is5-ssl.mzstatic.com/image/thumb/Purple118/v4/c5/82/c4/c582c405-d78a-ba21-795d-560f19fef45a/AppIcon-1x_U007emarketing-85-220-0-6.png/246x0w.jpg",
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
          imageUrl: "https://pickup.cinemacafe.net/uploads/article/image/1906/card_haul.jpg",
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
  workout.create(userId, messageId);
  var today = new Date();
  var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  var count = workout.count(userId, firstDay)[0][1]; // workout.count() returns [[userid, count]];
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

  var counts = workout.count(userId, firstDay, lastDay);
  var text = counts.map(function(row) {
    return getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName + 'さんの' + monthToCount.toString() + '月のトレーニングは' + row[1].toString() + '回です.';
  }).join('\n').toString();
  text = text || 'トレーニング記録はありません.';

  return {
    type: "text",
    text: text
  };
}

// --------
// Welcome Message when you add chat bot to a freind list
// --------

function generateWelcomeMessage() {
  return {
    type: "text",
    text: "＜筋トレの回数について＞\n" +
      "バディトレでは、\n" +
      "・自身でトレーニングした際に動画をアップ\n" +
      "・バディトレに来た際にトレーニング動画をアップ\n" +
      "条件は1秒以上の動画であれば、他に指定はありません。\n" +
      "ただし、30分以上の高い強度でのトレーニングに限ります。\n" +
      "他の目的で動画をアップすることはお控えください。\n" +
      "その際に、過去の名将やボディビルダーの名言とともに、botが記憶します。\n" +
      "名言は単に意識が高くなるだけで、特に深い意味はありません笑 我々なりのユーモアです。\n" +
      "毎月トップの方にはプロテインか\"燃え燃え\"、そして２位の方にはBCAAをプレゼントします。\n" +
      "\n" +
      "＜削除について＞\n" +
      "今後は枠当たり６人限定です。これまでテスト運用していたbotはしっかり運用してまいります。６人を超えた枠には予約ができなくなります。\n" +
      "参加できなくなった場合は1時間前までを目安に削除してください。\n" +
      "あまり無断削除が多いとこちらも対応を考えないといけなくなります。\n" +
      "一方で、すぐに埋まるような現状が続きましたらクラス増設を検討いたします。一般的に皆様が夜これるであろう19−23時ごろまでは行うつもりです。"
  };
}

// --------
// Administrator Views
// --------

function generateQuickReplyAdminMessage() {
  return {
    type: "text",
    text: "管理者用メニューを選んでください",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://www.newsclick.in/sites/default/files/2018-03/rese12.jpg",
          action: {
            type: "postback",
            label: "全員の予約を表示",
            displayText: "全員の予約を表示",
            data: JSON.stringify({
              state: "ADMIN_RESERVATION_READ"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Fitness/580x350/Push-Up.jpg",
          action: {
            type: "postback",
            label: "全員の筋トレ回数を表示",
            displayText: "全員の筋トレ回数を表示",
            data: JSON.stringify({
              state: "ADMIN_WORKOUT_COUNT"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://pickup.cinemacafe.net/uploads/article/image/1906/card_haul.jpg",
          action: {
            type: "postback",
            label: "一般メニューを表示",
            displayText: "一般メニューを表示",
            data: JSON.stringify({
              state: "ROOT"
            })
          }
        }
      ]
    }
  }
}

function generateMessageForReadAllReservation() {
  var date = new Date();
  var countsObj = reservation.countReservation(new Date(date.getFullYear(), date.getMonth() - 3, 1), null);
  var counts = Object.keys(countsObj).map(function(key) {
    return [Number(key), countsObj[key]];
  });
  var latestMonth = new Date(counts[counts.length - 1][0]).getMonth() + 1;

  var latestCounts = counts.filter(function(row) {
    return new Date(row[0]).getMonth() + 1 === latestMonth;
  });
  var prevCounts = counts.filter(function(row) {
    return new Date(row[0]).getMonth() + 1 === latestMonth - 1;
  });
  var prevPrevCounts = counts.filter(function(row) {
    return new Date(row[0]).getMonth() + 1 === latestMonth - 2;
  });

  function convertArrToButtons(arr) {
    var contents = arr.map(function(row) {
      var JPString = new Date(parseInt(row[0])).toJPString();
      return {
        type: "button",
        style: "link",
        action: {
          type: "postback",
          label: JPString + " " + row[1] + "人",
          displayText: JPString,
          data: JSON.stringify({
            state: "RESERVATION_RETRIEVE",
            timestamp: parseInt(row[0])
          })
        }
      }
    }) || {
      type: "text",
      text: "予約がありません"
    };
    return contents;
  }

  var latestButtons = convertArrToButtons(latestCounts);
  var prevButtons = convertArrToButtons(prevCounts);
  var prevPrevButtons = convertArrToButtons(prevPrevCounts);

  return {
    type: "flex",
    altText: "This is a Flex Message",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: latestMonth.toString() + "月"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: latestButtons
        }
      }, {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: (latestMonth - 1).toString() + "月"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: prevButtons
        }
      }, {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: (latestMonth - 2).toString() + "月"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: prevPrevButtons
        }
      }]
    }
  };
}

function generateMessageForRetrieveReservation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var data = JSON.parse(event.postback.data);
  var res = reservation.retrieve(data.timestamp);
  var userIds = res.userIds;
  var users = userIds.map(function(userId) {
    return getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName
  });

  return {
    type: "text",
    text: new Date(data.timestamp).toJPString() + "\n" + users.join('\n')
  };
}

function generateMessageForCountAllWorkouts(getProfile, CHANNEL_ACCESS_TOKEN) {
  var userToCount = null;
  var date = new Date();
  var latestMonth = date.getMonth() + 1;

  // Latest month
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  var countsThisMonth = workout.count(userToCount, firstDay, lastDay);

  // Previous month
  var prevMonth = latestMonth - 1;
  var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var countsPrevMonth = workout.count(userToCount, firstDay, lastDay);

  function convertArrToButtons(arr) {
    if (arr.length === 0) {
      return [{
        type: "text",
        text: "まだ記録がありません."
      }];
    }
    var contents = arr.map(function(row) {
      var name = getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName;
      return {
        type: "button",
        style: "link",
        action: {
          type: "postback",
          label: name.substring(0, 8) + ": " + row[1].toString() + "回",
          displayText: name + ": " + row[1].toString() + "回",
          data: JSON.stringify({
            state: "WORKOUT_RETRIEVE",
            timestamp: parseInt(row[0])
          })
        }
      }
    });
    return contents;
  }

  var latestButtons = convertArrToButtons(countsThisMonth);
  var prevButtons = convertArrToButtons(countsPrevMonth);

  return {
    type: "flex",
    altText: "This is a Flex Message",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: latestMonth.toString() + "月"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: latestButtons
        }
      }, {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: prevMonth.toString() + "月"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: prevButtons
        }
      }]
    }
  };
}
