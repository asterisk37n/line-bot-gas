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
      console.log(row, datetime);
      if (row[0] == userId && parseInt(row[1]) == datetime.getTime()) {
        return {status: 409};
      }
    }
    return {status: 201, sheet: this.sheet.appendRow([userId, datetime.getTime(), datetime.toString()])};
  },

  readReservation: function(userId, from) {
    userId = (typeof userId !== 'undefined') ? userId : "";
    var data = this.sheet.getDataRange().getValues();
    data = data.slice(1, data.length); // skip table header
    
    if (userId) {
      data = data.filter(function(row){
        return row[0] === userId;
      });
    }

    if (from) {
      var from_unixtime = from.getTime();
      data = data.filter(function(row){
        return parseInt(row[1]) > from_unixtime;
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
    for (var i = data.length - 1; i >= 0 ; i--) {
      if (data[i][0] == userId && data[i][1] == from) {
        this.sheet = this.sheet.deleteRow(i + 1); // sheet row number starts from 1
        return {status: 200, row: data[i], sheet: this.sheet};
      }
    }
    return {status: 404};
  },
  
  countReservation: function(from, to) {
    var data = this.readReservation(null, from);
    var counted = data.reduce(function (accum, row){
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
    var data = data.filter(function(row){
      return parseInt(row[1]) == unixtime;
    });
    var userIds = data.map(function(row) {return row[0]});
    return {timestamp: unixtime, userIds: userIds};
  }
}

function testCreate() {
  var res = reservation.createReservation('id', new Date());
  console.log(res);
}

function testRead() {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var res = reservation.readReservation('Ud7c64457bd6514f35958e78b1dd0df37', firstDay);
  console.log(res);
}

function testCount() {
  var countsTime = reservation.countReservation(null, null, false);
  var countsDate = reservation.countReservation(null, null, true);
  console.log(countsTime);
  console.log(countsDate);
}

function testRetrieve() {
  var result = reservation.retrieve(1535625000000);
  console.log(result);
}