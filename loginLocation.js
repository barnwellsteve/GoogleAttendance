function getIPlocation(input) {

  if (input = REPLACE_WITH_YOUR_KNOWN_IP ){
    return REPLACE_WITH_YOUR_KNOWN_LOCATION;
  }
  else {
  
  var aURL = "http://ip-api.com/json/" + input;

  var response = UrlFetchApp.fetch(aURL);

  var dataAll = JSON.parse(response.getContentText());

  var country = Object.getOwnPropertyDescriptor(dataAll, 'country');
  var countryID = country.value;

  var region = Object.getOwnPropertyDescriptor(dataAll, 'regionName');
  var regionID = region.value;

  
  return regionID +", "+ countryID;
  }
}
