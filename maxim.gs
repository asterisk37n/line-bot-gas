var maxim = {
  sheet: SpreadsheetApp.getActive().getSheetByName('maxim'),

  createMaxim: function(id, name) {
    // if success, return true, if record exists, return false
    var data = this.sheet.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == id) {
        return false;
      }
    }
    this.sheet.appendRow([id, name]);
    return true;
  },

  readMaxim: function(id) {
    // if success, return name, if record not found, return false
    var data = this.sheet.getDataRange().getValues();
    if (typeof id === 'undefined') {
      return data[Math.floor(Math.random() * data.length)];
    }
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == id) {
        return data[i][1];
      }
    }
    return false;
  },

  updateMaxim: function(id, newName) {
    // if success, return {oldName: name, newName: name}, if record not found, return false
    var data = this.sheet.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == id) {
        this.sheet.getRange(i + 1, 2).setValue(newName); // 2 for Column B
        return {
          oldName: data[i][1],
          newName: newName
        };
      }
    }
    return false;
  },

  deleteMaxim: function(id) {
    // if success, return row number, if record not found, return false
    var data = this.sheet.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == id) { // [0] for the first column
        this.sheet.deleteRow(i + 1); // sheet row number starts from 1
        return data[i];
      }
    }
    return false;
  }
};