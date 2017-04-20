var randomUserApp = angular.module('randomUserApp', []);
randomUserApp.controller('userController', function($scope, $http){

  $http.get('https://randomuser.me/api/?results=20').success(function(data) {
	$scope.users = data.results;
    $('#loader').hide();
    $('#userList').show();
  }).error(function(data, status) {
    console.log("ERROR");
  });
  
  $scope.showDetail = function (u) {
    if ($scope.active != u.username) {
      $scope.active = u.username;
    }
    else {
      $scope.active = null;
    }
  };
  
});

$(document).ready();