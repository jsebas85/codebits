var filterModule = angular.module('filter', ['generalServices', 'ui.bootstrap']);

// Directive for saving component position as a preference everytime it is moved
filterModule.directive('ngFilterReposition', function() {
    return function(scope, element, attrs) {
        element.bind("mousedown",function(event) {
            $(document).bind("mouseup", function(event) {
                $(document).unbind(event);
                var left = parseInt(element.css("left"));
                var top = parseInt(element.css("top"));
                var elementName = $(element).attr('id');
                scope.filterController.setPositionPreferences(elementName, left, top);
            });
        });
    }
});

filterModule.controller('filterModuleController', ['$scope',
                                                    '$q',
                                                    'preferences', 'dataAccess',
                                                    '$uibModal',
                                                    'showId',
                                                    'filterConfig',
function ($scope, $q, preferences, dataAccess, $uibModal, showId, filterConfig)
{
    var self = this;
    self.showId = showId;
    self.filterFamilyList = ['state', 'reservoir'];
    self.show = {};
    self.filterList = [];    
    self.selectedList = [];     //Filters selected by the user
    self.showFilter = [];       //Filter to hide when clicked
    self.disabledSelected = []; //Disable selected values
    self.showFilterToggle = true;
    self.selectedSeatsList = []; //Seats selected by user
    self.seatList = {};         //Seat list
   
    function initializeDatas()
    {
        for(var i in self.filterFamilyList) {
            var filterFamily = self.filterFamilyList[i];
            self.selectedList[filterFamily] = [];
            self.disabledSelected[filterFamily] = [];
        }
    }

    //Add a value to a filter
    function addFilterValue(filterName, selection)
    {
        //Disabled selected value
        self.disabledSelected[filterName][selection.id] = 'disabled';
        //Add selected value to the filter
        if(findById(self.selectedList[filterName],selection.id) === false) {
            self.selectedList[filterName].push(selection)
        }
    }

    
    //To show/hide filder tool
    function filterFold()
    {
        if(self.showFilterToggle) {
            for(var i in  self.filterFamilyList) {
                var filterFamily = self.filterFamilyList[i];
                self.showFilter[filterFamily] = self.showFilterToggle;
            }
        } else {
            for(var i in  self.filterFamilyList) {
                var filterFamily = self.filterFamilyList[i];
                var preference = preferences.get('map.filterModule.' + self.showId + '.' + filterFamily);
                if (!preference) {
                    self.showFilter[filterFamily] = self.showFilterToggle;
                } else {
                    self.showFilter[filterFamily] = !self.showFilterToggle;
                }
            }
        }
        self.showFilter.deleted = self.showFilterToggle;
        self.showFilter.check = self.showFilterToggle;
    }

    // Calculates which seats to show based on active filters
    function applyFilter()
    {
        var parameters = {};
        for(var i in self.selectedList) {
            var filter = self.selectedList[i];
            if (filter.length > 0) {
                parameters[i] = [];
            }
            for(var j in filter){
                parameters[i].push(parseInt(filter[j].id));
            }
        }

        var filteredSeats = {};
		
        for(var seatId in self.seatList) {
            var seat = self.seatList[seatId];
            var isSelected = true;

            for(var filterName in parameters) {
                switch(filterName) {
                    case 'state':
						if (parameters[filterName].indexOf(1) != -1) { //Selected seat
							if (seat.selected !== true) {
								isSelected = false;
							}
						}
						else if (parameters[filterName].indexOf(2) != -1) { //Modified seat
							if (seat.modified !== true) {
								isSelected = false;
							}
						}
						else if (parameters[filterName].indexOf(1) == -1 && parameters[filterName].indexOf(2) == -1) { // On ne veut pas les sièges sélectionnés ou filtrés
							isSelected = false;
						}
                        
                        break;
                    case 'reservoir':
                        if(parameters[filterName].indexOf(getSeatReservoir(seat)) == -1)
                             isSelected = false;
                        break;
                    default:
                        break;
                }
            }

            if (isSelected) {
                filteredSeats[seatId] = seat;
            }
        }
        $scope.$emit('filter.all.update', filteredSeats);
    }

    function updateReservoir(reservoirData)
    {
        self.filterList.reservoirList[reservoirData.id] = {};
        self.filterList.reservoirList[reservoirData.id].id = reservoirData.id;
        self.filterList.reservoirList[reservoirData.id].saleChannelName = reservoirData.saleChannelName;
        self.filterList.reservoirList[reservoirData.id].reservoirName = reservoirData.reservoirName;
        self.filterList.reservoirList[reservoirData.id].color = reservoirData.color;
        self.filterList.reservoirList[reservoirData.id].endDate = reservoirData.endDate;

        var initPromise = self.initSeatStates();
        initPromise.then(function(resolve) {
            $scope.$emit('filter.initdata');
            applyFilter();
        });
    }

    /*************************** Préférences ***************/

    function initializePreference()
    {
        for(var i in  self.filterFamilyList) {
            var preference = preferences.get('map.filterModule.' + self.showId + '.' + self.filterFamilyList[i]);
            if (preference) {
                var splitPreference = preference.split(';')
                for(var j in  splitPreference) {
                    if(splitPreference[j]){
                        var preferenceId = [];
                        preferenceId['id'] = splitPreference[j];
                        if(self.filterList[self.filterFamilyList[i]+'List'][preferenceId['id']]) {
                            addFilterValue(self.filterFamilyList[i],preferenceId);
                        }
                    }
                }
            }
        }
        self.showFilterToggle = getPreference('map.filterModule.showFilterToggle', 'boolean', true);
        filterFold();
    }

    function setPreference(name, value)
    {
        preferences.set(name, value);
    }

    function getPreference(key, dataType, defaultValue)
    {
        var preference = preferences.get(key);
        switch (dataType) {
            case 'boolean':
                if (typeof preference != 'undefined') {
                    preference = !(preference === 'false');
                } else {
                    preference = defaultValue;
                }
            break;
            case 'float':
                preference = parseFloat(preference);
            break;

            case 'integer':
                preference = parseInt(preference);
            break;
            default:
            break;
        }

        return preference;
    }

    self.setPositionPreferences = function(name, left, top)
    {
        preferences.set('map.' + name + '.left', left);
        preferences.set('map.' + name + '.top', top);
    }

    /*************************** Events management ***************/
    $scope.$on('plan.select.broadcast', function (event, selectedSeatsList) {

        for(var i in self.selectedSeatsList) {
            var idSeat = self.selectedSeatsList[i];
            self.seatList[seatId].selected = false;
        }
        self.selectedSeatsList = [];
        for(var i in selectedSeatsList) {
            self.selectedSeatsList[i] = selectedSeatsList[i].id;
            seatId = selectedSeatsList[i].id;
            self.seatList[seatId].selected = true;
        }

        applyFilter();
    });

    $scope.$on('selection.modify.broadcast', function (event, selectedSeatsList) {
        for(var i in self.seatList) {
            self.seatList[i].selected = false;
        }
        applyFilter();
    });

    $scope.$on('managereservoir.update.broadcast', function (event, reservoirData) {
        updateReservoir(reservoirData);
    });

    $scope.$on('plan.updateseats.broadcast', function (event, repId) {
        self.showId = repId;
        var initPromise = self.initSeatStates();
        initPromise.then(function(resolve) {
            $scope.$emit('filter.initdata');
            applyFilter();
        });
    });

    /***************************Binders****************************/

    self.filterSelectionClick = function ($event, filterName, selection)
    {
        $event.preventDefault();
        $event.stopPropagation();
        addFilterValue(filterName, selection);

        if (typeof preferences.get('map.filterModule.' + self.showId + '.' + filterName) == "undefined") {
            preferences.set('map.filterModule.' + self.showId + '.' + filterName, '');
        }
        preferences.set('map.filterModule.' + self.showId + '.'  + filterName , preferences.get('map.filterModule.' + self.showId + '.' + filterName) + selection.id + ';');
        applyFilter();
        document.activeElement.blur();
        return true;
    }

    self.filterSelectionDeletedClick = function (filterName, selection)
    {
		self.disabledSelected[filterName][selection.id] = '';
		self.selectedList[filterName].splice(findById(self.selectedList[filterName],selection.id),1);
		var preference = preferences.get('map.filterModule.' + self.showId + '.' + filterName);
		if (typeof preference != 'undefined') {
			var splitPreference = preference.split(';')
			var newPreference = '';
			for(var j in  splitPreference) {
				if(splitPreference[j] && splitPreference[j] != selection.id){
					newPreference = newPreference + splitPreference[j] + ';';
				}
			}
			preferences.set('map.filterModule.' + self.showId + '.' + filterName , newPreference);
		}
		filterFold();
		applyFilter();
        
    }

    self.filterDeletedClick = function ()
    {
        for(var i in self.filterFamilyList) {
            var filterFamily = self.filterFamilyList[i];
            preferences.set('map.filterModule.' +self.showId + '.'  + filterFamily , '');
            self.selectedList[filterFamily] = [];
            self.disabledSelected[filterFamily] = [];
        }
        applyFilter();
    }

    self.filterFoldClick = function ()
    {
        self.showFilterToggle = !self.showFilterToggle;
        filterFold();
        preferences.set('map.filterModule.showFilterToggle', self.showFilterToggle);
    }

    self.initSeatStates = function()
    {
        var deferred = $q.defer();
        dataAccess.post('filterSeats', {showId: self.showId}, function(success, data) {
            if (success == true) {
                for(var seatId in data.seatList) {
                    data.seatList[seatId].selected = false;
                    data.seatList[seatId].modified = false;
                    data.seatList[seatId].idNewCateg = -1;
                    data.seatList[seatId].idNewReservoir = -1;
                }
                self.seatList = data.seatList;
                deferred.resolve();
            } else {
                console.log("erreur: " + data);
                deferred.reject();
            }
        });

        return deferred.promise;
    }

    function findById(array, id)
    {
        for(var i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                return i;
            }
        }

        return false;
    }

    $(document).ready(function(){
        dataAccess.post('getFilterList', {showId: self.showId}, function(success, filters)
        {
            if (success == true) {
                self.filterList = filters;
                initializeDatas();
                initializePreference();

                var initPromise = self.initSeatStates();
                initPromise.then(function(resolve) {
                    $scope.$emit('filter.all.representationchanged');
                });

            }
        });
    });

    $(".dropdown").on("shown.bs.dropdown", function(event){
        setTimeout(function() {
            document.activeElement.blur();
            document.activeElement = document.body;
    }, 500);

    });

}]);