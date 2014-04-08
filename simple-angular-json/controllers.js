'use strict';

/* Controllers */

var phonecatApp = angular.module('phonecatApp', []);
phonecatApp.controller('PhoneListCtrl', function($scope, $http) {
  $http.get('phones/flickr.json').success(function(data) {
    $scope.phones = data;
  }).
    error(function(data, status, header, config) {
      $scope.phones = data || "Request failed";
      alert ($scope.phones);
  });
  $scope.orderProp = 'date_taken';
});
