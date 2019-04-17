/* Controllers */

var phonecatApp = angular.module('phonecatApp', []);
phonecatApp.controller('PhoneListCtrl', function($scope, $http) {
  $http.jsonp('https://www.flickr.com/services/feeds/photos_public.gne?tags=cellphone,brand&tag_mode=all&format=json&jsoncallback=JSON_CALLBACK').success(function(data) {
	$scope.phones = data.items;
  }).
    error(function(data, status, header, config) {
      $scope.phones = data || "Request failed";
      alert ($scope.phones);
  });
  $scope.orderProp = 'date_taken';
});
