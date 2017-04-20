var listOrganizerModule = angular.module('listOrganizerModule', ['ngTable', 'ui.bootstrap'])
    .config(function ($interpolateProvider){
        $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

listOrganizerModule.controller('thirdPartyController', ['$scope', '$rootScope', '$filter', 'ngTableParams', '$uibModal', 'ORGANIZERS', 
    function ($scope, $rootScope, $filter, ngTableParams, $uibModal, ORGANIZERS) {


        $scope.$watch("filter.$", function () {
            $scope.tableParams.reload();
            $scope.tableParams.page(1); //Add this to go to the first page in the new pagging
        });

        var self = this;
        self.organizers = ORGANIZERS;
        self.showInactive = false;
        self.result = '';

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: {
                name: 'asc'     // initial sorting
            }
        }, {
            counts : [],
            getData: function($defer, params) {
            self.result = '';
            var filteredData = $filter('filter')(ORGANIZERS, $scope.filter);
            var orderedData = params.sorting() ?
                                $filter('orderBy')(filteredData, params.orderBy()) :
                                filteredData;
            finalResults = orderedData;
            }
            if (self.showInactive == false) {
                temp = [];
                for(var i in finalResults) {
                    if (finalResults[i].isActive) {
                        temp.push(finalResults[i]);
                    }
                }
                finalResults = temp;
            }

            params.total(finalResults.length);
            $defer.resolve(finalResults.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            value = ((params.page() - 1) * params.count());
            first =  value + 1;
            last = value + finalResults.slice((params.page() - 1) * params.count(), params.page() * params.count()).length;
            self.result = first + '-' + last;
            if (finalResults.length == 0){
                self.result = 0;
            } else {
                self.result += ' sur ' + finalResults.length;
            }
            self.tooltip();

            }, $scope: $scope

        });

        this.toggleActive = function (organizerId) {
            organizerPos = self.findIndexByKey(self.organizers, 'id', organizerId);
            if(organizerPos != null) {
                self.organizers[organizerPos].isActive = !self.organizers[organizerPos].isActive;
            }
            self.updateOrganizer(self.organizers[organizerPos], 'isActive');
            self.updateFilter();
        }

        this.findIndexByKey = function(arrayToSearch, key, valueToSearch) {
            for (var i = 0; i < arrayToSearch.length; i++) {
                if (undefined == arrayToSearch[i]) {
                    continue;
                }
                if (arrayToSearch[i][key] == valueToSearch) {
                    return i;
                }
            }
            return null;
        }

        this.updateFilter = function() {
            $scope.tableParams.reload();
            $scope.tableParams.page(1);
            self.tooltip();
        }

        this.hideInactiveItems  = function() {
            self.showInactive = false;
            self.updateFilter();
        }

        this.showInactiveItems  = function() {
            self.showInactive = true;
            self.updateFilter();
        }

        this.updateOrganizer = function(organizer, modified) {
            $.ajax({
                type  : 'post',
                url : '/organizer/organizer/updateOrganizer',
                dataType : 'html',
                async    : false,
                data     : {organizer : organizer},
                success  : function (response) {
                    if (response == 'NOK') { // Imposible to modify, rollback
                        organizerPos = self.findIndexByKey(self.organizers, 'id', organizer.id);
                        self.organizers[organizerPos].isActive = !self.organizers[organizerPos].isActive
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: 'unmodified.html',
                            size: 'sm'
                        });

                    }
                   return true;
                },
                error : function ( jqXHR, textStatus, errorThrown ) {
                    return false;
                }
            });
        }

        this.delete = function(organizerId) {
             $.ajax({
                type  : 'post',
                url : '/organizer/organizer/deleteOrganizer/' + organizerId,
                dataType : 'html',
                async    : false,
                success  : function (response) {
                   organizerPos = self.findIndexByKey(self.organizers, 'id', organizerId);
                    if(organizerPos != null) {
                        self.organizers.splice(organizerPos, 1);
                    }
                    self.updateFilter();
                },
                error : function ( jqXHR, textStatus, errorThrown ) {
                    return false;
                }
            });
        }

        this.tooltip = function() {
            setTimeout( function() {$('[data-toggle="tooltip"]').tooltip();}, 1000);
        }

        $(document).ready(function(){
            self.tooltip();
        });

}]);


