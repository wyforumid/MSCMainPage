angular.module('selfSOControllers', ['toggle-switch', 'selfFilters'])
	.controller('SOCtrl', function($scope, $http) {
		$scope.searchingResult = [];
		$scope.filterResult = [];
		$scope.analyseResult = {};
		// $scope.searchCondition = {BookingNo:[]};
		$scope.filters = {
			OriginalType: null,
			FinalStatusName: null,
			Executor: null,
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
			$scope.filters.FinalStatusName = null;
			$scope.filters.Executor = null;
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
				$scope.filterResult.push(copyObj(v));
			})
		}

		function loadMainData() {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETMAINSOREQUEST',
				cache: false,
			}).success(function(data, status) {
				// $scope.searchingResult = data;
				if (data && data.length > 0) {
					$scope.searchingResult = [];
					for (var i = 0; i < data.length; i++) {
						$scope.searchingResult.push(data[i]);
						$scope.searchingResult[$scope.searchingResult.length - 1].FinalStatusName = $scope.showStatus(data[i]);
					}
				}

				copySearchingResultToFilterResult();

				analyseSearchingResult();
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
					FinalStatusName: [],
					FinalStatusNameObj: {},
					Executor: [],
					ExecutorObj: {},
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

		function copyObj(obj) {
			if (!obj || $.isArray(obj)) {
				return {};
			} else {
				var temp = {};
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						temp[prop] = obj[prop];
					}
				}
				return temp;
			}
		}

		// $scope.$watch('filterResult.length',function(nValue,oValue){
		// 	$scope.tableHeight = 30 * nValue + 100 + 'px';
		// })

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
				field: 'FinalStatusName',
				displayName: 'Status',
				width: 100
			}, {
				field: 'Executor',
				displayName: 'Executor',
				width: 160
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
				// cellFilter:'toBoolean',
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
				// width: 100,
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
			enablePinning: true,
			columnDefs: 'columnDefs'
		};

		setInputterFullColumns();
		// alert($scope.filterResult.length)
		$scope.$watch('siGrid.$gridScope.selectedItems.length', function(nV, oV) {
			if (nV >= 1) {
				$scope.hasSelectedSO = true;
			} else {
				$scope.hasSelectedSO = false;
			}

		});

		$scope.showDetails = function(bkgNo) {
			//alert(bkgNo);
			//$("#listDiv").removeClass('col-md-10').addClass('col-md-2');
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