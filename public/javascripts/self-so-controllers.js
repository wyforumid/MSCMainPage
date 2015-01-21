angular.module('selfSOControllers', ['toggle-switch', 'selfFilters', 'angularFileUpload'])
	.controller('SOCtrl', function($scope, $http, $upload, $rootScope) {
		$scope.searchingResult = [];
		$scope.filterResult = [];
		$scope.analyseResult = {};
		$scope.currentSORequest = {};
		// $scope.searchCondition = {BookingNo:[]};
		$scope.filters = {
			OriginalType: null,
			StatusName: null,
			ExecuteeName: null,
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
		$scope.pageModal = 1; //1 for main display 2 for search display. for now only auto refresh on main display modal.
		$scope.refreshResult = [];
		$scope.refreshCurrentSORequest = {};
		$scope.isUpdatedInRefresh = false;

		$scope.$watch('pageModal', function(nV, oV) {
			if (nV == 1) {
				setTimeout(mainRefresh, 10000);
			}
		});

		function mainRefresh() {
			if ($scope.pageModal == 2) {
				return;
			}
			async.parallel([
				function(callback) {
					loadMainData(
						function(data, status) {
							if (data && data.length > 0) {
								$scope.refreshResult = data;
								callback(null, $scope.refreshResult);
							} else {
								callback(null, null);
							}
						},
						function(data, status) {
							callback(data + status, null);
						});
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
				if ($scope.pageModal == 2) {
					return;
				}
				compareRefreshSO(results[0]);

				if (results[1]) {
					compareRefreshCurrentSO(results[1]);
				}

				if ($scope.pageModal == 1) {
					setTimeout(mainRefresh, 10000);
				}

			});



		}

		function compareRefreshSO(refreshData) {
			var existed = false;
			for (var i = refreshData.length; i--;) {
				existed = false;
				for (var k = $scope.searchingResult.length; k--;) {
					if (refreshData[i].SORequestId == $scope.searchingResult[k].SORequestId) {
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
			for (var i = $scope.searchingResult.length; i--;) {
				$scope.searchingResult[i].isUpdateOne = false;
			}

			if ($scope.currentSORequest.workflow && $scope.currentSORequest.workflow.length > 0) {
				for (var i = $scope.currentSORequest.workflow.length; i--;) {
					$scope.currentSORequest.workflow[i].isUpdateOne = false;
				}
			}



			//add update data
			for (var i = $scope.refreshResult.length; i--;) {
				if ($scope.refreshResult[i].isUpdateOne) {
					$scope.searchingResult.push(angular.copy($scope.refreshResult[i]));
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

			// if ($scope.detailDivClass) {
			// 	showDetails($scope.currentSORequest.SORequestId);
			// }
			$scope.isUpdatedInRefresh = false;
		}

		$scope.$watch('isFilterZone', function(nV, oV) {
			if (!nV) {
				if (!$rootScope.hasPermission(5)) {
					alert('You have no right to search.');
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
			$.each($scope.searchingResult, function(i, v) {
				var data = angular.extend(v);
				data.checkingDetails = false;
				$scope.filterResult.push(data);
			})
		}

		function loadMainData(successCb, errorCb) {
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

		loadMainData(
			function(data, status) {
				if (data && angular.isArray(data)) {
					if (data.length == 0) {
						alert('No result.');
						return;
					}
					for (var i = data.length; i--;) {
						if (!data[i]) {
							data[i] = {};
						}

						data[i].isUpdateOne = false;
					}
					$scope.searchingResult = data;
					copySearchingResultToFilterResult();
					analyseSearchingResult();
				} else {
					alert(data);
				}
			},
			function(data, status) {
				alert('Fitch SO request error.' + status + data);
			});


		function setInputterFullColumns() {
			$scope.columnDefs = [{
				field: 'SORequestId',
				displayName: 'Id',
				width: 80,
				pinned: true,
				cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()" "><span ng-cell-text><a ng-click="showDetails(COL_FIELD,$event);">{{COL_FIELD}}</a></span></div>'
			}, {
				field: 'Remark',
				displayName: 'Information',
				width: 300
			}, {
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
				field: 'POL',
				displayName: 'POL',
				width: 160
			}, {
				field: 'IsPreAssign',
				displayName: 'Is Pre Assign',
				width: 100
			}];
		}

		function setInputterBriefColumns() {
			$scope.columnDefs = [{
				field: 'SORequestId',
				displayName: 'Id',
				pinned: true,
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
					return false;
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
			loadDispatchableGroups(function() {
				$('#dispatchDialog').modal('show');
			}, function(err) {
				alert('Loading dispatch group error.' + err);
			});

		}

		$scope.openAssignUserDialog = function() {
			loadAssignableUser(function() {
				if ($scope.detailDivClass) {
					checkUsers();
				}
				$('#assignDialog').modal('show');
			}, function(err) {
				alert('Loading assign user error.' + err);
			});

		}

		function checkUsers() {
			var assigned = getCurrentSORequestAssignedUserIds();
			for (var i = $scope.canAssignUser.length; i--;) {
				for (var k = $scope.canAssignUser[i].Users.length; k--;) {
					if ($.inArray($scope.canAssignUser[i].Users[k].id, assigned) != -1) {
						$scope.canAssignUser[i].Users[k].checked = true;
					}
				}
			}
		}

		$scope.forceDispatch = function() {
			var data = autoBatchDispatch();
			if (data && data.length > 0) {
				$http({
					method: 'POST',
					url: '/restfulAPI/so/FORCEDISPATCH',
					data: data,
					cache: false
				}).success(function(data, status) {
					resetGroupStatus();
					updatehSOWithForceDispatchAssign(data);
					alert('Dispatch success.');
					$('#dispatchDialog').modal('hide');
				}).error(function(data, status) {
					alert('Fail to force dispatch, please dispatch again.');
				});
			}
		}

		$scope.forceAssign = function() {
			var data = autoBatchAssign();
			if (data && data.length > 0) {
				$http({
					method: 'POST',
					url: '/restfulAPI/so/FORCEASSIGN',
					data: data,
					cache: false,
				}).success(function(data, status) {
					resetAssignUserStatus();
					updatehSOWithForceDispatchAssign(data);
					alert('Assign success.');
					$('#assignDialog').modal('hide');
				}).error(function(data, status) {
					alert('Fail to force assign, please assign again.');
				})
			}
		}

		function autoBatchAssign() {
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
			var selectedRequestId = $.map($scope.siGrid.$gridScope.selectedItems, function(v, i) {
				return v.SORequestId;
			});
			var data = averageDistribute(
				selectedUserIds,
				selectedRequestId,
				$scope.siGrid.$gridScope.selectedItems.length.toString() + ' SO can\'t be assigned to ' + selectedUserIds.length.toString() + ' colleagues. Please select again.');

			return data;
		}

		function resetGroupStatus() {
			for (var i = $scope.canDispatchedGroup.length; i--;) {
				$scope.canDispatchedGroup[i].checked = false;
			}
		}

		function resetAssignUserStatus() {
			for (var i = $scope.canAssignUser.length; i--;) {
				for (var k = $scope.canAssignUser[i].users.length; k--;) {
					$scope.canAssignUser[i].users[k].checked = false;
				}
			}
		}

		function updatehSOWithForceDispatchAssign(data) {
			if (data && data.length > 0) {
				for (var i = data.length; i--;) {
					for (var k = $scope.searchingResult.length; k--;) {
						if ($scope.searchingResult[k].SORequestId == data[i].SORequestId) {
							$scope.searchingResult[k] = data[i];
						}
					}
				}
				copySearchingResultToFilterResult();

				analyseSearchingResult();
			}
			$scope.siGrid.$gridScope.allSelected = false;
			$scope.siGrid.$gridScope.toggleSelectAll(false);
		}

		function autoBatchDispatch() {
			var selectedGroupIds = [];
			for (var i = $scope.canDispatchedGroup.length; i--;) {
				(function(i) {
					if ($scope.canDispatchedGroup[i].checked) {
						selectedGroupIds.push($scope.canDispatchedGroup[i].id);
					}
				})(i);
			}
			var selectedRequestId = $.map($scope.siGrid.$gridScope.selectedItems, function(v, i) {
				return v.SORequestId;
			});
			var data = averageDistribute(
				selectedGroupIds,
				selectedRequestId,
				$scope.siGrid.$gridScope.selectedItems.length.toString() + ' SO can\'t be dispatched to ' + selectedGroupIds.length.toString() + ' groups. Please select again.');

			return data;
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
					alert(alertInfo);
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
				alert('Fail to load data. Please try it again, thanks.' + data + status);
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
			remark: null
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
				alert('Executable files can\' be uploaded.');
				$scope.uploader.attachment = null;
			}
		}

		$scope.openWorkFlowDialog = function() {
			$scope.uploader.attachment = null;
			$scope.uploader.progressbar = 0;
			$scope.uploader.percentage = null;
			prepareWorkFlowBaseInfo();
			$('#workflowDialog').modal('show');
		}

		$scope.addWorkFlow = function() {
			if ($scope.uploader.attachment && $scope.uploader.attachment != '') {
				$scope.uploadAttachmentWithWorkFlowInfo(function() {
					alert('Save successfully.');
					getOwnWorkFlow($scope.currentSORequest.SORequestId, function(err, result) {
						if (err) {
							alert('Fail to fetch work flow.' + err);
						} else {
							for (var i = result.length; i--;) {
								result[i].OperateTime = $.format.date(result[i].OperateTime, 'yyyy-MM-dd HH:mm:ss');
							}
							$scope.currentSORequest.workflow = result;
						}
					});
					$('#workflowDialog').modal('hide');
				}, function(data, status) {
					alert('Fail to save.' + data + status);
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
					alert('Success.')
					getOwnWorkFlow($scope.currentSORequest.SORequestId, function(err, result) {
						if (err) {
							alert('Fail to fetch work flow.' + err);
						} else {
							for (var i = result.length; i--;) {
								result[i].OperateTime = $.format.date(result[i].OperateTime, 'yyyy-MM-dd HH:mm:ss');
							}
							$scope.currentSORequest.workflow = result;
						}
					});
					$('#workflowDialog').modal('hide');
				}).error(function(data, status) {
					alert(data + status);
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

		function getCurrentSORequestAssignedUserIds() {
			var assignedUserIds = [];
			var isDuplicate = {};
			angular.forEach($scope.currentSORequest.workflow, function(v, i) {
				if (v.SubPackageId && v.SubPackageId == '') {
					if (!isDuplicate.hasOwnProperty(v.ExecuteeId.toString())) {
						assignedUser.push(v.ExecuteeId);
						isDuplicate[v.ExecuteeId.toString()] = 'ADDED';
					}
				}
			});
			return assignedUserIds;
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

	})