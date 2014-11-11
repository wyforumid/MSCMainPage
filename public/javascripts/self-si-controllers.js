angular.module('selfSIControllers', ['toggle-switch'])
	.controller('SICtrl', function($scope) {
		$scope.searchingResult = [];
		$scope.filterResult = [];
		$scope.analyseResult = {};
		$scope.allTeamGroups = [];
		// $scope.searchCondition = {BookingNo:[]};
		$scope.filters = {
			BookingNo: null,
			BLNo: null,
			Inputter: null,
			Vessel: null,
			Voyage: null,
			Service: null,
			LoadPort: null,
			SIOrigin: null,
			TeamGroup: null
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

		$scope.resetFilter = function() {
			$scope.filters.BookingNo = null;
			$scope.filters.BLNo = null;
			$scope.filters.Inputter = null;
			$scope.filters.Vessel = null;
			$scope.filters.Voyage = null;
			$scope.filters.Service = null;
			$scope.filters.LoadPort = null;
			$scope.filters.SIOrigin = null;
			$scope.filters.TeamGroup = null;
			$scope.hasSelectedSO = false;
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

		function loadTestData() {

			$scope.searchingResult = [{
				BookingNo: '18100000000000001',
				BLNo: '000001',
				Vessel: 'Vessel01',
				Voyage: 'Voyage06',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '2014-10-05',
				Inputter: 'Jason',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000002',
				BLNo: '000002',
				Vessel: 'Vessel02',
				Voyage: 'Voyage07',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '2014-10-05',
				Inputter: 'Jason',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000003',
				BLNo: '000003',
				Vessel: 'Vessel01',
				Voyage: 'Voyage07',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Manual',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '2014-10-05',
				Inputter: 'Jason',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000004',
				BLNo: '000004',
				Vessel: 'Vessel03',
				Voyage: 'Voyage08',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '2014-10-05',
				Inputter: 'Jason',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000005',
				BLNo: '000005',
				Vessel: 'Vessel04',
				Voyage: 'Voyage09',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '2014-10-05',
				Inputter: 'Jason',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000006',
				BLNo: '000006',
				Vessel: 'Vessel01',
				Voyage: 'Voyage06',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '2014-10-05',
				Inputter: 'Jason',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000007',
				BLNo: '000007',
				Vessel: 'Vessel05',
				Voyage: 'Voyage07',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '2014-10-05',
				Inputter: 'Jason',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000008',
				BLNo: '000008',
				Vessel: 'Vessel01',
				Voyage: 'Voyage08',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Manual',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000009',
				BLNo: '000009',
				Vessel: 'Vessel02',
				Voyage: 'Voyage06',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000010',
				BLNo: '000010',
				Vessel: 'Vessel01',
				Voyage: 'Voyage08',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'Shenzhen Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000011',
				BLNo: '000011',
				Vessel: 'Vessel03',
				Voyage: 'Voyage09',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000012',
				BLNo: '000012',
				Vessel: 'Vessel01',
				Voyage: 'Voyage06',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000013',
				BLNo: '000013',
				Vessel: 'Vessel04',
				Voyage: 'Voyage09',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000014',
				BLNo: '000014',
				Vessel: 'Vessel01',
				Voyage: 'Voyage08',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000015',
				BLNo: '000015',
				Vessel: 'Vessel04',
				Voyage: 'Voyage07',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000016',
				BLNo: '000016',
				Vessel: 'Vessel01',
				Voyage: 'Voyage06',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Manual',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000017',
				BLNo: '000017',
				Vessel: 'Vessel05',
				Voyage: 'Voyage09',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'SI Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000081',
				BLNo: '000018',
				Vessel: 'Vessel01',
				Voyage: 'Voyage09',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000091',
				BLNo: '000019',
				Vessel: 'Vessel02',
				Voyage: 'Voyage08',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000020',
				BLNo: '000020',
				Vessel: 'Vessel01',
				Voyage: 'Voyage06',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, {
				BookingNo: '18100000000000021',
				BLNo: '000021',
				Vessel: 'Vessel05',
				Voyage: 'Voyage06',
				Service: 'Service01',
				Deadline: '2014-10-30',
				LoadPort: 'CHIWAN',
				CNTRs: '4',
				SIOrigin: 'Inttra',
				DispatchTime: '2014-10-05',
				TeamGroup: 'WuHan Team',
				AssignedTime: '',
				Inputter: 'Waiting',
				PartBillNo: '2'
			}, ];
			//$scope.filterResult = $scope.searchingResult;

			if ($scope.userInfo.Role == 'Inputter') {
				for (var i = $scope.searchingResult.length; i--;) {
					if ($scope.searchingResult[i].Inputter != 'Jason') {
						$scope.searchingResult.splice(i, 1);
					}
				}
			}


			copySearchingResultToFilterResult();

			$scope.allTeamGroups = [];
			$scope.allTeamGroups.push({
				id: 1,
				name: 'Wuhan Team'
			});
			$scope.allTeamGroups.push({
				id: 2,
				name: 'SI Team'
			});
			$scope.allTeamGroups.push({
				id: 3,
				name: 'Shenzhen Team'
			});
			$scope.allTeamGroups.push({
				id: 4,
				name: 'Other Team'
			});
		}



		function analyseSearchingResult() {

			var CHECK_VALUE = 'checkValue'
			var data = $scope.filterResult;

			if (!data || data.length == 0) {
				return;
				clearAnalyseResult();
			}
			clearAnalyseResult($scope.searchingResult[0]);

			var analyseData = $scope.analyseResult;

			for (var i = data.length; i--;) {
				(function(i) {
					var item = data[i];
					for (var k = analyseData.props.length; k--;) {
						var propName = analyseData.props[k];
						if (item[propName]) {
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
					BookingNo: [],
					BookingNoObj: {},
					BLNo: [],
					BLNoObj: {},
					Vessel: [],
					VesselObj: {},
					Voyage: [],
					VoyageObj: {},
					Service: [],
					ServiceObj: {},
					Deadline: [],
					DeadlineObj: {},
					LoadPort: [],
					LoadPortObj: {},
					CNTRs: [],
					CNTRsObj: {},
					SIOrigin: [],
					SIOriginObj: {},
					DispatchTime: [],
					DispatchTime: {},
					TeamGroup: [],
					TeamGroupObj: {},
					AssignTime: [],
					AssignTimeObj: {},
					Inputter: [],
					InputterObj: {},
					PartBillNo: [],
					PartBillNoObj: {}
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

		loadTestData();



		function setInputterFullColumns() {
			$scope.columnDefs = [{
				field: 'BookingNo',
				displayName: 'Booking',
				width: 160,
				pinned: true,
				cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><a ng-click="showDetails(COL_FIELD);">{{COL_FIELD}}</a></span></div>'
			}, {
				field: 'BLNo',
				displayName: 'BOL',
				width: 160
			}, {
				field: 'Inputter',
				displayName: 'Inputter',
				width: 160
			}, {
				field: 'Vessel',
				displayName: 'Vessel',
				width: 160
			}, {
				field: 'Voyage',
				displayName: 'Voyage',
				width: 160
			}, {
				field: 'Service',
				displayName: 'Service',
				width: 160
			}, {
				field: 'Deadline',
				displayName: 'Deadline',
				width: 100
			}, {
				field: 'LoadPort',
				displayName: 'Load Port',
				width: 160
			}, {
				field: 'CNTRs',
				displayName: 'CNTRs',
				width: 50
			}, {
				field: 'SIOrigin',
				displayName: 'SI Origin',
				width: 120
			}, {
				field: 'DispatchTime',
				displayName: 'Dispatch Time',
				width: 100
			}, {
				field: 'TeamGroup',
				displayName: 'Team Group',
				width: 160
			}, {
				field: 'AssignedTime',
				displayName: 'Assigned Time',
				width: 100
			}, {
				field: 'PartBillNo',
				displayName: 'PartBillNo',
				width: 50
			}];
		}

		function setInputterBriefColumns() {
			$scope.columnDefs = [{
				field: 'BookingNo',
				displayName: 'Booking',
				width: 160,
				pinned: true,
				cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><a ng-click="showDetails(COL_FIELD);">{{COL_FIELD}}</a></span></div>'
			}];

		}


		analyseSearchingResult();
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