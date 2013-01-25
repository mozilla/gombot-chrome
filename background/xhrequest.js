var Request = require('request').Request;

var Xhrequest = function(url, req) {
  var method = req.method,
      data = req.data,
      headers = req.headers,
      success = req.success,
      error = req.error,
      reqObj = {
        url: url,
        content: data,
        headers: headers,
        contentType: 'application/json'
      };

  reqObj.onComplete = function(response) {
    if (response.status === 200) {
      success(response.text);
    } else {
      error({ responseText: response.text }, {}, response.status);
    }
  };

  var request = Request(reqObj);
  switch (method) {
    case 'PUT': request.put(); break;
    case 'POST': request.post(); break;
    case 'GET':  request.get(); break;
    default:  console.log("Xhrequest: unknown method: "+method); break;
  }
};

module.exports = Xhrequest;
