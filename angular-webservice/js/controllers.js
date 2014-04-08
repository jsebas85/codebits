'use strict';

/* Controllers */

var citiesApp = angular.module('citiesApp', []);
var url = 'http://www.inorthwind.com/Service1.svc/getAllCustomers';
citiesApp.controller('CityListCtrl', function($scope, $http) {
  $http.get(url).success(function(data) {
	$scope.companies = data;
  }).error(function(data, status, headers, config, statusText) {
	alert(statusText);
  });

  $scope.orderProp = 'CustomerID';
});
