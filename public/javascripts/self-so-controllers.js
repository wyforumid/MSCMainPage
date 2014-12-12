angular.module('selfSOControllers', ['toggle-switch', 'selfFilters'])
	.controller('SOCtrl', function($scope, $http) {
		$scope.searchingResult = [];
		$scope.filterResult = [];
		$scope.analyseResult = {};
		// $scope.searchCondition = {BookingNo:[]};
		$scope.filters = {
			OriginalType: null,
			StatusName: null,
			Executee: null,
			Service: null,
			POL: null,
			IsPreAssign: null
		};
		$scope.tableHeight = '600px';
		$scope.isFilterZone = true;
		$scope.hasSelectedSO = false;
		$scope.listDivClass = true;
		$scope.detailDivClass = false;
		$scope.canDispatchedGroup = [];
		$scope.canAssignedUser = [];



		$scope.$watch('filters',
			function(nV, oV) {
				if ($scope.filterResult.length == 0) {
					refreshFilterResult();
				}
				var count = filterCount(nV);
				if (count == 0) {
					copySearchingResultToFilterResult();
				} else if (count == 1 || isFilterOptionSetNull(nV, oV)) {
					refreshFilterResult();
				} else {
					continueFilterResult(nV, oV);
				}

				analyseSearchingResult();

			},
			true);

		$scope.showStatus = function(item) {
			if (item.JobStatusName) {
				return item.JobStatusName;
			} else {
				return item.MainStatusName;
			}
		}

		$scope.resetFilter = function() {
			$scope.filters.OriginalType = null;
			$scope.filters.StatusName = null;
			$scope.filters.Executee = null;
			$scope.filters.Service = null;
			$scope.filters.POL = null;
			$scope.filters.IsPreAssign = null;
			copySearchingResultToFilterResult();
		}

		function filterCount(v) {
			var count = 0;
			for (var prop in v) {
				if (v.hasOwnProperty(prop) && v[prop] != null) {
					count++;
				}
			}
			return count;
		}

		function isFilterOptionSetNull(newValue, oldValue) {

			isSetAnyPropertyNull(newValue, oldValue);
		}

		function isSetAnyPropertyNull(newValue, oldValue) {
			for (var prop in newValue) {
				if (newValue.hasOwnProperty(prop)) {
					if (newValue[prop] == null && oldValue[prop] != null) {
						return true;
					}
				}
			}
			return false;
		}

		function refreshFilterResult() {
			copySearchingResultToFilterResult();
			for (var prop in $scope.filters) {
				if ($scope.filters.hasOwnProperty(prop) && $scope.filters[prop] != null) {
					for (var i = $scope.filterResult.length; i--;) {
						if ($scope.filterResult[i][prop] != $scope.filters[prop]) {
							$scope.filterResult.splice(i, 1);
						}
					}
				}
			}
		}

		function continueFilterResult(newValue, oldValue) {
			for (var prop in newValue) {
				if (newValue.hasOwnProperty(prop) && newValue[prop] != null && newValue[prop] != oldValue[prop]) {
					for (i = $scope.filterResult.length; i--;) {
						if ($scope.filterResult[i][prop] != newValue[prop]) {
							$scope.filterResult.splice(i, 1);
						}
					}
				}
			}
		}

		function copySearchingResultToFilterResult() {
			$scope.filterResult = [];
			$.each($scope.searchingResult, function(i, v) {
				$scope.filterResult.push(angular.extend(v));
			})
		}

		function loadMainData() {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETMAINSOREQUEST',
				cache: false,
			}).success(function(data, status) {
				if (data && angular.isArray(data)) {
					// $scope.searchingResult = [];
					// for (var i = 0; i < data.length; i++) {
					// 	$scope.searchingResult.push(data[i]);
					// 	$scope.searchingResult[$scope.searchingResult.length - 1].FinalStatusName = $scope.showStatus(data[i]);
					// }
					if(data.length == 0){
						alert('No result.');
						return;
					}
					$scope.searchingResult = data;

					copySearchingResultToFilterResult();

					analyseSearchingResult();

				}else{
					alert(data);
				}
				

				
			}).error(function(data, status) {
				alert('Fitch SO request error.' + status + data);
			});


		}



		function analyseSearchingResult() {

			var CHECK_VALUE = 'checkValue'
			var data = $scope.filterResult;

			if (!data || data.length == 0) {
				clearAnalyseResult();
				return;
			}
			clearAnalyseResult($scope.searchingResult[0]);

			var analyseData = $scope.analyseResult;

			for (var i = data.length; i--;) {
				(function(i) {
					var item = data[i];
					for (var k = analyseData.props.length; k--;) {
						var propName = analyseData.props[k];
						if (item[propName] != null && item[propName].toString() != '') {
							if (!(analyseData[propName + 'Obj'].hasOwnProperty(item[propName]) && analyseData[propName + 'Obj'][item[propName]] == CHECK_VALUE)) {
								analyseData[propName].push(item[propName]);
								analyseData[propName + 'Obj'][item[propName]] = CHECK_VALUE;
							}
						}
					}
				})(i);
			}
		}

		function clearAnalyseResult(resultDataModel) {
			if (resultDataModel) {
				analyseData = $scope.analyseResult = {
					props: []
				};

				if (!resultDataModel) {
					alert('Result Model is null.');
				}

				for (var prop in resultDataModel) {
					if (resultDataModel.hasOwnProperty(prop)) {
						analyseData.props.push(prop);
						analyseData[prop] = [];
						analyseData[prop + 'Obj'] = {};
					}
				}
			} else {
				$scope.analyseResult = {
					OriginalType: [],
					OriginalTypeObj: {},
					StatusName: [],
					StatusNameObj: {},
					Executee: [],
					ExecuteeObj: {},
					Service: [],
					ServiceObj: {},
					POL: [],
					POLObj: {},
					IsPreAssign: [],
					IsPreAssignObj: {}
				};
			}
		}

		loadMainData();


		function setInputterFullColumns() {
			$scope.columnDefs = [{
				field: 'SORequestId',
				displayName: 'Id',
				width: 80,
				pinned: true,
				cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><a ng-click="showDetails(COL_FIELD);">{{COL_FIELD}}</a></span></div>'
			}, {
				field: 'Notes',
				displayName: 'Information',
				width: 200
			}, {
				field: 'OriginalType',
				displayName: 'Type',
				width: 100
			}, {
				field: 'StatusName',
				displayName: 'Status',
				width: 100
			}, {
				field: 'Executee',
				displayName: 'Executee',
				width: 160
			}, {
				field: 'Service',
				displayName: 'Service',
				width: 160
			}, {
				field: 'POL',
				displayName: 'POL',
				width: 160
			}, {
				field: 'IsPreAssign',
				displayName: 'Is Pre Assign',
				width: 50
			}, {
				field: 'Remark',
				displayName: 'Remark',
				width: 160
			}];
		}

		function setInputterBriefColumns() {
			$scope.columnDefs = [{
				field: 'SORequestId',
				displayName: 'Id',
				pinned: true,
				cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><a ng-click="showDetails(COL_FIELD);">{{COL_FIELD}}</a></span></div>'

			}];

		}



		//alert($scope.analyseResult);
		$scope.siGrid = {
			data: 'filterResult',
			enableColumnResize: true,
			multiSelect: true,
			showSelectionCheckbox: true,
			selectWithCheckboxOnly: true,
			enablePinning: true,
			columnDefs: 'columnDefs',
			beforeSelectionChange: function(rows, checkAll, self) {
				self.selectedItems.length = 0;
				for (var i = 0; i < rows.length; i++) {
					if ($scope.canExecute(rows[i].entity)) {
						self.selectedItems.length++;
						rows[i].selected = checkAll;
						if (rows[i].clone) {
							rows[i].clone.selected = checkAll;
						}
						if (checkAll) {
							self.selectedItems.push(rows[i].entity);
						}
					}

				}
				return false;
			},
			checkboxCellTemplate: '<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" ng-disabled="!canExecute(row.entity);" /></div>'
		};

		setInputterFullColumns();

		$scope.$watch('siGrid.$gridScope.selectedItems.length', function(nV, oV) {
			if (nV >= 1) {
				$scope.hasSelectedSO = true;
			} else {
				$scope.hasSelectedSO = false;
			}

		});

		$scope.canExecute = function(data) {
			switch (data.FinalStatusName) {
				case 'Enter':
					return false;
				default:
					return true;
			}
		}



		function TestLoadCanDispatchedGroup(successCallback, errorCallback) {
			$scope.canDispatchedGroup = [];
			$scope.canDispatchedGroup.push({
				id: 1,
				name: 'Team1',
				assignedCount: 69,
				checked: false
			});
			$scope.canDispatchedGroup.push({
				id: 2,
				name: 'Team2',
				assignedCount: 75,
				checked: false
			});
			$scope.canDispatchedGroup.push({
				id: 3,
				name: 'Team3',
				assignedCount: 70,
				checked: false
			});
			$scope.canDispatchedGroup.push({
				id: 4,
				name: 'Team4',
				assignedCount: 100,
				checked: false
			});
			$scope.canDispatchedGroup.push({
				id: 5,
				name: 'Team5',
				assignedCount: 55,
				checked: false
			});
			successCallback();
		}

		$scope.dispatchGroup = function() {
			TestLoadCanDispatchedGroup(function() {
				$('#dispatchDialog').modal('show');
			}, function(err) {
				alert('Loading dispatch group error.' + err);
			});

		}

		$scope.showDetails = function(bkgNo) {
			setInputterBriefColumns();
			$scope.listDivClass = false;
			$scope.detailDivClass = true;
		}

		$scope.bakcToList = function() {
			setInputterFullColumns();
			$scope.listDivClass = true;
			$scope.detailDivClass = false;
		}


		$scope.test = function() {
			//alert($scope.userInfo.permission.canFinish);
		}

	})