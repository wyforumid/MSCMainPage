angular.module('selfSOControllers', ['selfRootController', 'selfServices', 'toggle-switch', 'selfFilters', 'angularFileUpload', 'ui.bootstrap.datetimepicker'])
	.config(['$httpProvider', function($httpProvider) {
		//initialize get if not there
		if (!$httpProvider.defaults.headers.get) {
			$httpProvider.defaults.headers.get = {};
		}
		//disable IE ajax request caching
		$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
	}])
	.controller('SOCtrl', function($scope, $http, $upload, $rootScope) {
		$scope.mainResult = [];
		//$scope.searchResult = [];
		$scope.filterResult = [];
		$scope.analyseResult = {};
		$scope.currentSORequest = {};
		$scope.searchCondition = {
			bookingId: null,
			bookingNo: null,
			inttraNo: null,
			sender: null,
			dispatchedGroup: null,
			assignedUser: null,
			service: null,
			por: null,
			pol: null,
			startDate: moment().format('YYYY-MM-DD'),
			endDate: moment().add(1, 'days').format('YYYY-MM-DD'),
			noResult: 'No result.'
		}
		$scope.filters = {
			OriginalType: null,
			StatusName: null,
			ExecuteeName: null,
			Service: null,
			Vessel: null,
			Voyage: null,
			POR: null,
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
		//$scope.pageModal = $scope.isFilterZone ? 1 : 2; //1 for main display 2 for search display. for now only auto refresh on main display modal.
		$scope.refreshResult = [];
		$scope.refreshCurrentSORequest = {};
		$scope.isUpdatedInRefresh = false;

		// $scope.$watch('pageModal', function(nV, oV) {
		// 	if (nV == 1) {
		// 		setTimeout(mainRefresh, 10000);
		// 	}
		// });
		$scope.$watch('isFilterZone', function(nV, oV) {
			if (nV == true) {
				copySearchingResultToFilterResult();
				analyseSearchingResult();
				setTimeout(mainRefresh, 10000);
			} else {
				$scope.filterResult = [];
			}
		});

		function mainRefresh() {
			// if ($scope.pageModal == 2) {
			// 	return;
			// }
			if (!$scope.isFilterZone) {
				return;
			}
			async.parallel([
				function(callback) {
					loadMainData(
						function(data, status) {
							if (data && data.length > 0) {
								formatSORequestData(data);
								$scope.refreshResult = data;
								callback(null, $scope.refreshResult);
							} else {
								callback(null, null);
							}
						},
						function(data, status) {
							callback(data + status, null);
						}, false);
				},
				function(callback) {
					if ($scope.listDivClass) {
						$scope.refreshCurrentSORequest = null;
						callback(null, $scope.refreshCurrentSORequest);
					} else {
						loadSODetails(
							$scope.currentSORequest.SORequestId,
							function(results) {
								$scope.refreshCurrentSORequest = angular.copy($scope.currentSORequest);
								$scope.refreshCurrentSORequest.workflow = results[0];
								$scope.refreshCurrentSORequest.baseInfo = results[1][0];
								$scope.refreshCurrentSORequest.bookings = results[2];
								callback(null, $scope.refreshCurrentSORequest);
							},
							function(err) {
								callback(err, null);
							})
					}
				}
			], function(err, results) {
				if (err) {
					return;
				}
				// if ($scope.pageModal == 2) {
				// 	return;
				// }
				if (!$scope.isFilterZone) {
					return;
				}
				if (results[0] && results[0].length > 0) {
					compareRefreshSO(results[0]);
				}


				if (results[1]) {
					compareRefreshCurrentSO(results[1]);
				}

				// if ($scope.pageModal == 1) {
				// 	setTimeout(mainRefresh, 10000);
				// }
				if ($scope.isFilterZone) {
					setTimeout(mainRefresh, 10000);
				}

			});
		}

		function compareRefreshSO(refreshData) {
			var existed = false;
			for (var i = refreshData.length; i--;) {
				existed = false;
				for (var k = $scope.mainResult.length; k--;) {
					if (refreshData[i].SORequestId == $scope.mainResult[k].SORequestId) {
						existed = true;
						break;
					}

				}
				if (!existed) {
					$scope.isUpdatedInRefresh = true;
					refreshData[i].isUpdateOne = true;
				}
			}
		}

		function compareRefreshCurrentSO(refreshData) {
			if (refreshData.workflow.length == $scope.currentSORequest.workflow.length) {
				return;
			}
			var existed = false;
			for (var i = refreshData.workflow.length; i--;) {
				existed = false;
				for (var k = $scope.currentSORequest.workflow.length; k--;) {
					if (refreshData.workflow[i].SOJobPackageHistoryId == $scope.currentSORequest.workflow[k].SOJobPackageHistoryId) {
						existed = true;
						break;
					}

				}
				if (!existed) {
					$scope.isUpdatedInRefresh = true;
					refreshData.workflow[i].isUpdateOne = true;
				}
			}
		}

		$scope.refreshDataUpdate = function() {
			//remove update flag setted last time
			for (var i = $scope.mainResult.length; i--;) {
				$scope.mainResult[i].isUpdateOne = false;
			}

			if ($scope.currentSORequest.workflow && $scope.currentSORequest.workflow.length > 0) {
				for (var i = $scope.currentSORequest.workflow.length; i--;) {
					$scope.currentSORequest.workflow[i].isUpdateOne = false;
				}
			}



			//add update data
			for (var i = $scope.refreshResult.length; i--;) {
				if ($scope.refreshResult[i].isUpdateOne) {
					if ($scope.refreshResult[i].ReceivedTime) {
						$scope.refreshResult[i].ReceivedTime = $.format.date($scope.refreshResult[i].ReceivedTime, 'yyyy-MM-dd HH:mm:ss');
					}

					$scope.mainResult.push(angular.copy($scope.refreshResult[i]));
				}
			}
			if ($scope.refreshCurrentSORequest) {
				for (var i = $scope.refreshCurrentSORequest.workflow.length; i--;) {
					if ($scope.refreshCurrentSORequest.workflow[i].isUpdateOne) {
						$scope.currentSORequest.workflow.push(angular.copy($scope.refreshCurrentSORequest.workflow[i]));
					}
				}
			}



			//reload data in page
			copySearchingResultToFilterResult();
			analyseSearchingResult();

			if ($scope.detailDivClass) {
				$scope.showDetails($scope.currentSORequest.SORequestId);
			}
			$scope.isUpdatedInRefresh = false;
		}

		$scope.$watch('isFilterZone', function(nV, oV) {
			if (!nV) {
				if (!$rootScope.hasPermission([5])) {
					// alert('You have no right to search.');
					$rootScope.dangerAlert('You have no right to search.');
					$scope.isFilterZone = true;
				}
			}
		});

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

		$scope.resetSearchCondition = function() {
			$scope.searchCondition.bookingId = null;
			$scope.searchCondition.inttraNo = null;
			$scope.searchCondition.bookingNo = null;
			$scope.searchCondition.sender = null;
			$scope.searchCondition.dispatchedGroup = null;
			$scope.searchCondition.assignedUser = null;
			$scope.searchCondition.service = null;
			$scope.searchCondition.por = null;
			$scope.searchCondition.pol = null;
			$scope.searchCondition.startDate = moment().format('YYYY-MM-DD');
			$scope.searchCondition.endDate = moment().add(1, 'days').format('YYYY-MM-DD');
		}

		$scope.searchSO = function() {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/SEARCHSO',
				params: {
					soId: $scope.searchCondition.bookingId,
					bookingNo: $scope.searchCondition.bookingNo,
					inttraNo: $scope.searchCondition.inttraNo,
					sender: $scope.searchCondition.sender == $scope.searchCondition.noResult ? null : $scope.searchCondition.sender,
					group: $scope.searchCondition.dispatchedGroup == $scope.searchCondition.noResult ? null : $scope.searchCondition.dispatchedGroup,
					user: $scope.searchCondition.assignedUser == $scope.searchCondition.noResult ? null : $scope.searchCondition.assignedUser,
					service: $scope.searchCondition.service == $scope.searchCondition.noResult ? null : $scope.searchCondition.service,
					por: $scope.searchCondition.por == $scope.searchCondition.noResult ? null : $scope.searchCondition.por,
					pol: $scope.searchCondition.pol == $scope.searchCondition.noResult ? null : $scope.searchCondition.pol,
					startDate: $scope.searchCondition.startDate,
					endDate: $scope.searchCondition.endDate
				},
				cache: false
			}).success(function(data, status) {
				if (data && angular.isArray(data)) {
					if (data.length == 0) {
						// alert('No result.');
						$rootScope.dangerAlert('No result.');
						return;
					}
					for (var i = data.length; i--;) {
						if (!data[i]) {
							data[i] = {};
						}
						if (data[i].ReceivedTime) {
							data[i].ReceivedTime = $.format.date(data[i].ReceivedTime, 'yyyy-MM-dd HH:mm:ss');
						}

						data[i].isUpdateOne = false;
					}
					$scope.filterResult = data;
				}
			}).error(function(data, status) {
				// alert('Fitch SO request error.' + status + data);
				$rootScope.dangerAlert('Fitch SO request error.' + status + data);
			});
		}

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
			$scope.filters.ExecuteeName = null;
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
			$.each($scope.mainResult, function(i, v) {
				var data = angular.extend(v);
				data.checkingDetails = false;
				$scope.filterResult.push(data);
			})
		}

		function loadMainData(successCb, errorCb, isModal) {
			if (isModal) {
				$rootScope.loadingShow('Fetching data...');
			}

			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETMAINSOREQUEST',
				cache: false,
			}).success(function(data, status) {
				successCb(data, status);
			}).error(function(data, status) {
				errorCb(data, status);
			});
		}



		function analyseSearchingResult() {

			var CHECK_VALUE = 'checkValue'
			var data = $scope.filterResult;

			if (!data || data.length == 0) {
				clearAnalyseResult();
				return;
			}
			clearAnalyseResult($scope.mainResult[0]);

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
					// alert('Result Model is null.');
					$rootScope.successAlert('Result Model is null.');
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
					Vessel: [],
					VesselObj: {},
					Voyage: [],
					VoyageObj: {},
					POR: [],
					PORObj: {},
					POL: [],
					POLObj: {},
					IsPreAssign: [],
					IsPreAssignObj: {}
				};
			}
		}

		loadMainData(
			function(data, status, isModal) {
				$rootScope.loadingChangeMessage('Calculating data...')

				if (data && angular.isArray(data)) {
					if (data.length == 0) {
						$rootScope.loadingHide();
						$rootScope.successAlert('No result.');
						return;
					}
					formatSORequestData(data);
					$scope.mainResult = data;
					copySearchingResultToFilterResult();
					analyseSearchingResult();
					if (isModal) {
						$rootScope.loadingHide();
					}
					$rootScope.loadingHide();
				} else {
					$rootScope.loadingHide();
					$rootScope.successAlert(data);
				}
			},
			function(data, status) {
				$rootScope.loadingHide();
				$rootScope.dangerAlert('Fitch SO request error.' + status + data);
			}, true);

		function formatSORequestData(data) {
			for (var i = data.length; i--;) {
				if (!data[i]) {
					data[i] = {};
				}
				if (data[i].ReceivedTime) {
					data[i].ReceivedTime = $.format.date(data[i].ReceivedTime, 'yyyy-MM-dd HH:mm:ss');
				}
				if (data[i].IsPreAssign && data[i].IsPreAssign == true) {
					data[i].IsPreAssign = 'Yes';
				} else {
					data[i].IsPreAssign = 'No';
				}

				data[i].isUpdateOne = false;
			}
		}

		function setInputterFullColumns() {
			$scope.columnDefs = [{
					field: 'SORequestId',
					displayName: 'Id',
					width: 80,
					pinned: true,
					cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()" "><span ng-cell-text><a ng-click="showDetails(COL_FIELD,$event);">{{COL_FIELD}}</a></span></div>'
				},
				// {
				// 	field: 'Remark',
				// 	displayName: 'Information',
				// 	width: 300
				// }, 
				{
					field: 'OriginalType',
					displayName: 'Type',
					width: 100
				}, {
					field: 'StatusName',
					displayName: 'Status',
					width: 100
				}, {
					field: 'ExecuteeName',
					displayName: 'Executee',
					width: 160
				}, {
					field: 'Service',
					displayName: 'Service',
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
					field: 'POR',
					displayName: 'POR',
					width: 160
				}, {
					field: 'POL',
					displayName: 'POL',
					width: 160
				}, {
					field: 'IsPreAssign',
					displayName: 'Has bookingNo',
					width: 100
				}, {
					field: 'Sender',
					displayName: 'Sender',
					width: 150
				}, {
					field: 'ReceivedTime',
					displayName: 'Received Time',
					width: 150
				}, {
					field: 'FinishTime',
					displayName: 'Finish Time',
					width: 150
				}
			];
		}

		function setInputterBriefColumns() {
			$scope.columnDefs = [{
				field: 'SORequestId',
				displayName: 'Id',
				pinned: true,
				// width: 100,
				cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()" ng-click="showDetails(COL_FIELD,$event);"><span ng-cell-text><a >{{COL_FIELD}}</a></span><span class="glyphicon glyphicon-eye-open" ng-show="row.entity.checkingDetails" style="float:right;"></span></div>'
			}];
		}

		$scope.siGrid = {
			data: 'filterResult',
			enableColumnResize: true,
			multiSelect: true,
			showSelectionCheckbox: true,
			selectWithCheckboxOnly: true,
			enableRowSelection: true,
			enablePinning: true,
			columnDefs: 'columnDefs',
			rowTemplate: '<div ng-style="{ \'cursor\': row.cursor,\'background-color\':isUpdateSORequest(row) }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last}">&nbsp;</div><div ng-cell></div></div>',
			checkboxHeaderTemplate: '<input class="ngSelectionHeader" type="checkbox" id="soMainCheckbox" ng-show="multiSelect" ng-model="allSelected" ng-change="toggleSelectAll(allSelected)"/>',
			beforeSelectionChange: function(rows, checkAll, self) {
				if (angular.isArray(rows) && checkAll == true) {
					self.selectedItems.length = 0;
					for (var i = 0; i < rows.length; i++) {
						(function(i) {
							if ($scope.canExecute(rows[i].entity)) {
								rows[i].selected = checkAll;
								if (rows[i].clone) {
									rows[i].clone.selected = checkAll;
								}
								if (checkAll) {
									self.selectedItems.push(rows[i].entity);
									//self.selectedItems.length++;
								}
							}
						})(i);
					}
					return false;
				} else {
					return true;
				}

			},
			checkboxCellTemplate: '<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" ng-disabled="!canExecute(row.entity);" /></div>'
		};

		setInputterFullColumns();

		$scope.isUpdateSORequest = function(data) {
			var v = data.getProperty('isUpdateOne');
			if (v && v.toString() == "true") {
				return "yellow";
			} else {
				return "";
			}
		}

		$scope.$watch('siGrid.$gridScope.selectedItems.length', function(nV, oV) {
			if (nV >= 1) {
				$scope.hasSelectedSO = true;
			} else {
				$scope.hasSelectedSO = false;
			}

		});

		$scope.canExecute = function(data) {


			switch (data.StatusName) {
				case 'Enter':
				case 'Synchronizing':
				case 'AutoAssigned':
				case 'ForceAssign':
				case 'Finished':
					return false;
				case 'Synchronized':
				case 'Undispatch':
				case 'Cancelled':
				case 'Confirmed':
					if ($rootScope.hasPermission([3])) {
						return true;
					} else {
						return false;
					}
				case 'AutoDispatched':
				case 'ForceDispatch':
					if ($rootScope.hasPermission([3, 2])) {
						return true;
					} else {
						return false;
					}
				default:

					return true;
			}
		}

		function loadDispatchableGroups(successCb, errorCb) {
			$scope.canDispatchedGroup = [];
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETDISPATCHABLEGROUP',
				cache: false
			}).success(function(data, status) {
				if ($.isArray(data) && data.length > 0) {
					$.each(data, function(i, v) {
						$scope.canDispatchedGroup.push({
							id: v.GroupId,
							name: v.GroupName,
							dispatched: v.Dispatched,
							finished: v.Finished,
							unfinished: v.Unfinished
						});
					});
				}
				successCb();

			}).error(function(data, status) {
				errorCb(data + status);
			});
		}

		function loadAssignableUser(successCb, errorCb) {
			$scope.canAssignUser = [];
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETASSIGNABLEUSER',
				cache: false
			}).success(function(data, status) {
				if ($.isArray(data) && data.length == 2) {
					$.each(data[0], function(i, v) {
						$scope.canAssignUser.push({
							groupId: v.GroupId,
							groupName: v.GroupName,
							users: []
						});
					});
					$.each(data[1], function(i, v) {
						$.each($scope.canAssignUser, function(k, item) {
							if (item.groupId == v.GroupId) {
								item.users.push({
									id: v.UserId,
									groupId: item.groupId,
									name: v.FullName,
									finished: v.Finished,
									unfinished: v.Unfinished,
									assigned: v.Assigned,
									checked: false
								});
								return false;
							} else {
								return;
							}
						});
					});
					successCb();
				} else {
					errorCb(data + status);
				}
			}).error(function(data, status) {
				errorCb(data + status);
			})
		}

		$scope.openDispatchGroupDialog = function() {
			if (!isSelectedSOInSameService()) {
				// alert('You can\'t batch dispatch SO which belongs to different service.');
				$rootScope.dangerAlert('You can\'t batch dispatch SO which belongs to different service.');
				return;
			}
			loadDispatchableGroups(function() {
				if ($scope.detailDivClass) {
					checkDispatchedGroup(function() {
						$('#dispatchDialog').modal('show');
					});
				} else {
					$('#dispatchDialog').modal('show');
				}

			}, function(err) {
				// alert('Loading dispatch group error.' + err);
				$rootScope.dangerAlert('Loading dispatch group error.' + err);
			});

		}

		function checkDispatchedGroup(cb) {
			getCurrentSORequestDispatchedGroup(
				function(data) {
					if (data.length != 1) {
						cb();
						return;
					}
					for (var i = $scope.canDispatchedGroup.length; i--;) {
						if ($scope.canDispatchedGroup[i].id == data[0].ExecuteeId) {
							$scope.canDispatchedGroup[i].checked = true;
							break;
						}
					}
					cb();
				},
				function(error) {
					cb();
				});
		}

		$scope.openAssignUserDialog = function() {
			if (!isSelectedSOInSameGroup()) {
				// alert('You can\'t batch assign SO which belongs to different groups.');
				$rootScope.dangerAlert('You can\'t batch assign SO which belongs to different groups.');
				return;
			}
			loadAssignableUser(function() {
				if ($scope.detailDivClass) {
					checkAssignedUsers(function() {
						$('#assignDialog').modal('show');
					});
				} else {
					$('#assignDialog').modal('show');
				}
			}, function(err) {
				// alert('Loading assign user error.' + err);
				$rootScope.dangerAlert('Loading assign user error.' + err);
			});

		}

		function checkAssignedUsers(cb) {
			getCurrentSORequestAssignedUserIds(
				function(data) {
					var assigned = $.map(data, function(v, i) {
						return v.UserId;
					});
					for (var i = $scope.canAssignUser.length; i--;) {
						for (var k = $scope.canAssignUser[i].users.length; k--;) {
							if ($.inArray($scope.canAssignUser[i].users[k].id, assigned) != -1) {
								$scope.canAssignUser[i].users[k].checked = true;
							}
						}
					}
					cb();
				},
				function(error) {
					cb();
				});

		}

		$scope.forceDispatch = function() {
			if ($scope.detailDivClass) {
				if (getSelectedGroupIdFromDispatchDialog().length != 1) {
					// alert('You must choose only one group to dispatch.');
					$rootScope.dangerAlert('You must choose only one group to dispatch.');
					return;
				}
				soloDispatch();
			} else {
				batchDispatch();
			}
		}

		function soloDispatch() {
			var data = getDispatchData();
			if (data && data.length > 0) {
				$http({
					method: 'POST',
					url: '/restfulAPI/so/FORCESOLODISPATCH',
					data: data,
					cache: false
				}).success(function(data, status) {
					//resetGroupStatus();
					updatehSOWithForceDispatchAssign(data);
					// alert('Dispatch success.');
					$rootScope.successAlert('Dispatch success.');
					$('#dispatchDialog').modal('hide');
				}).error(function(data, status) {
					// alert('Fail to force dispatch, please dispatch again.' + data);
					$rootScope.dangerAlert('Fail to force dispatch, please dispatch again.' + data);
				});
			}
		}

		function batchDispatch() {
			var data = getDispatchData();
			if (data && data.length > 0) {
				$http({
					method: 'POST',
					url: '/restfulAPI/so/FORCEBATCHDISPATCH',
					data: data,
					cache: false
				}).success(function(data, status) {
					//resetGroupStatus();
					updatehSOWithForceDispatchAssign(data);
					// alert('Dispatch success.');
					$rootScope.successAlert('Dispatch success.');
					$('#dispatchDialog').modal('hide');
				}).error(function(data, status) {
					// alert('Fail to force dispatch, please dispatch again.');
					$rootScope.dangerAlert('Fail to force dispatch, please dispatch again.' + data);
				});
			}
		}

		$scope.forceAssign = function() {
			if ($scope.detailDivClass) {
				soloAssign();
			} else {
				batchAssign();
			}
		}

		function soloAssign() {
			var selectedUserIds = getSelectedUserIdsFromAssignDialog();
			if (!selectedUserIds || selectedUserIds.length == 0) {
				$http({
					method: 'POST',
					url: '/restfulAPI/so/SOLOUNASSIGN',
					params: {
						id: $scope.currentSORequest.SORequestId
					},
					cache: false
				}).success(function(data, status) {
					updatehSOWithForceDispatchAssign(data);
					// alert('Assign success.');
					$rootScope.successAlert('Assign success.');
					$('#assignDialog').modal('hide');
				}).error(function(data, status) {
					// alert('Fail to force assign, please assign again.');
					$rootScope.dangerAlert('Fail to force assign, please assign again.');
				});
			} else {
				var data = getAssignData();
				if (data && data.length > 0) {
					$http({
						method: 'POST',
						url: '/restfulAPI/so/FORCESOLOASSIGN',
						data: data,
						cache: false,
					}).success(function(data, status) {
						//resetAssignUserStatus();
						updatehSOWithForceDispatchAssign(data);
						// alert('Assign success.');
						$rootScope.successAlert('Assign success.');
						$('#assignDialog').modal('hide');
					}).error(function(data, status) {
						// alert('Fail to force assign, please assign again.');
						$rootScope.dangerAlert('Fail to force assign, please assign again.');
					})
				}
			}

		}

		function batchAssign() {
			var data = getAssignData();
			if (data && data.length > 0) {
				$http({
					method: 'POST',
					url: '/restfulAPI/so/FORCEBATCHASSIGN',
					data: data,
					cache: false,
				}).success(function(data, status) {
					//resetAssignUserStatus();
					updatehSOWithForceDispatchAssign(data);
					// alert('Assign success.');
					$rootScope.successAlert('Assign success.');
					$('#assignDialog').modal('hide');
				}).error(function(data, status) {
					// alert('Fail to force assign, please assign again.');
					$rootScope.dangerAlert('Fail to force assign, please assign again.');
				})
			}
		}

		$('#assignDialog').on('hidden.bs.modal', function(e) {
			resetAssignUserStatus();
		});

		$('#dispatchDialog').on('hidden.bs.modal', function(e) {
			resetGroupStatus();
		});


		function getAssignData() {
			var selectedUserIds = getSelectedUserIdsFromAssignDialog();
			var selectedRequestId = [];
			if ($scope.detailDivClass) {
				selectedRequestId.push($scope.currentSORequest.SORequestId);
			} else {
				selectedRequestId = $.map($scope.siGrid.$gridScope.selectedItems, function(v, i) {
					return v.SORequestId;
				});
			}
			var data = averageDistribute(
				selectedUserIds,
				selectedRequestId,
				$scope.siGrid.$gridScope.selectedItems.length.toString() + ' SO can\'t be assigned to ' + selectedUserIds.length.toString() + ' colleagues. Please select again.');

			return data;
		}

		function isSelectedSOInSameService() {
			var isInSameService = true;
			var existedService = null;
			$.each($scope.siGrid.$gridScope.selectedItems, function(v, i) {
				if (!i) {
					existedService = v.Service;
				}
				if (v.Service != existedService) {
					isInSameService = false;
					return false;
				}
			});
			return isInSameService;
		}

		function isSelectedSOInSameGroup() {
			var isInSameGroup = true;
			var existedGroup = null;
			$.each($scope.siGrid.$gridScope.selectedItems, function(i, v) {
				if (!i) {
					if (v.ExecuteeTypeId != 2002) {
						isInSameGroup = false;
						return false;
					}
					existedGroup = v.Executee;
				}
				if (!(v.ExecuteeTypeId == 2002 && v.Executee == existedGroup)) {
					isInSameGroup = false;
					return false;
				}
			});
			return isInSameGroup;
		}

		function getSelectedUserIdsFromAssignDialog() {
			var selectedUserIds = [];
			for (var i = $scope.canAssignUser.length; i--;) {
				for (var k = $scope.canAssignUser[i].users.length; k--;) {
					(function(i, j) {
						if ($scope.canAssignUser[i].users[j].checked) {
							selectedUserIds.push({
								userId: $scope.canAssignUser[i].users[j].id,
								groupId: $scope.canAssignUser[i].users[j].groupId
							});
						}
					})(i, k);
				}
			}
			return selectedUserIds;
		}

		function resetGroupStatus() {
			for (var i = $scope.canDispatchedGroup.length; i--;) {
				$scope.canDispatchedGroup[i].checked = false;
			}
		}

		function resetAssignUserStatus() {
			for (var i = $scope.canAssignedUser.length; i--;) {
				for (var k = $scope.canAssignedUser[i].users.length; k--;) {
					$scope.canAssignedUser[i].users[k].checked = false;
				}
			}
		}

		function updatehSOWithForceDispatchAssign(data) {
			if (data && data.length > 0) {
				for (var i = data.length; i--;) {
					for (var k = $scope.mainResult.length; k--;) {
						if ($scope.mainResult[k].SORequestId == data[i].SORequestId) {
							$scope.mainResult[k] = data[i];
						}
					}
				}
				copySearchingResultToFilterResult();

				analyseSearchingResult();
			}
			$scope.siGrid.$gridScope.allSelected = false;
			$scope.siGrid.$gridScope.toggleSelectAll(false);
		}

		function getDispatchData() {
			var selectedGroupIds = getSelectedGroupIdFromDispatchDialog();
			var selectedRequestId = [];
			if ($scope.detailDivClass) {
				selectedRequestId.push($scope.currentSORequest.SORequestId);
			} else {
				selectedRequestId = $.map($scope.siGrid.$gridScope.selectedItems, function(v, i) {
					return v.SORequestId;
				});
			}
			var data = averageDistribute(
				selectedGroupIds,
				selectedRequestId,
				$scope.siGrid.$gridScope.selectedItems.length.toString() + ' SO can\'t be dispatched to ' + selectedGroupIds.length.toString() + ' groups. Please select again.');

			return data;
		}

		function getSelectedGroupIdFromDispatchDialog() {
			var selectedGroupIds = [];
			for (var i = $scope.canDispatchedGroup.length; i--;) {
				(function(i) {
					if ($scope.canDispatchedGroup[i].checked) {
						selectedGroupIds.push($scope.canDispatchedGroup[i].id);
					}
				})(i);
			}
			return selectedGroupIds
		}

		function averageDistribute(keys, values, alertInfo) {
			var data = [];
			//for one request assign to more then one inputter
			if (values.length == 1) {
				for (var i = keys.length; i--;) {
					(function(i) {
						data[i] = {
							key: keys[i],
							values: []
						};
						data[i].values.push(values[0]);
					})(i);
				}
			} else { // for other case
				for (var i = keys.length; i--;) {
					(function(i) {
						data[i] = {
							key: keys[i],
							values: []
						};
					})(i);
				}
				if (values.length < keys.length) {
					// alert(alertInfo);
					$rootScope.dangerAlert(alertInfo);
					return null;
				} else {
					var count = Math.ceil(values.length / keys.length);
					for (var i = 0, k = 1, j = 0; i < values.length; i++) {
						if (k > count) {
							k = 1;
							j++;
						}
						(function(i) {
							data[j].values.push(values[i]);
						})(i);
						k++;
					}
				}
			}

			return data;
		}

		$scope.showDetails = function(requestId, event, item, value) {
			setInputterBriefColumns();
			$scope.listDivClass = false;
			$scope.detailDivClass = true;
			for (var i = $scope.filterResult.length; i--;) {
				if ($scope.filterResult[i].SORequestId != requestId) {
					$scope.filterResult[i].checkingDetails = false;
					continue;
				}
				$scope.filterResult[i].checkingDetails = true;
			}
			showSODetails(requestId, function(data) {}, function(data, status) {
				// alert('Fail to load data. Please try it again, thanks.' + data + status);
				$rootScope.dangerAlert('Fail to load data. Please try it again, thanks.' + data + status);
			})

		}

		$scope.bakcToList = function() {
			setInputterFullColumns();
			$scope.listDivClass = true;
			$scope.detailDivClass = false;
		}

		function showSODetails(requestId, successCb, errorCb) {
			for (var i = $scope.filterResult.length; i--;) {
				if ($scope.filterResult[i].SORequestId != requestId) {
					continue;
				}
				$scope.currentSORequest = $scope.filterResult[i];
				if ($scope.currentSORequest.hasOwnProperty('workflow') && $scope.currentSORequest.workflow.length > 0) {
					successCb($scope.currentSORequest.workflow);
					return;
				}

				loadSODetails(
					requestId,
					function(results) {
						$scope.currentSORequest.workflow = results[0];
						$scope.currentSORequest.baseInfo = results[1][0];
						$scope.currentSORequest.bookings = results[2];
						successCb();
					},
					function(err) {
						errorCb(null, err);
					});
			}
		}

		function loadSODetails(requestId, successCb, errorCb) {
			async.parallel([
				function(callback) {
					getOwnWorkFlow(requestId, callback);
				},
				function(callback) {
					getOwnBaseInfo(requestId, callback);
				},
				function(callback) {
					getRelatedBookings(requestId, callback);
				}
			], function(err, results) {
				if (err) {
					//alert('Please re-click the requestId to reload the data.' + err);
					errorCb(err);
					return;
				}
				for (var i = results[0].length; i--;) {
					results[0][i].OperateTime = $.format.date(results[0][i].OperateTime, 'yyyy-MM-dd HH:mm:ss');
				}
				for (var i = results[2].length; i--;) {
					results[2][i].BookingConfirmationTime = $.format.date(results[2][i].BookingConfirmationTime, 'yyyy-MM-dd HH:mm:ss');
				}
				results[1][0].ReceivedTime = $.format.date(results[1][0].ReceivedTime, 'yyyy-MM-dd HH:mm:ss');
				results[1][0].RequestTime = $.format.date(results[1][0].RequestTime, 'yyyy-MM-dd HH:mm:ss');
				successCb(results);
			});
		}


		function getOwnWorkFlow(requestId, callback) {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETSOWORKFLOW',
				params: {
					id: requestId
				},
				cache: false
			}).success(function(data, status) {
				callback(null, data);
			}).error(function(data, status) {
				callback(data + status, null);
			});
		}

		function getOwnBaseInfo(requestId, callback) {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETSOBASEINFO',
				params: {
					id: requestId
				},
				cache: false
			}).success(function(data, status) {
				callback(null, data);
			}).error(function(data, status) {
				callback(data + status, null);
			})
		}

		function getRelatedBookings(requestId, callback) {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETRELATEDBOOKINGS',
				params: {
					id: requestId
				},
				cache: false
			}).success(function(data, status) {
				callback(null, data);
			}).error(function(data, status) {
				callback(data + status, null);
			})
		}

		$scope.uploader = {
			attachment: '',
			progressbar: 0,
			percentage: null
		}

		$scope.workFlowBaseInfo = {
			types: [{
				id: 5001,
				name: 'Update'
			}, {
				id: 5002,
				name: 'Problem'
			}, {
				id: 5003,
				name: 'Resolved'
			}, {
				id: 1011,
				name: 'Finish'
			}],
			assignedUsers: []
		}

		$scope.newWorkFlow = {
			type: null,
			remark: null,
			books: null
		}
		$scope.uploadAttachmentWithWorkFlowInfo = function(sCb, eCb) {
			$upload.upload({
				url: '/restfulAPI/so/UPLOADWORKFLOWFILE',
				data: {
					typeId: $scope.newWorkFlow.type.id,
					remark: $scope.newWorkFlow.remark,
					soRequestId: $scope.currentSORequest.SORequestId
				},
				file: $scope.uploader.attachment
			}).progress(function(evt) {
				$scope.uploader.progressbar = parseInt(100.0 * evt.loaded / evt.total);
				if ($scope.uploader.progressbar != 100) {
					$scope.uploader.percentage = $scope.uploader.progressbar + '%';
				} else {
					$scope.uploader.percentage = 'Done';
				}
			}).success(function(data, status, headers, config) {
				sCb(data, status, headers, config);
			}).error(function(data, status, headers, config) {
				eCb(data, status, headers, config);
			});
		}

		$scope.selectFileChanged = function() {
			$scope.uploader.progressbar = $scope.uploader.percentage = 0;
			if ($scope.uploader.attachment != '' && $scope.uploader.attachment[0].name.substr($scope.uploader.attachment.length - 4).toUpperCase() == 'EXE') {
				// alert('Executable files can\' be uploaded.');
				$rootScope.dangerAlert('Executable files can\' be uploaded.');
				$scope.uploader.attachment = null;
			}
		}

		$scope.openWorkFlowDialog = function() {
			$scope.uploader.attachment = null;
			$scope.uploader.progressbar = 0;
			$scope.uploader.percentage = null;
			$scope.newWorkFlow.remark = null;
			prepareWorkFlowBaseInfo();
			$('#workflowDialog').modal('show');
		}

		$scope.addWorkFlow = function() {
			if ($scope.uploader.attachment && $scope.uploader.attachment != '') {
				$scope.uploadAttachmentWithWorkFlowInfo(function() {
					// alert('Save successfully.');
					$rootScope.successAlert('Save successfully.');
					getOwnWorkFlow($scope.currentSORequest.SORequestId, function(err, result) {
						if (err) {
							// alert('Fail to fetch work flow.' + err);
							$rootScope.dangerAlert('Fail to fetch work flow.' + err);
							$scope.uploader.progressbar = 0;
						} else {
							for (var i = result.length; i--;) {
								result[i].OperateTime = $.format.date(result[i].OperateTime, 'yyyy-MM-dd HH:mm:ss');
							}
							$scope.currentSORequest.workflow = result;
						}
					});
					$('#workflowDialog').modal('hide');
				}, function(data, status) {
					// alert('Fail to save.' + data + status);
					$rootScope.dangerAlert('Fail to save.' + data + status);
				});
			} else {
				$http({
					method: 'POST',
					url: '/restfulAPI/so/UPDATEWORKFLOW',
					data: {
						typeId: $scope.newWorkFlow.type.id,
						remark: $scope.newWorkFlow.remark,
						soRequestId: $scope.currentSORequest.SORequestId,
						filePath: null,
						fileName: null
					},
					cache: false
				}).success(function(data, status) {
					// alert('Success.');
					$rootScope.successAlert('Success.');
					getOwnWorkFlow($scope.currentSORequest.SORequestId, function(err, result) {
						if (err) {
							// alert('Fail to fetch work flow.' + err);
							$rootScope.dangerAlert('Fail to fetch work flow.' + err);
						} else {
							for (var i = result.length; i--;) {
								result[i].OperateTime = $.format.date(result[i].OperateTime, 'yyyy-MM-dd HH:mm:ss');
							}
							$scope.currentSORequest.workflow = result;
						}
					});
					$('#workflowDialog').modal('hide');
				}).error(function(data, status) {
					// alert(data + status);
					$rootScope.dangerAlert(data + status);
				});
			}
		}



		function prepareWorkFlowBaseInfo() {
			// workFlowDialog_setUserCanChosen();
			workFlowDialog_setWorkFlowTypeOptions();
		}

		function workFlowDialog_setWorkFlowTypeOptions() {
			$scope.newWorkFlow.type = $scope.workFlowBaseInfo.types[0];
		}

		function getCurrentSORequestAssignedUserIds(successCb, errorCb) {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETASSIGNEDUSERS',
				params: {
					id: $scope.currentSORequest.SORequestId
				},
				cache: false
			}).success(function(data, status) {
				successCb(data);
			}).error(function(data, status) {
				errorCb(data + status);
			});
		}

		function getCurrentSORequestDispatchedGroup(successCb, errorCb) {
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETDISPATCHEDGROUP',
				params: {
					id: $scope.currentSORequest.SORequestId
				},
				cache: false
			}).success(function(data, status) {
				successCb(data);
			}).error(function(data, status) {
				errorCb(data + status);
			});
		}

		$scope.showDispatchTips = function() {
			$('#dispatchTipDiv').show();
			$('#dispatchShowTipId').hide();
		}

		$scope.hideDispatchTips = function() {
			$('#dispatchTipDiv').hide();
			$('#dispatchShowTipId').show();
		}

		$scope.showAssignTips = function() {
			$('#assignTipDiv').show();
			$('#assignShowTipId').hide();
		}

		$scope.hideAssignTips = function() {
			$('#assignTipDiv').hide();
			$('#assignShowTipId').show();
		}



		function initialAutoComplete(elementId, url, propertyName) {
			$('#' + elementId).autocomplete({
				source: function(request, response) {
					$http({
						method: 'GET',
						url: url,
						params: {
							key: request.term
						},
						cache: false
					}).success(function(data, status) {
						var values = [];
						angular.forEach(data, function(v, i) {
							values.push(v.Name);
						})
						if (values && values.length > 0) {
							response(values);
						} else {
							response([$scope.searchCondition.noResult]);
						}
					}).error(function(data, status) {
						response([$scope.searchCondition.noResult]);
					});
				},
				select: function(event, ui) {
					if (ui.item.label == $scope.searchCondition.noResult) {
						$scope.searchCondition[propertyName] = null;
					} else {
						$scope.searchCondition[propertyName] = ui.item.label;
					}

				}
			});
		}

		initialAutoComplete('inputSearchService', '/restfulAPI/foundation/AUTOCOMPLETESERVICE', 'service');
		initialAutoComplete('inputSearchGroup', '/restfulAPI/foundation/AUTOCOMPLETEGROUP', 'dispatchedGroup');
		initialAutoComplete('inputSearchUser', '/restfulAPI/foundation/AUTOCOMPLETEUSER', 'assignedUser');
		initialAutoComplete('inputSearchPOR', '/restfulAPI/foundation/AUTOCOMPLETEPOR', 'por');
		initialAutoComplete('inputSearchPOL', '/restfulAPI/foundation/AUTOCOMPLETEPOL', 'pol');
		initialAutoComplete('inputSearchSender', '/restfulAPI/foundation/AUTOCOMPLETEUSER', 'sender');

		$('#books').tagsinput({
			maxChars: 20,
			trimValue: true,
			allowDuplicates: false,
			inputSize: 20
		});
		$('#books').on('itemsAdded', function(event) {
			$rootScope.loadingShow('Calculate the bookings. Please wait for a while...');
			if (event.items && event.items.length > 0) {
				var msg = '',
					items = event.items;

				for (var i = items.length; i--;) {
					if (items[i] == '')
						if (items[i].length == 17 || items[i].length == 19) {
							if (items[i].substr(0, 3) != '181') {
								(function(i) {
									msg += 'Booking(' + items[i] + ')' + ' is not start with \'181\'.||';
								})(i);
								$('#books').tagsinput('remove', items[i]);
							}
						} else {
							(function(i) {
								msg += 'Booking(' + items[i] + ')' + '\'s length is not 17 or 19.||';
							})(i);
							$('#books').tagsinput('remove', items[i]);
						}
				}
				if (msg != '') {
					$rootScope.dangerAlert(msg);
				}

			}
			$rootScope.loadingHide();
		});

	})
	.directive('onLastRepeat', function() {
		return function(scope, element, attrs) {
			if (scope.$last) setTimeout(function() {
				scope.$emit('onRepeatLast', element, attrs);
			}, 1);
		};
	})
	.controller('statisticCtrl', function($scope, $http, $rootScope) {
		$scope.baseData = null;
		$scope.sortGroupInfo = [];
		$scope.groupInfo = [];
		$scope.sortUserInfo = [];
		$scope.userInfo = [];

		$scope.totalPieInfo = {
			yesterdayUnfinished: {
				value: 0,
				color: '#F7464A',
				highlight: '#FF5A5E',
				label: 'UYS',
				details: []
			},
			todayUnfinished: {
				value: 0,
				color: '#FDB45C',
				highlight: '#FFC870',
				label: 'UTS',
				details: []
			},
			finished: {
				value: 0,
				color: '#46BFBD',
				highlight: '#5AD3D1',
				label: 'FS',
				details: []
			}
		};

		function loadTodayInfo() {
			$rootScope.loadingShow('loading data...');
			$http({
				method: 'GET',
				url: '/restfulAPI/so/GETTODAYSTATISTICINFO',
				cache: false
			}).success(function(data, status) {
				$scope.baseData = data;
				$rootScope.loadingChangeMessage('Analysing...');
				if (tryAnalyseTodayInfo($scope.baseData)) {
					refreshCharts();
					$rootScope.loadingHide();
				}


			}).error(function(data, status) {
				$rootScope.loadingHide();
				$rootScope.dangerAlert('Fail to load data from server.');
			});
		}

		function tryAnalyseTodayInfo(data) {

			for (var i = data.length; i--;) {
				(function(i) {
					setTotalInfo(data[i]);
					setGroupInfo(data[i]);
					setUserInfo(data[i]);
				})(i);
			}
			sortUserAndGroup();
			analyseEachItem();
			return true;
		}

		function analyseEachItem() {
			for (var i = $scope.sortGroupInfo.length; i--;) {
				analyseItem($scope.sortGroupInfo[i]);
			}
			for (var i = $scope.sortUserInfo.length; i--;) {
				analyseItem($scope.sortUserInfo[i]);
			}
		}

		function analyseItem(data) {
			data.linefinishedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			data.lineunfinishedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			var clock_8 = moment({
				hour: 8
			});
			var clock_9 = moment({
				hour: 9
			});
			var clock_10 = moment({
				hour: 10
			});
			var clock_11 = moment({
				hour: 11
			});
			var clock_12 = moment({
				hour: 12
			});
			var clock_13 = moment({
				hour: 13
			});
			var clock_14 = moment({
				hour: 14
			});
			var clock_15 = moment({
				hour: 15
			});
			var clock_16 = moment({
				hour: 16
			});
			var clock_17 = moment({
				hour: 17
			});
			var clock_18 = moment({
				hour: 18
			});
			var clock_19 = moment({
				hour: 19
			});
			var clock_20 = moment({
				hour: 20
			});
			var clock_21 = moment({
				hour: 21
			});
			var clock_22 = moment({
				hour: 22
			});
			var clock_23 = moment({
				hour: 23
			});
			var startIndex, endIndex;
			var details = data.details;
			for (var i = details.length; i--;) {
				var dt = moment(details[i].DispatchedTime),
					et;
				if (dt.isBefore(clock_8)) {
					startIndex = 0;
				} else {
					startIndex = dt.hour() - 8;
				}
				if (details[i].EndTime && details[i].EndTime != '') {
					et = moment(details[i].EndTime);
				} else {
					et = null;
				}
				if (et) {
					if (et.isAfter(clock_23)) {
						endIndex = 15;
					} else {
						endIndex = et.hour() - 8;
					}
				} else {
					endIndex = 15
				}

				for (var k = startIndex; k < 16; k++) {
					data.lineunfinishedData[k] ++;
				}
				if (endIndex < 15) {
					for (var k = endIndex; k < 16; k++) {
						data.linefinishedData[k] ++;
						data.lineunfinishedData[k] --;
					}
				}


			}

		}

		function sortUserAndGroup() {
			for (var i = $scope.userInfo.length; i--;) {
				if ($scope.userInfo[i]) {
					$scope.sortUserInfo.push($scope.userInfo[i]);
				}
			}
			for (var i = $scope.groupInfo.length; i--;) {
				if ($scope.groupInfo[i]) {
					$scope.sortGroupInfo.push($scope.groupInfo[i]);
				}
			}
			$scope.sortUserInfo.sort(itemFinishedSort);
			$scope.sortGroupInfo.sort(itemFinishedSort);
		}

		function itemFinishedSort(a, b) {
			return -(a.finished - b.finished)
		}



		function setTotalInfo(item) {
			var now = moment();
			var statisticInfo = $scope.totalPieInfo;
			if (item.EndTime && item.EndTime != '') {
				statisticInfo.finished.value++;
				statisticInfo.finished.details.push(item);
				return;
			}
			if (item.EnterTime && item.EnterTime != '') {
				if (!moment(item.EnterTime).isBefore(now, 'day')) {
					statisticInfo.todayUnfinished.value++;
					statisticInfo.todayUnfinished.details.push(item);
					return;
				}
			}
			statisticInfo.yesterdayUnfinished.value++;
			statisticInfo.yesterdayUnfinished.details.push(item);
		}

		function setGroupInfo(item) {
			var statisticInfo = $scope.groupInfo;
			if (item.DispatchedGroupId && item.DispatchedGroupId != '') {
				var data = statisticInfo[item.DispatchedGroupId.toString()];
				if (!data) {
					data = statisticInfo[item.DispatchedGroupId.toString()] = {
						id: item.DispatchedGroupId,
						name: item.GroupName,
						unfinished: 0,
						finished: 0,
						details: []
					};
				}
				data.details.push(item);
				if (item.EndTime && item.EndTime != '') {
					data.finished++;
				} else {
					data.unfinished++;
				}
			}
		}

		function setUserInfo(item) {
			var statisticInfo = $scope.userInfo;
			if (item.AssignedUserId && item.AssignedUserId != '') {
				var data = statisticInfo[item.AssignedUserId.toString()];
				if (!data) {
					data = statisticInfo[item.AssignedUserId.toString()] = {
						id: item.AssignedUserId,
						name: item.UserName,
						unfinished: 0,
						finished: 0,
						details: []
					};
				}
				data.details.push(item);
				if (item.EndTime && item.EndTime != '') {
					data.finished++;
				} else {
					data.unfinished++;
				}
			}
		}

		function refreshCharts() {

			refreshTotalChart();

			refreshGroupBar();

			refreshUserBar();
		}

		$scope.$on('onRepeatLast', function(scope, element, attrs) {
			refreshGroups();
		})

		function refreshTotalChart() {
			var ctx_totalPie = $('#totalPie').get(0).getContext('2d');
			var chart_totalPie = new Chart(ctx_totalPie).Pie($scope.totalPieInfo);
		}

		function refreshGroupBar() {
			refreshTopBar($scope.sortGroupInfo, 'topGroupBar');
		}

		function refreshUserBar() {
			refreshTopBar($scope.sortUserInfo, 'topUserBar');
		}

		function refreshTopBar(data, elementId) {
			var chart_label = [];
			var chart_finishedValue = [];
			var chart_unfinishedValue = [];
			// var user = $scope.sortUserInfo;
			var topCount = 5;
			for (var i = 0; i < data.length; i++) {
				chart_label.push(data[i].name);
				chart_finishedValue.push(data[i].finished);
				chart_unfinishedValue.push(data[i].unfinished);
				if (i == (topCount - 1)) {
					break;
				}
			}
			var ctx_topBar = $('#' + elementId).get(0).getContext('2d');
			var chart_topBar = new Chart(ctx_topBar).Bar({
				labels: chart_label,
				datasets: [{
					fillColor: '#F7464A',
					strokeColor: '#F7464A',
					highlightFill: '#FF5A5E',
					highlightStroke: '#FF5A5E',
					data: chart_unfinishedValue
				}, {
					fillColor: '#46BFBD',
					strokeColor: '#46BFBD',
					highlightFill: '#5AD3D1',
					highlightStroke: '#5AD3D1',
					data: chart_finishedValue
				}]
			});
		}

		function refreshGroups() {
			var data = {
				labels: [
					'8:00',
					'9:00',
					'10:00',
					'11:00',
					'12:00',
					'13:00',
					'14:00',
					'15:00',
					'16:00',
					'17:00',
					'18:00',
					'19:00',
					'20:00',
					'21:00',
					'22:00',
					'23:00'
				],
				datasets: [{
					label: "Unfinished",
					fillColor: "#F7464A",
					strokeColor: "#F7464A",
					pointColor: "#F7464A",
					pointStrokeColor: "#F7464A",
					pointHighlightFill: "#FF5A5E",
					pointHighlightStroke: "#FF5A5E",
					data: null
				}, {
					label: "Finished",
					fillColor: "#46BFBD",
					strokeColor: "#46BFBD",
					pointColor: "#46BFBD",
					pointStrokeColor: "#46BFBD",
					pointHighlightFill: "#5AD3D1",
					pointHighlightStroke: "#5AD3D1",
					data: null
				}]
			}
			for (var i = $scope.sortGroupInfo.length; i--;) {
				createLineChart(angular.copy(data), $scope.sortGroupInfo[i]);
			}
		}

		function createLineChart(templateData, realData) {
			var ctx = $('#' + 'group_' + realData.id + '_lineChart').get(0).getContext('2d');
			templateData.datasets[0].data = realData.lineunfinishedData;
			templateData.datasets[1].data = realData.linefinishedData;
			var lineChart = new Chart(ctx).Line(templateData);
		}

		function getLineData(data) {

		}

		loadTodayInfo();

	});