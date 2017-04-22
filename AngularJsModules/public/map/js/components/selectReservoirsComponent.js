var selectReservoirsModule = angular.module('selectReservoirs', ['ngTable', 'generalServices']);

selectReservoirsModule.filter('array', function()
{
    return function(items) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        return filtered;
    };
});

selectReservoirsModule.controller('selectReservoirsController', ['$scope',
                                                                'ngTableParams', 'preferences', 'dataAccess',
function ($scope, ngTableParams, preferences, dataAccess)
{
    var self = this;
    self.reservoirList = [];
    self.reservoirList.reservoirList = [];
    self.selectedSeats = [];
    self.subtotal = 0;
    self.showSearchSelection = false;
    self.showSearchAllocation = false;

    $scope.selectionTable = new ngTableParams({
        count: 10
    },
    {
        counts: [],
        getData: function($defer, params) {
            $defer.resolve(self.reservoirList.reservoirList);
        },
        $scope: $scope
    });

    $scope.allocationTable = new ngTableParams({
        count: 10
    },
    {
        counts: [],
        getData: function($defer, params) {
            $defer.resolve(self.reservoirList.reservoirList);
        },
       $scope: $scope
    });
    initComponents();

    /*************************** Events management ***************/
    $scope.$on('plan.select.broadcast', function (event, selectedSeatList) {
        clearAllSelection();
        selectSeatList(selectedSeatList);
    });

    $scope.$on('managereservoir.update.broadcast', function (event, reservoirData) {
        addNewReservoir(reservoirData);
    });

    $scope.$on('filter.initdata.broadcast', function (event) {
        clearAllSelection();
    });

    function initComponents()
    {
        if (typeof preferences.get('selectReservoirs.selection.visible') == "undefined") {
            preferences.set('selectReservoirs.selection.visible', false);
        }
        self.showSelection = (preferences.get('selectReservoirs.selection.visible') == "true" ? true : false);
        if (!self.showSelection) {
            self.showSearchSelection = true;
        } else {
            self.showSearchSelection = false;
        }
        if (typeof preferences.get('selectReservoirs.allocation.visible') == "undefined") {
            preferences.set('selectReservoirs.allocation.visible', false);
        }
        self.showAllocation = (preferences.get('selectReservoirs.allocation.visible') == "true" ? true : false);
        if (!self.showAllocation) {
            self.showSearchAllocation = true;
        } else {
            self.showSearchAllocation = false;
        }
    }

    function selectSeatList(selectedSeatList)
    {
        for(var i in selectedSeatList) {
            self.selectedSeats.push(selectedSeatList[i]);
            self.reservoirList.total.nbSelect++;
            if (getSeatReservoir(selectedSeatList[i]) == 0) {
                self.reservoirList.neutral.nbSelect++;
            } else {
                self.subtotal++;
                for(var j in self.reservoirList.reservoirList) {
                    current = self.reservoirList.reservoirList[j];
                    if (current.id == getSeatReservoir(selectedSeatList[i])) {
                        current.nbSelect ++;
                    }
                }
            }
        }
    }

    function clearAllSelection()
    {
        self.reservoirList.total.nbSelect = 0;
        self.reservoirList.neutral.nbSelect = 0;
        self.subtotal = 0;
        self.selectedSeats = [];
        for(var j in self.reservoirList.reservoirList) {
            self.reservoirList.reservoirList[j].nbSelect = 0;
        }
    }

    function addNewReservoir(reservoirData)
    {
        self.reservoirList.reservoirList[reservoirData.id] = {};
        self.reservoirList.reservoirList[reservoirData.id].id = reservoirData.id;
        self.reservoirList.reservoirList[reservoirData.id].saleChannelName = reservoirData.saleChannelName;
        self.reservoirList.reservoirList[reservoirData.id].reservoirName = reservoirData.reservoirName;
        self.reservoirList.reservoirList[reservoirData.id].color = reservoirData.color;
        self.reservoirList.reservoirList[reservoirData.id].endDate = reservoirData.endDate;
    }

    function changeRepresentation(representationId)
    {
        dataAccess.post('getReservoirList', {representationId: representationId}, function(success, reservoirList)
        {
            if (success == true) {

                self.reservoirList = reservoirList;

                if(Object.keys(self.reservoirList.reservoirList).length === 0){
                    self.reservoirList.reservoirList = {};
                }

                $scope.allocationTable.reload();
                $scope.selectionTable.reload();

                $scope.$emit('selectreservoirs.all.representationchanged');

            } else {
                console.log("erreur: changeRepresentation" + reservoirList);
            }
        });
    }

    self.toggleSelection = function ()
    {
        self.showSelection = !self.showSelection;
        preferences.set('selectReservoirs.selection.visible', self.showSelection);
        if (!self.showSelection) {
            self.showSearchSelection = true;
        }
    }

    self.toggleAllocation = function ()
    {
        self.showAllocation = !self.showAllocation;
        preferences.set('selectReservoirs.allocation.visible', self.showAllocation);
        if (!self.showAllocation) {
            self.showSearchAllocation = true;
        }
    }

    self.allocate = function(idReservoir)
    {
        for(var j in self.selectedSeats) {
            self.selectedSeats[j]= setSeatReservoir(self.selectedSeats[j], idReservoir);
        }
        self.reservoirList.total.nbSelect = 0;
        self.reservoirList.neutral.nbSelect = 0;
        self.subtotal = 0;
        for(var j in self.reservoirList.reservoirList) {
            self.reservoirList.reservoirList[j].nbSelect = 0;
        }
        $scope.$emit('selection.modify', self.selectedSeats);
        self.selectedSeats = [];
    }

    self.editReservoir = function(reservoirId)
    {
        $scope.$emit('selection.reservoir.edit', reservoirId);
    }

    $(document).ready(function(){
        $('[ng-table-pagination="params"').remove();
    });

}]);
