
var generalServices = angular.module('generalServices', ['ngCookies']);


//Service to manage preferences as a key-value set reusing cookies service
generalServices.factory('preferences', ['$cookies', function($cookies) {

  var preferences = {};

  preferences.get = function(key) {
    var value = $cookies.get(key);
    return value;
  };

  preferences.set = function(key, value) {
    var farFromNow = new Date();
    farFromNow.setDate(farFromNow.getDate() + 31);
    $cookies.put(key, value, { expires: farFromNow });
    return true;
  };

  return preferences;
}]);

//Services to access data reusing http service
generalServices.factory('dataAccess', ['$http', function ($http) {
  return {
    post: function(request, params, callback) {
      $http.post('../ajax/' + request,  {params}).
        success(function(data, status) {
          callback(true, data);
        }).
        error(function(error, status) {
          callback(false, error);
        });
    },
    get: function(request, params, callback) {
      $http.get('../ajax/' + request,  {params}).
      success(function(data, status) {
        callback(true, data);
      }).
      error(function(error, status) {
        callback(false, error);
      });
    }
  };
}]);

