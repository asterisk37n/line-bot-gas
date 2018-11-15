var reservation = {
  sheet: SpreadsheetApp.getActive().getSheetByName('reservation'),

  /**
   * reservation creater. userId and datetime are not unique columns
   * @param  {[string]} userId [Line User ID]
   * @param  {[Date]} datetime [date object]
   */
  createReservation: function(userId, datetime) {
    var data = this.sheet.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (row[0] == userId && parseInt(row[1]) == datetime.getTime()) {
        return {
          status: 409
        };
      }
    }
    return {
      status: 201,
      sheet: this.sheet.appendRow([userId, datetime.getTime(), datetime.toString(), getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName])
    };
  },

  readReservation: function(userId, from, to) {
    userId = (typeof userId !== 'undefined') ? userId : "";
    var data = this.sheet.getDataRange().getValues();
    data = data.slice(1, data.length); // skip table header

    if (userId) {
      data = data.filter(function(row) {
        return row[0] === userId;
      });
    }

    if (from) {
      var from_unixtime = from.getTime();
      data = data.filter(function(row) {
        return parseInt(row[1]) > from_unixtime;
      });
    }

    if (to) {
      var to_unixtime = to.getTime();
      data = data.filter(function(row) {
        return parseInt(row[1]) < to_unixtime;
      });
    }

    data = data.sort(function(a, b) {
      return parseInt(a[1]) - parseInt(b[1]); // sort ascending by unix_epoch
    }).map(function(row) {
      return [row[0], parseInt(row[1]), row[2]];
    });
    return data;
  },

  deleteReservation: function(userId, from) {
    from = (typeof from !== 'string') ? from : from.toString();
    var data = this.sheet.getDataRange().getValues();
    for (var i = data.length - 1; i >= 0; i--) {
      if (data[i][0] == userId && data[i][1] == from) {
        this.sheet = this.sheet.deleteRow(i + 1); // sheet row number starts from 1
        return {
          status: 200,
          row: data[i],
          sheet: this.sheet
        };
      }
    }
    return {
      status: 404
    };
  },

  countReservation: function(from, to) {
    var data = this.readReservation(null, from, to);
    var counted = data.reduce(function(accum, row) {
      var unixtime = parseInt(row[1]);
      if (unixtime in accum) {
        accum[unixtime]++;
      } else {
        accum[unixtime] = 1;
      }
      return accum;
    }, {}); // ex: {1533551400000: 2, 1534069800000: 6}
    return counted;
  },

  /**
   * retrieve specific date
   * @param  {[int]} unixtime
   */
  retrieve: function(unixtime) {
    var data = this.readReservation(null, null);
    var data = data.filter(function(row) {
      return parseInt(row[1]) == unixtime;
    });
    var userIds = data.map(function(row) {
      return row[0]
    });
    return {
      timestamp: unixtime,
      userIds: userIds
    };
  }
}