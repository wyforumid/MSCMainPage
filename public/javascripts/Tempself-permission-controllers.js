angular.module('selfPermissionCtrls', ['selfServices', 'selfDirectives', 'ui.select', 'selfFilters', 'selfRootController'])
	.controller('permissionGroupCtrl', function($scope, fundationService, $http, $filter, $rootScope, $q) {

		$scope.currentStatus = "C";

		function getCurrentGroup() {

			var currentGroup;

			if ($scope.currentStatus == "C") {
				currentGroup = $scope.createGroup;
			} else if ($scope.currentStatus == "M") {
				currentGroup = $scope.modifyGroup;
			}

			return currentGroup;
		}

		var Group = function() {};


		Group.prototype = {
			setGroupName: function(name) {
				this.groupName = name;
			},
			addOfficeAndDepartment: function(office, dept) {

				this.officeAndDepartments.push({
					office: {
						id: office.id,
						name: office.name
					},
					dept: {
						id: dept.id,
						name: dept.name
					}
				});

			},
			removeOfficeAndDepartment: function(index, count) {

				this.officeAndDepartments.splice(index, count);
			},
			addRole: function(role) {
				this.roles.push(role);
			},
			removeRole: function(index, count) {
				this.roles.splice(index, count);
			},
			hasManagerRole: function() {

				for (var i = this.roles.length; i--;) {
					if (this.roles[i].name === "Manager") {
						return true;
					}
				}

				return false;
			},
			hasSelectedOffice: function(selectedOffice) {
				return (selectedOffice && selectedOffice.id);
			},
			hasSelectedDept: function(selectedDept) {
				return (selectedDept && selectedDept.id);
			},
			hasDepartment: function(selectedOffice, selectedDept) {

				for (var i = this.officeAndDepartments.length; i--;) {
					if (this.officeAndDepartments[i].office.id == selectedOffice.id && this.officeAndDepartments[i].dept.id == selectedDept.id) {
						return true;
					}
				}

				return false;
			},
			HasRole: function(role) {

				for (var k = this.roles.length; k--;) {
					if (this.roles[k].name.toUpperCase() === role.toUpperCase()) {
						return true;
					}
				}

				return false;
			},
			isNullOrEmpty: function(strValue) {

				if (!strValue) {
					return true;
				}

				if (strValue == '') {
					return true;
				}

				return false;
			},
			searchUserByOfficeAndDepartment: function(office, department, callback) {
				$http({
					method: 'GET',
					url: '/restfulAPI/permission/SEARCHUSERBYOFFICEANDDEPARTMENT',
					params: {
						officeId: office.id,
						departmentId: department.id
					}
				}).success(function(data, status) {
					callback(data);
				}).error(function(data, status) {
					alert(data);
				});
			},
			checkUserIsExists: function(user, checkUserList) {
				for (var i = checkUserList.length - 1; i >= 0; i--) {
					if (checkUserList[i].userId == user.userId) {
						return true;
					}
				}

				return false;
			},
			addSubmitUser: function(index) {
				if (!this.checkUserIsExists(this.searchUsers[index], this.submitUsers)) {
					this.searchUsers[index].roles = {};
					this.submitUsers.push(this.searchUsers[index]);
				}
			},
			deleteSubmitUser: function(index) {
				this.submitUsers.splice(index, 1);
			},
			hasOfficeAndDepartmentsData: function() {

				if (this.officeAndDepartments && this.officeAndDepartments.length > 0) {
					return true;
				} 

				return false;
			},
			CheckhasSetRole: function () {

				if (this.submitUsers.length <= 0) {
					return false;
				}

				for (var i = this.submitUsers.length; i--;) {

					if (this.submitUsers[i].roles.length <= 0) {
						return false;
					}
				}

				return true;
			}
		};

		var CreateGroup = function() {

			this.addManagerRole = function() {
				this.roles.push({
					id: this.managerRoleId,
					name: "Manager",
					isCheckedDispatch: false,
					editCurrentGroup: {
						isEdit: true,
						isDisabled: true
					},
					permission: []
				});
			}

			this.isNullOrEmptyByNewRoleName = function() {

				return this.isNullOrEmpty(this.newRoleName);
			}

			this.hasRoleByNewRoleName = function() {

				return this.HasRole(this.newRoleName);
			}

			this.IsIncludeManagerId = function(permissionIds) {
				for (var i = permissionIds.length; i--;) {
					if (permissionIds[i] == this.managerRoleId) {
						return true;
					}
				}

				return false;
			}

			this.IsIncludeOriginUserId = function(userIds) {
				for (var i = userIds.length; i--;) {
					if (userIds[i] == $rootScope.userInfo.userId) {
						return true;
					}
				}

				return false;
			}


			// this.addSubmitUser = function(index) {
			// 	if (!this.checkUserIsExists(this.searchUsers[index], this.submitUsers)) {
			// 		this.searchUsers[index].roles = {};
			// 		this.submitUsers.push(this.searchUsers[index]);
			// 	}
			// }


			// this.deleteSubmitUser = function(index, count) {
			// 	this.submitUsers.splice(index, 1);
			// }

			this.managerRoleId = -999;
			this.newRoleName = "";

			this.groupName = "";
			this.officeAndDepartments = [];
			this.roles = [];

			this.searchUsers = [];
			this.submitUsers = [];

			// this.submitGroup = {
			// 	name: this.groupName,
			// 	departmentGroup: [],
			// 	roles: []
			// }
		};

		var ModifyGroup = function() {

			this.isChanged = false;
			this.group = {};
			this.newRoleName = "";
			this.officeAndDepartments = [];
			this.roles = [];
			this.permissions = [];
			this.searchUsers = [];
			this.submitUsers = [];

			this.origin = {
				group: {},
				officeAndDepartments: [],
				roles: [],
				permissions: [],
				submitUsers: []
			}


		};

		CreateGroup.prototype = new Group();
		$scope.createGroup = new CreateGroup();



		$scope.steps = {
			currentStep: 1,
			list: {
				1: {
					isShow: false,
					initialCSS: function() {
						$scope.steps.initialStepCSS();
						//initialStepCSS();
					},
					initialData: function() {

						if (!$scope.createGroup.hasManagerRole()) {
							$scope.createGroup.addManagerRole();
						}

						fundationService.getAllOffices(
							function(data) {
								$scope.company.offices = data;
							},
							function(data, status) {
								alert('Fail to fetch offices.');
							},
							false
						);

						fundationService.getAllDepts(
							function(data) {
								$scope.company.depts = data;
							},
							function(data, status) {
								alert('Fail to fetch departments.');
							},
							false
						);

					},
					validateBeforeNext: function() {

						var isValidate = $scope.createGroup.hasOfficeAndDepartmentsData()

						if (!isValidate) {
							alert('You need add some depertment which this new group belongs to.');
						}
						
						return isValidate;

						// if ($scope.createGroup.officeAndDepartments && $scope.createGroup.officeAndDepartments.length > 0) {
						// 	return true;
						// } else {
						// 	alert('You need add some depertment which this new group belongs to.');
						// 	return false;
						// }

					},
					formatData: function() {

					}
				},
				2: {
					isShow: false,
					initialCSS: function() {
						$scope.steps.initialStepCSS();
					},
					initialData: function() {

						$http({
							method: 'GET',
							url: '/restfulAPI/permission/CONCERNEDGROUPNAMES',
							cache: false,
							params: {
								info: JSON.stringify($scope.createGroup.officeAndDepartments)
							}
						}).success(function(data, status) {

							if (data) {
								$scope.steps.existedGroupNames = data;
							} else {
								$scope.steps.existedGroupNames = [];
							}

						}).error(function(data, status) {
							alert(data);
						});

					},
					validateBeforeNext: function() {

						var isValidate = true,
							msg = 'Something wrong. Please check these point: ';

						if ($scope.createGroup.isNullOrEmpty($scope.createGroup.groupName)) {
							isValidate = false;
							msg += ' ~the group name is neccessary for new group.';
						}
						
						// if ($scope.createGroup.groupName == '') {
						// 	isValidate = false;
						// 	msg += ' ~the group name is neccessary for new group.';
						// }

						if ($scope.steps.isExistedName()) {
							isValidate = false;
							msg += '  ~the group name is existed.';
						}

						if (!isValidate) {
							alert(msg);
						}

						return isValidate;
					},
					formatData: function() {}
				},
				3: {
					isShow: false,
					initialCSS: function() {
						$scope.steps.initialStepCSS();
					},
					initialData: function() {
						initialAllPermission();
						$scope.showSelectedRolePermission(0);
					},
					validateBeforeNext: function() {
						return true;
					},
					formatData: function() {}
				},
				4: {
					isShow: false,
					initialCSS: function() {
						$scope.steps.initialStepCSS();
					},
					initialData: function() {

						recheckSubmitUsers($scope.createGroup);
					},
					validateBeforeNext: function() {

						var isValidate = $scope.createGroup.CheckhasSetRole();

						if (!isValidate) {
							alert("May not add users or not set roles for users");
						}

						return isValidate;


						// for (var i = $scope.createGroup.submitUsers.length; i--;) {

						// 	if ($scope.createGroup.submitUsers[i].roles.length <= 0) {
						// 		alert($scope.createGroup.submitUsers[i].fullName + " has not been set role.");
						// 		return false;
						// 	}

						// }

						// return true;
					},
					formatData: function() {

						var currentGroup = getCurrentGroup();

						currentGroup.submitGroup = {
							name: currentGroup.groupName,
							departmentGroup: [],
							roles: []
						}

						setSubmitGroup(currentGroup);
					}
				}
			},
			existedGroupNames: [],
			isSubmitting: false,
			isExistedName: function() {
				var isExisted = false;

				$.each(this.existedGroupNames, function(i, v) {
					if (v.GroupName.toUpperCase() == $scope.createGroup.groupName.toUpperCase()) {
						isExisted = true;
						return false;
					}
				});

				return isExisted;
			},
			initialStep: function(stepNo) {

				if (!stepNo) {
					stepNo = 1;
				}

				var initStep = this.list[stepNo.toString()];
				initStep.initialCSS();
				initStep.initialData();
				initStep.formatData();
			},
			initialStepCSS: function() {

				switch (this.currentStep) {
					case 1:
						this.preStep.disabled = true;
						this.nextStep.disabled = false;
						this.preStep.text = "pre step";
						this.nextStep.text = "next step";
						break;
					case 2:
						this.preStep.disabled = false;
						this.nextStep.disabled = false;
						this.preStep.text = "pre step";
						this.nextStep.text = "next step";
						break;
					case 3:
						this.preStep.disabled = false;
						this.nextStep.disabled = false;
						this.preStep.text = "pre step";
						this.nextStep.text = "next step";
						break;
					case 4:
						this.preStep.disabled = false;
						this.nextStep.disabled = false;
						this.preStep.text = "pre step";
						this.nextStep.text = "Finish";
						break;
				}

				var i = 1;
				for (item in this.list) {

					if (i == this.currentStep) {
						this.list[item].isShow = true;
					} else {
						this.list[item].isShow = false;
					}

					i++;
				}

			},
			preStep: {
				text: "pre step",
				disabled: true,
				pre: function() {
					if ($scope.steps.currentStep > 1) {
						--$scope.steps.currentStep;
						$scope.steps.list[$scope.steps.currentStep.toString()].initialCSS();
					}
				}
			},
			nextStep: {
				text: "next step",
				disabled: false,
				next: function() {

					var currentStepString = $scope.steps.currentStep.toString();

					if ($scope.steps.currentStep < 4 && $scope.steps.list[currentStepString].validateBeforeNext()) {

						$scope.steps.list[currentStepString].formatData();

						var nextStepString = (++$scope.steps.currentStep).toString();

						$scope.steps.list[nextStepString].initialCSS();
						$scope.steps.list[nextStepString].initialData();


					} else if ($scope.steps.currentStep == 4 && $scope.steps.list[currentStepString].validateBeforeNext()) {

						$scope.steps.list[currentStepString].formatData();
						$scope.steps.isSubmitting = true;


						$http({

							method: 'POST',
							url: '/restfulAPI/permission/ADDGROUP',
							cache: false,
							data: {
								newGroup: $scope.createGroup.submitGroup
							}

						}).success(function(data, status) {
							alert(data[0].message);
							$scope.steps.isSubmitting = false;
						}).error(function(data, status) {
							alert(data);
							$scope.steps.isSubmitting = false;
						});
					}


				}
			}
		};


		$scope.showSelectedRolePermission = function(index) {

			$scope.selectedRoleIndex = index;

			initialSelectedRolePermission();
			initialCanEditCurrentGroup();
		}


		$scope.searchUserByOfficeAndDepartment = function(office, department) {

			var currentGroup = getCurrentGroup();

			currentGroup.searchUserByOfficeAndDepartment(office, department, function(data) {
				currentGroup.searchUsers = data;
			});
		}


		function initialSelectedRolePermission() {

			var currentGroup = getCurrentGroup();

			if (currentGroup.roles[$scope.selectedRoleIndex]) {

				$scope.permissionInfo.displayedPermission = currentGroup.roles[$scope.selectedRoleIndex].permission;

				$.each(currentGroup.roles, function(i, v) {

					if (i != $scope.selectedRoleIndex) {
						v.edit = false;
					} else {
						v.edit = true;
					}

				});

			} else {
				$scope.selectedRoleIndex = 0;
			}

		}

		function initialCanEditCurrentGroup() {

			var currentGroup = getCurrentGroup();

			if (currentGroup.roles[$scope.selectedRoleIndex]) {
				$scope.permissionInfo.editCurrentGroup = currentGroup.roles[$scope.selectedRoleIndex].editCurrentGroup;
			}
		}

		$scope.changedPermissionCount = function(permission) {

			var currentGroup = getCurrentGroup();

			if (!currentGroup.roles[$scope.selectedRoleIndex].hasOwnProperty('selectedCount')) {
				currentGroup.roles[$scope.selectedRoleIndex].selectedCount = 0;
			}

			if (permission.checked) {
				currentGroup.roles[$scope.selectedRoleIndex].selectedCount++;
				currentGroup.roles[$scope.selectedRoleIndex].isCheckedDispatch = true;
			} else {
				currentGroup.roles[$scope.selectedRoleIndex].selectedCount--;
				currentGroup.roles[$scope.selectedRoleIndex].isCheckedDispatch = false;
			}
		}

		$('#navTab a').click(function(e) {
			e.preventDefault();
			$('#navTab a:last').tab('show');
		});

		// $scope.currentStep = 0;

		$scope.company = {
			offices: [],
			depts: []
		};


		$scope.permissionInfo = {
			// displayedPermissionSelectedCount : 0,
			originPermissions: [],
			originCategories: [],
			categoriedPermission: [],
			editCurrentGroup: {},
			displayedPermission: [],
			ownPermissions: [],
			categoringPermission: function() {
				$scope.permissionInfo.categoriedPermission = [];
				$.each($scope.permissionInfo.originCategories, function(ci, cv) {
					$scope.permissionInfo.categoriedPermission.push({
						isHide: (cv.id == 1),
						categoryId: cv.id,
						categoryName: cv.name,
						permissions: []
					});
					var theOne = $scope.permissionInfo.categoriedPermission[$scope.permissionInfo.categoriedPermission.length - 1].permissions;

					$.each($scope.permissionInfo.originPermissions, function(pi, pv) {

						if (pv.categoryId == cv.id) {

							theOne.push({
								id: pv.id,
								name: pv.name,
								description: pv.description,
								disabled: $scope.permissionInfo.ownPermissions.indexOf(1) != -1 ? false : ($scope.permissionInfo.ownPermissions.indexOf(pv.id) == -1),
								checked: false
							});

						}

					});
				});

				$scope.permissionInfo.displayedPermission = $scope.permissionInfo.categoriedPermission;

				var currentGroup = getCurrentGroup();

				$.each(currentGroup.roles, function(i, v) {
					if (v.permission && v.permission.length > 0) {
						return true;
					} else {
						v.permission = copyCategoryPermission();

					}
				});
			}
		}

		function copyCategoryPermission() {
			var temp = [];
			$.each($scope.permissionInfo.categoriedPermission, function(ci, cv) {
				temp.push({
					isHide: cv.isHide,
					categoryId: cv.categoryId,
					categoryName: cv.categoryName,
					permissions: []
				});
				var theOne = temp[temp.length - 1];
				$.each(cv.permissions, function(pi, pv) {
					theOne.permissions.push({
						id: pv.id,
						name: pv.name,
						description: pv.description,
						disabled: pv.disabled,
						checked: pv.checked
					});
				});
			});
			return temp;
		}


		$scope.addOfficeAndDepartment = function() {

			var currentGroup = getCurrentGroup();

			if (currentGroup.hasSelectedOffice($scope.selectedOffice) && currentGroup.hasSelectedDept($scope.selectedDept)) {

				if (currentGroup.hasDepartment($scope.selectedOffice, $scope.selectedDept)) {
					alert('This department is already selected.');
				} else {
					currentGroup.addOfficeAndDepartment($scope.selectedOffice, $scope.selectedDept);
				}

			} else {
				alert('Please select office and department first.');
			}
		}



		$scope.removeOfficeAndDepartment = function(index) {

			var currentGroup = getCurrentGroup();

			if (currentGroup.officeAndDepartments && currentGroup.officeAndDepartments.length >= index) {
				currentGroup.removeOfficeAndDepartment(index, 1);
			} else {
				alert('Something is wrong. Please reset it and start over.');
			}
		}


		$scope.addRole = function() {

			var currentGroup = getCurrentGroup();

			if (currentGroup.isNullOrEmpty(currentGroup.newRoleName)) {
				alert("The role name is null");
				return;
			}

			if (currentGroup.HasRole(currentGroup.newRoleName)) {
				alert('The role of \'' + currentGroup.newRoleName + '\' is already existed.');
				return;
			}

			currentGroup.addRole({
				name: currentGroup.newRoleName,
				isCheckedDispatch: false,
				editCurrentGroup: {
					isEdit: false,
					isDisabled: false
				},
				permission: []
			});

			currentGroup.newRoleName = "";

			if ($scope.currentStatus == "M") {
				var currentGroup = getCurrentGroup();

				$.each(currentGroup.roles, function(i, v) {
					if (v.permission && v.permission.length > 0) {
						return true;
					} else {
						v.permission = copyCategoryPermission();
					}

				});
			}

		}

		$scope.removeRole = function(index) {

			var currentGroup = getCurrentGroup();

			if (currentGroup.roles && currentGroup.roles.length >= index) {
				currentGroup.removeRole(index, 1);

				if ($scope.currentStatus == "M") {
					recheckSubmitUsers(currentGroup);
				}

			} else {
				alert('Something is wrong. Please reset it and start over.');
			}
		}

		$scope.addSubmitUser = function(index) {

			var currentGroup = getCurrentGroup();
			currentGroup.addSubmitUser(index);
		}

		$scope.deleteSubmitUser = function(index) {
			var currentGroup = getCurrentGroup();
			currentGroup.deleteSubmitUser(index);
		}


		$scope.steps.initialStep();


		function recheckSubmitUsers(currentGroup) {

			for (var i = currentGroup.submitUsers.length; i--;) {

				for (var j = currentGroup.submitUsers[i].roles.length; j--;) {

					if (!currentGroup.HasRole(currentGroup.submitUsers[i].roles[j])) {
						currentGroup.submitUsers[i].roles.splice(j, 1);
					}
				}
			}
		}

		function initialAllPermission() {
			async.parallel([
					function(callback) {
						fundationService.getAllPermissions(
							function(data) {
								$scope.permissionInfo.originPermissions = data;
								callback(null, data);
							},
							function(data, status) {
								alert('Fail to fetch all permissions.');
								callback(data, status);
							},
							false
						);
					},
					function(callback) {
						fundationService.getAllPermissionCategories(
							function(data) {
								$scope.permissionInfo.originCategories = data;
								callback(null, data);
							},
							function(data, status) {
								alert('Fail to fetch all categories.');
								callback(data, status);
							},
							false
						);
					},
					function(callback) {
						$http({
							method: 'GET',
							url: '/restfulAPI/permission/OWNPERMISSIONS',
							cache: false,
							params: {
								id: $rootScope.userInfo.userId
							},

						}).success(function(data, status) {
							$scope.permissionInfo.ownPermissions = $.map(data, function(v, i) {
								return v.PermissionId;
							});
							callback(null, data);
						}).error(function(data, status) {
							alert('Fail to fetch your own permissions.');
							callback(data, status);
						});
					}
				],
				function(err, results) {
					if (err) {
						alert('Loading data is error. Please pre and then next to this step again.');
					} else {
						$scope.permissionInfo.categoringPermission();
						$scope.selectedRoleIndex = 0;
						initialSelectedRolePermission();
					}

					if ($scope.currentStatus == "M") {
						initialPermission();
						$.extend(true, $scope.modifyGroup.group, $scope.displayMaintainGroup.currentSelectGroup);
						$.extend(true, $scope.modifyGroup.origin.group, $scope.displayMaintainGroup.currentSelectGroup);
						$.extend(true, $scope.modifyGroup.origin.officeAndDepartments, $scope.modifyGroup.officeAndDepartments);
						$.extend(true, $scope.modifyGroup.origin.roles, $scope.modifyGroup.roles);
						$.extend(true, $scope.modifyGroup.origin.submitUsers, $scope.modifyGroup.submitUsers);
					}

					

				});
		}

		function setSubmitGroup(currentGroup) {

			for (var i = currentGroup.officeAndDepartments.length; i--;) {

				currentGroup.submitGroup.departmentGroup.push({
					officeId: currentGroup.officeAndDepartments[i].office.id,
					departmentId: currentGroup.officeAndDepartments[i].dept.id
				});

			}


			for (var i = currentGroup.roles.length; i--;) {

				var role = {
					name: currentGroup.roles[i].name,
					userIds: [],
					permissionIds: []
				}

				if (currentGroup.roles[i].editCurrentGroup.isEdit) {
					role.permissionIds.push(currentGroup.managerRoleId);
				}

				for (var j = currentGroup.roles[i].permission.length; j--;) {
					for (var k = currentGroup.roles[i].permission[j].permissions.length; k--;) {
						if (currentGroup.roles[i].permission[j].permissions[k].checked) {
							role.permissionIds.push(currentGroup.roles[i].permission[j].permissions[k].id);
						}
					}
				}


				for (var j = currentGroup.submitUsers.length; j--;) {
					for (var k = currentGroup.submitUsers[j].roles.length; k--;) {
						if (currentGroup.submitUsers[j].roles[k] === role.name) {
							role.userIds.push(currentGroup.submitUsers[j].userId);
						}
					}
				}

				currentGroup.submitGroup.roles.push(role);
			}


			for (var i = currentGroup.submitGroup.roles.length; i--;) {

				if (currentGroup.IsIncludeManagerId && typeof(currentGroup.IsIncludeManagerId == "function")) {
					if (currentGroup.submitGroup.roles[i].name === "Manager" &&
						!currentGroup.IsIncludeManagerId(currentGroup.submitGroup.roles[i].permissionIds)) {
						currentGroup.submitGroup.roles[i].permissionIds.push(currentGroup.managerRoleId);
					}
				}

				if (currentGroup.IsIncludeOriginUserId && typeof(currentGroup.IsIncludeOriginUserId == "function")) {
					if (currentGroup.submitGroup.roles[i].name === "Manager" &&
						!currentGroup.IsIncludeOriginUserId(currentGroup.submitGroup.roles[i].userIds)) {
						currentGroup.submitGroup.roles[i].userIds.push($rootScope.userInfo.userId);
					}
				}

			}

		}

		/*------------------------------------------------------------------------------------------*/
		/*-----------------------------------------Maintain-----------------------------------------*/
		/*------------------------------------------------------------------------------------------*/



		ModifyGroup.prototype = new Group();
		//$scope.modifyGroup = new ModifyGroup();

		$scope.displayMaintainGroup = {
			groupList: [],
			currentSelectGroup: {}
		}


		function clearData() {

			$scope.displayMaintainGroup.currentSelectGroup = {};

		}

		function resetGroupSetting() {
			for (var i = $scope.displayMaintainGroup.groupList.length; i--;) {
				$scope.displayMaintainGroup.groupList[i].select = false;
			}
		}

		$scope.changeSelectGroup = function(group) {

			loadSelectedGroupRelation(group);
		}

		function loadSelectedGroupRelation(group) {
			if (group.enable) {

				//$rootScope.loadingShow("Loading the group information.");

				resetGroupSetting();
				clearData();
				group.select = true;
				$.extend(true, $scope.displayMaintainGroup.currentSelectGroup, group);

				$scope.modifyGroup = new ModifyGroup();
				getAllRelation($scope.displayMaintainGroup.currentSelectGroup, initialModifyData);
				initialAllPermission();
			}
		}

		function initialPermission() {
			var currentGroup = getCurrentGroup();

			$.each(currentGroup.roles, function(roleIndex, v) {

				var tempRole = v;

				if (v.permission && v.permission.length > 0) {
					$.each(v.permission, function(categoryIndex, c) {
						$.each(c.permissions, function(permissionIndex, p) {
							$.each($scope.modifyGroup.permissions, function(mpIndex, mp) {

								if (mp.roleId == tempRole.id && mp.permissionId == p.id) {
									p.checked = true;
									return true;
								}

							});
						});

					});
				}

			});

		}

		function initialModifyData(data, status) {

			for (var i = data[0].length; i--;) {
				$scope.modifyGroup.addOfficeAndDepartment({
					id: data[0][i].officeId,
					name: data[0][i].officeName
				}, {
					id: data[0][i].departmentId,
					name: data[0][i].departmentName
				});
			}

			for (var i = data[1].length; i--;) {

				$scope.modifyGroup.addRole({
					id: data[1][i].roleId,
					name: data[1][i].roleName,
					isCheckedDispatch: false,
					editCurrentGroup: {
						isEdit: false,
						isDisabled: false
					},
					permission: []
				});

			}


			for (var i = data[2].length; i--;) {

				$scope.modifyGroup.permissions.push(data[2][i]);
				$scope.modifyGroup.origin.permissions.push(data[2][i]);
			}


			for (var i = data[4].length; i--;) {
				data[4][i].roles = [];
				$scope.modifyGroup.submitUsers.push(data[4][i]);
			}

			for (var i = data[3].length; i--;) {
				for (var j = $scope.modifyGroup.submitUsers.length; j--;) {
					if (data[3][i].userId == $scope.modifyGroup.submitUsers[j].userId) {
						$scope.modifyGroup.submitUsers[j].roles.push(data[3][i].roleName);
					}
				}
			}


			$.extend(true, $scope.modifyGroup.group, $scope.displayMaintainGroup.currentSelectGroup);
			$.extend(true, $scope.modifyGroup.origin.group, $scope.displayMaintainGroup.currentSelectGroup);
			$.extend(true, $scope.modifyGroup.origin.officeAndDepartments, $scope.modifyGroup.officeAndDepartments);
			$.extend(true, $scope.modifyGroup.origin.roles, $scope.modifyGroup.roles);
			$.extend(true, $scope.modifyGroup.origin.submitUsers, $scope.modifyGroup.submitUsers);
		}
		
		function arrangeOfficeAndDepartments(originOfficeAndDepartments, compareOfficeAndDepartments) {
			for (var i = originOfficeAndDepartments.length; i--;) {
				for (var j = compareOfficeAndDepartments.length; j--;) {

					if (!originOfficeAndDepartments[i] || !compareOfficeAndDepartments[j]) {
						break;
					}

					if (originOfficeAndDepartments[i].office.id == compareOfficeAndDepartments[j].office.id &&
						originOfficeAndDepartments[i].dept.id == compareOfficeAndDepartments[j].dept.id) {
						originOfficeAndDepartments.splice(i, 1);
						compareOfficeAndDepartments.splice(j, 1);
					}
				}
			}

			return [ originOfficeAndDepartments, compareOfficeAndDepartments ];
		}

		function arrangeRoles(origineRoles, compareRoles) {
			for (var i = origineRoles.length; i--;) {
				for (var j = compareRoles.length; j--;) {
					if (!origineRoles[i] || !compareRoles[j]) {
						break;
					}

					if (origineRoles[i].name == compareRoles[j].name) {
						origineRoles.splice(i, 1);
						compareRoles.splice(j, 1);
					}
				}
			}

			for (var i = origineRoles.length; i--;) {
				origineRoles[i].permission = [];
			}

			for (var i = compareRoles.length; i--;) {
				compareRoles[i].permission = [];
			}


			return [ origineRoles, compareRoles ];
		}

		function arrangeRolesPermissions() {
			origineRolesPermissions = getCheckedPermission($scope.modifyGroup.origin.roles);
			compareRolesPermissions = getCheckedPermission($scope.modifyGroup.roles);

			for (var i = origineRolesPermissions.length; i--;) {
				for (var j = compareRolesPermissions.length; j--;) {
					if (origineRolesPermissions[i].name == compareRolesPermissions[j].name) {

						for (var k = origineRolesPermissions[i].permissionIds.length; k--;) {
							for (var l = compareRolesPermissions[j].permissionIds.length; l--;) {

								if (!origineRolesPermissions[i].permissionIds[k] || !compareRolesPermissions[j].permissionIds[l]) {
									break;
								}

								if (origineRolesPermissions[i].permissionIds[k] == compareRolesPermissions[j].permissionIds[l]) {
									origineRolesPermissions[i].permissionIds.splice(k, 1);
									compareRolesPermissions[j].permissionIds.splice(l, 1);
								}

							}
						}
					}
				}
			}

			return [ origineRolesPermissions, compareRolesPermissions ];
		}

		function arrangeRolesUserIds(originSubmitUsers, compareSubmitUsers) {
			var tempOriginUserIds = [], tempCompareUserIds = [];

			for (var i = $scope.modifyGroup.roles.length; i--;) {

				var tempRole = {
					name: $scope.modifyGroup.roles[i].name,
					userIds: []
				}

				tempOriginUserIds.push(tempRole);
			}

			$.extend(true, tempCompareUserIds, tempOriginUserIds);

			for (var i = tempOriginUserIds.length; i--;) {
				for (var k = originSubmitUsers.length; k--;) {
					for (var j = originSubmitUsers[k].roles.length; j--;) {
						if (originSubmitUsers[k].roles[j] == tempOriginUserIds[i].name) {
							tempOriginUserIds[i].userIds.push(originSubmitUsers[k].userId);
						}
					}
				}
			}

			for (var i = tempCompareUserIds.length; i--;) {
				for (var k = compareSubmitUsers.length; k--;) {
					for (var j = compareSubmitUsers[k].roles.length; j--;) {
						if (compareSubmitUsers[k].roles[j] == tempCompareUserIds[i].name) {
							tempCompareUserIds[i].userIds.push(compareSubmitUsers[k].userId);
						}
					}
				}
			}

			for (var i = tempOriginUserIds.length; i--;) {
				for (var j = tempCompareUserIds.length; j--;) {
					if (tempOriginUserIds[i].name == tempCompareUserIds[j].name) {
						for (var k = tempOriginUserIds[i].userIds.length; k--;) {
							for (var l = tempCompareUserIds[j].userIds.length; l--;) {
								if (tempOriginUserIds[i].userIds[k] == tempCompareUserIds[j].userIds[l]) {
									tempOriginUserIds[i].userIds.splice(k,1);
									tempCompareUserIds[j].userIds.splice(l,1);
								}
							}
						}
					}
				}
			}

			return [ tempOriginUserIds, tempCompareUserIds ];
		}

		function setSubmitModifyData() {

			var currentGroup = getCurrentGroup();

			var originOfficeAndDepartments = [],
				origineRoles = [], 
				origineRolesPermissions = [],
				originSubmitUsers = [];

			var compareOfficeAndDepartments = [],
				compareRoles = [], 
				compareRolesPermissions = [],
				compareSubmitUsers = [];

			$.extend(true, originOfficeAndDepartments, $scope.modifyGroup.origin.officeAndDepartments);
			$.extend(true, origineRoles, $scope.modifyGroup.origin.roles);
			$.extend(true, originSubmitUsers, $scope.modifyGroup.origin.submitUsers);

			$.extend(true, compareOfficeAndDepartments, $scope.modifyGroup.officeAndDepartments);
			$.extend(true, compareRoles, $scope.modifyGroup.roles);
			$.extend(true, compareSubmitUsers, $scope.modifyGroup.submitUsers);

			var tempOfficeAndDepartments = arrangeOfficeAndDepartments(originOfficeAndDepartments, compareOfficeAndDepartments);
			originOfficeAndDepartments = tempOfficeAndDepartments[0];
			compareOfficeAndDepartments = tempOfficeAndDepartments[1];

			var tempRoles = arrangeRoles(origineRoles, compareRoles);
			origineRoles = tempRoles[0];
			compareRoles = tempRoles[1];

			var tempRolesPermissions = arrangeRolesPermissions();
			origineRolesPermissions = tempRolesPermissions[0];
			compareRolesPermissions = tempRolesPermissions[1];

			var tempSubmitUsers = arrangeRolesUserIds(originSubmitUsers, compareSubmitUsers);
			var tempOriginUserIds = [], tempCompareUserIds = [];
			tempOriginUserIds = tempSubmitUsers[0];
			tempCompareUserIds = tempSubmitUsers[1];

			$scope.modifyGroup.submitGroup = {
				groupId: currentGroup.group.id,
				groupName: currentGroup.group.name,
				deleteOfficeAndDepartments:[],
				addOfficeAndDepartments:[],
				deleteRoles:[],
				addRoles:[],
				deleteRolePermissions:[],
				addRolePermissions:[],
				deleteSubmitUsers:[],
				addSubmitUser:[]
			}

			$.extend(true, $scope.modifyGroup.submitUsers.groupId, currentGroup.group.id);
			$.extend(true, $scope.modifyGroup.submitUsers.groupName, currentGroup.group.name);
			$scope.modifyGroup.submitGroup.deleteOfficeAndDepartments = originOfficeAndDepartments;
			$scope.modifyGroup.submitGroup.addOfficeAndDepartments = compareOfficeAndDepartments;
			$scope.modifyGroup.submitGroup.deleteRoles = origineRoles;
			$scope.modifyGroup.submitGroup.addRoles = compareRoles;
			$scope.modifyGroup.submitGroup.deleteRolePermissions = origineRolesPermissions;
			$scope.modifyGroup.submitGroup.addRolePermissions = compareRolesPermissions;
			$scope.modifyGroup.submitGroup.deleteSubmitUsers = tempOriginUserIds;
			$scope.modifyGroup.submitGroup.addSubmitUser = tempCompareUserIds;
		}

		$scope.submitModifyData = function() {

			$rootScope.loadingShow("loading...");

			if (modifySubmitCheck()) {

				setSubmitModifyData();

				$http({

					method: 'POST',
					url: '/restfulAPI/permission/MODIFYGROUP',
					cache: false,
					data: {
						userId: $rootScope.userInfo.userId,
						modifyGroup: $scope.modifyGroup.submitGroup
					}

				}).success(function(data, status) {
					$rootScope.loadingHide();
					$rootScope.successAlert(data[0].message);
					// alert(data[0].message);
					//window.location = '/main#/Permission';
					//loadSelectedGroupRelation($scope.displayMaintainGroup.currentSelectGroup);
				}).error(function(data, status) {
					// alert(data);
					$rootScope.loadingHide();
					$rootScope.dangerAlert(data);
				});
			}

		}

		function modifySubmitCheck() {

			if (!$scope.modifyGroup.hasOfficeAndDepartmentsData()) {
				alert('You need add some depertment which this new group belongs to.');
				return false;
			}

			if ($scope.modifyGroup.isNullOrEmpty($scope.modifyGroup.group.name)) {
				alert('The group name is neccessary, please enter group name.');
				return false;
			}

			if (!$scope.modifyGroup.CheckhasSetRole()) {
				alert("May not add users or not set roles for users.");
				return false;
			}

			return true;
		}

		function getCheckedPermission(roles) {

			var roleList = [];

			for (var i = roles.length; i--;) {

				var role = { name: roles[i].name, permissionIds: [] };

				for (var j = roles[i].permission.length; j--;) {
					for (var k = roles[i].permission[j].permissions.length ; k--;) {

						if (roles[i].permission[j].permissions[k].checked) {
							role.permissionIds.push(roles[i].permission[j].permissions[k].id);
						}
					}
				}

				roleList.push(role);
			}

			return roleList;

		}


		function getAllRelation(group, callback) {

			$http({
				method: 'GET',
				url: '/restfulAPI/permission/GROUPRELATION',
				cache: false,
				params: {
					groupId: group.id,
					userId: $rootScope.userInfo.userId
				}
			}).success(function(data, status) {

				callback(data, status);

			}).error(function(data, status) {
				alert(data);
			});
		}



		$('a[data-toggle="tab"]').on('show.bs.tab', function(e) {

			if (e.currentTarget.outerText === "Maintain") {

				$scope.currentStatus = "M";

				$http({
					method: 'GET',
					url: '/restfulAPI/permission/GROUPLISTBYUSERID',
					cache: false,
					params: {
						userId: $rootScope.userInfo.userId
					}
				}).success(function(data, status) {
					$scope.displayMaintainGroup.groupList = data;
				}).error(function(data, status) {
					alert(data);
				});

			} else {
				$scope.currentStatus = "C";
			}

		});



	}).controller('permissionCtrl', function($scope, fundationService, $http, $filter) {


		$scope.permissionCategories = [];
		$scope.permissions = [];

		$scope.selectPermissionCategory = {
			id: 0
		};
		$scope.searchPermission = [];
		$scope.permissionAction = {
			title: "",
			model: "",
			buttonText: "",
			permissionModel: {}
		};
		$scope.formStyle = {
			addCategory: {
				submitting: function() {
					$scope.formStyle.addCategory.submitButtonText = "Add...";
					$scope.formStyle.addCategory.isSubmitting = true;
				},
				submitted: function() {
					$scope.formStyle.addCategory.submitButtonText = "Add";
					$scope.formStyle.addCategory.isSubmitting = false;
				},
				feedbackMessage: "",
				submitButtonText: "Add",
				isSubmitting: false
			},
			permission: {
				initial: function(model, permission) {

					$scope.formStyle.permission.model = model;

					switch ($scope.formStyle.permission.model) {
						case "add":
							$scope.formStyle.permission.title = "Add Permission";
							$scope.formStyle.permission.submitButtonText = "Submit";
							$scope.formStyle.permission.permissionModel = {};
							break;
						case "edit":
							$scope.formStyle.permission.title = "Edit Permission";
							$scope.formStyle.permission.submitButtonText = "Save changes";
							$scope.formStyle.permission.permissionModel = $.extend(true, {}, permission);
							$scope.formStyle.permission.permissionModelOrigin = permission;
							break;
					}
				},
				submitting: function() {
					switch ($scope.formStyle.permission.model) {
						case "add":
							$scope.formStyle.permission.submitButtonText = "Submit...";
							$scope.formStyle.permission.isSubmitting = true;
							break;
						case "edit":
							$scope.formStyle.permission.submitButtonText = "Save changes...";
							$scope.formStyle.permission.isSubmitting = true;
							break;
					}
				},
				submitted: function() {
					switch ($scope.formStyle.permission.model) {
						case "add":
							$scope.formStyle.permission.submitButtonText = "Submit";
							$scope.formStyle.permission.isSubmitting = false;
							break;
						case "edit":
							$scope.formStyle.permission.submitButtonText = "Save changes";
							$scope.formStyle.permission.isSubmitting = false;
							break;
					}
				},
				submit: function() {

					switch ($scope.formStyle.permission.model) {
						case "add":
							$scope.formStyle.permission.submitting();
							$http({
								method: 'POST',
								url: '/restfulAPI/permission/ADDPERMISSION',
								cache: false,
								data: {
									addPermission: $scope.formStyle.permission.permissionModel
								}
							}).success(function(data, status) {

								if (!data[0].hasOwnProperty("key")) {
									loadAllPermissions(true);
								}

								$scope.formStyle.permission.feedbackResult = data[0].key;
								$scope.formStyle.permission.feedbackMessage = data[0].message;

								$scope.formStyle.permission.submitted();

							}).error(function(data, status) {
								alert(data);
								$scope.formStyle.permission.submitted();
							});
							break;
						case "edit":
							$scope.formStyle.permission.submitting();
							$http({
								method: 'POST',
								url: '/restfulAPI/permission/MODIFYPERMISSION',
								cache: false,
								data: {
									modifyPermission: $scope.formStyle.permission.permissionModel
								}
							}).success(function(data, status) {

								if (data[0].key) {
									for (var property in $scope.formStyle.permission.permissionModel) {
										if ($scope.formStyle.permission.permissionModelOrigin.hasOwnProperty(property)) {
											$scope.formStyle.permission.permissionModelOrigin[property] = $scope.formStyle.permission.permissionModel[property];
										}
									}
								}

								$scope.formStyle.permission.feedbackResult = data[0].key;
								$scope.formStyle.permission.feedbackMessage = data[0].message;
								$scope.formStyle.permission.submitted();

							}).error(function(data, status) {
								alert(data);
								$scope.formStyle.permission.submitted();
							});

							break;
					}
				},
				model: "",
				title: "",
				submitButtonText: "",
				feedbackResult: false,
				feedbackMessage: "",
				isSubmitting: false,
				permissionModel: {},
				permissionModelOrigin: {}
			}
		};


		loadAllPermissionCategories(false);
		loadAllPermissions(false);

		function loadAllPermissions(forceRefresh) {
			fundationService.getAllPermissions(
				function(data) {
					$scope.permissions = data;
				},
				function(data, status) {
					alert('Fail to fetch all permissions.');
				}, forceRefresh);
		}

		function loadAllPermissionCategories(forceRefresh) {
			fundationService.getAllPermissionCategories(
				function(data) {
					$scope.permissionCategories = data;
				},
				function(data, status) {
					alert('Fail to fetch PermissionCategories.');
				}, forceRefresh);
		}

		$scope.changeCategoryInput = function() {
			$scope.formStyle.addCategory.feedbackMessage = "";
		}

		$scope.permissionAction = function(model, permission) {
			$('#myModal').modal('show');
			$scope.formStyle.permission.feedbackMessage = null;
			$scope.permissionForm.$setPristine();
			$scope.formStyle.permission.initial(model, permission);
		}

		$scope.permissionActionSubmit = function() {
			$scope.formStyle.permission.feedbackMessage = null;
			$scope.formStyle.permission.submit();
		};


		$scope.AddCategory = function() {

			$scope.formStyle.addCategory.submitting();

			$http({

				method: 'POST',
				url: '/restfulAPI/permission/ADDCATEGORY',
				cache: false,
				data: {
					categoryName: $scope.CategoryName,
					categoryDescription: $scope.CategoryDescription
				}

			}).success(function(data, status) {
				$scope.formStyle.addCategory.submitted();

				if (data[0].hasOwnProperty('info')) {
					$scope.formStyle.addCategory.feedbackMessage = data[0].info;
				} else {
					$scope.formStyle.addCategory.feedbackMessage = "";
					$scope.permissionCategories.push(data[0]);
					alert("successful");
				}

			}).error(function(data, status) {
				alert(data);
			});

		}

	});