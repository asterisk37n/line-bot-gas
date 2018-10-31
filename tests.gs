function testJapaneseDate() {
  console.log(toJapaneseDate(new Date(), true));
  console.log(toJapaneseDate(new Date(), false));
  console.log(new Date().toJPString());
  console.log(new Date().toJPString(false));
}

function testProfile() {
  var userId = "Ud7c64457bd6514f35958e78b1dd0df37";
  var response = getProfile(userId, "IFnzSBGIdZA8dYKBGRrp+rI8z1n/msB6Gux/vABIvUEdNerIc3j8dKC5Ccb2GdDukuy9MowLzYqKglJcNKEnPEzbd/8hXeyzWXdTLjxpu13K0MhR9he8JxdnFOBC+RYRM/ehjRzVzwLj/oDHq5qatAdB04t89/1O/w1cDnyilFU=");
  Logger.log(response)
}


function testResCreate() {
  var res = reservation.createReservation('id', new Date());
  console.log(res);
}

function testResRead() {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var res = reservation.readReservation('Ud7c64457bd6514f35958e78b1dd0df37', firstDay);
  console.log(res);
}

function testResCount() {
  var countsTime = reservation.countReservation(null, null, false);
  var countsDate = reservation.countReservation(null, null, true);
  console.log(countsTime);
  console.log(countsDate);
}

function testResRetrieve() {
  var result = reservation.retrieve(1535625000000);
  console.log(result);
}


function test() {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  console.log(training.count());
  console.log(training.count('Ud7c64457bd6514f35958e78b1dd0df37', firstDay, lastDay));
  console.log(training.read('Ud7c64457bd6514f35958e78b1dd0df37', firstDay, lastDay));
}

function testIsValidReservationDatetime() {
  var validDatetime = new Date();
  validDatetime.setMinutes(30);
  var invalidDatetime = new Date();
  invalidDatetime.setMinutes(31);
  var assertTrue = isValidReservationDatetime(validDatetime);
  var assertFalse = isValidReservationDatetime(invalidDatetime);
  console.log("assert true === ", assertTrue);
  console.log("assert false === ", assertFalse);
}

function testLINEString() {
  var dt = new Date();
  var LINEString = dt.toLINEString();
  Logger.log(LINEString);
  console.log(LINEString);
}