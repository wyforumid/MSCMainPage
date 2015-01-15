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
					if (data.length == 0) {
						alert('No result.');
						return;
					}

					$scope.searchingResult = data;

					copySearchingResultToFilterResult();

					analyseSearchingResult();


				} else {
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
			//$scope.siGrid.selectAll(false);
			//$('#soMainCheckbox').trigger('click'); //.attr('checked',false);
			//$('#soMainCheckbox').attr('checked', false);
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
			LoadSODetails(requestId, function(data) {}, function(data, status) {
				alert('Fail to load data. Please try it again, thanks.' + data + status);
			})

		}

		$scope.bakcToList = function() {
			setInputterFullColumns();
			$scope.listDivClass = true;
			$scope.detailDivClass = false;
		}


		$scope.test = function() {
			//alert($scope.userInfo.permission.canFinish);
		}

		function LoadSODetails(requestId, successCb, errorCb) {
			for (var i = $scope.filterResult.length; i--;) {
				if ($scope.filterResult[i].SORequestId != requestId) {
					continue;
				}
				$scope.currentSORequest = $scope.filterResult[i];
				if ($scope.currentSORequest.hasOwnProperty('workflow') && $scope.currentSORequest.workflow.length > 0) {
					successCb($scope.currentSORequest.workflow);
					return;
				}
				async.parallel([
					function(callback) {
						// $http({
						// 	method: 'GET',
						// 	url: '/restfulAPI/so/GETSOWORKFLOW',
						// 	params: {
						// 		id: requestId
						// 	},
						// 	cache: false
						// }).success(function(data, status) {
						// 	callback(null, data);
						// }).error(function(data, status) {
						// 	callback(data + status, null);
						// });
						getOwnWorkFlow(requestId, callback);
					},
					function(callback) {
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
					},
					function(callback) {
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
				], function(err, results) {
					if (err) {
						//alert('Please re-click the requestId to reload the data.' + err);
						errorCb(null, err);
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
					$scope.currentSORequest.workflow = results[0];
					$scope.currentSORequest.baseInfo = results[1][0];
					$scope.currentSORequest.bookings = results[2];
					successCb();
				})


			}
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
			type: null, //,
			// Job: null,
			remark: null,
			// soRequestId: $scope.currentSORequest.SORequestId
			// unassignJob: null,
			// newassignJob: null
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

		// function workFlowDialog_setUserCanChosen() {
		// 	var assignUsers = $scope.workFlowBaseInfo.assignedUsers = [];
		// 	var isDuplicate = {};
		// 	angular.forEach($scope.currentSORequest.workflow, function(v, i) {
		// 		if (!v.SubPackageId || v.SubPackageId == '') {
		// 			assignUsers.push({
		// 				id: v.SOJobPackageId,
		// 				name: 'Everyone'
		// 			});
		// 		} else if (!isDuplicate.hasOwnProperty(v.SubPackageId.toString())) {
		// 			assignUsers.push({
		// 				id: v.SOJobPackageId,
		// 				name: v.Executee
		// 			});
		// 			isDuplicate[v.SubPackageId.toString()] = 'ADDED';
		// 		}
		// 	});

		// 	if (assignUsers.length == 1) {
		// 		$scope.newWorkFlow.Job = assignUsers[0];
		// 	}
		// }

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