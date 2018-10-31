function isValidReservationDatetime(datetime) {
  if (datetime.getMinutes() % 30 != 0) return false;
  return true;
  
}
