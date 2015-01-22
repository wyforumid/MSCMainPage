angular.module('selfPermissionCtrls', ['selfServices', 'selfDirectives', 'ui.select', 'selfFilters'])
	.controller('permissionGroupCtrl', function($scope, fundationService, $http, $filter, $rootScope) {


		var Group = function() {};


		Group.prototype = {
			setGroupName: function(name) {
				this.groupName = name;
			},
			addOfficeAndDepartment: function(selectedOffice, selectedDept) {

				this.officeAndDepartments.push({
					office: {
						id: selectedOffice.id,
						name: selectedOffice.name
					},
					dept: {
						id: selectedDept.id,
						name: selectedDept.name
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
			}
		};

		var CreateGroup = function() {

			this.addManagerRole = function() {
				this.roles.push({
					id: this.managerRoleId,
					name: "Manager",
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


			this.addSubmitUser = function(index) {
				if (!this.checkUserIsExists(this.searchUsers[index], this.submitUsers)) {
					this.searchUsers[index].roles = {};
					this.submitUsers.push(this.searchUsers[index]);
				}
			}


			this.deleteSubmitUser = function(index, count) {
				this.submitUsers.splice(index, 1);
			}

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

						if ($scope.createGroup.officeAndDepartments && $scope.createGroup.officeAndDepartments.length > 0) {
							return true;
						} else {
							alert('You need add some depertment which this new group belongs to.');
							return false;
						}

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

						if ($scope.createGroup.groupName == '') {
							isValidate = false;
							msg += ' ~the group name is neccessary for new group.';
						}

						if ($scope.steps.isExistedName()) {
							isValidate = false;
							msg += '  ~the group name is existed.';
						}

						if ($scope.createGroup.roles.length <= 1) {
							isValidate = false;
							msg += ' ~the role is neccessary for new group.';
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
							});

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

						for (var i = $scope.createGroup.submitUsers.length; i--;) {

							for (var j = $scope.createGroup.submitUsers[i].roles.length; j--;) {

								if ($scope.createGroup.HasRole($scope.createGroup.submitUsers[i].roles[j])) {
									$scope.createGroup.submitUsers[i].roles.splice(j, 1);
								}
							}
						}
					},
					validateBeforeNext: function() {

						for (var i = $scope.createGroup.submitUsers.length; i--;) {

							if ($scope.createGroup.submitUsers[i].roles.length <= 0) {
								alert($scope.createGroup.submitUsers[i].fullName + " has not been set role.");
								return false;
							}

						}

						return true;
					},
					formatData: function() {

						$scope.createGroup.submitGroup = {
							name: $scope.createGroup.groupName,
							departmentGroup: [],
							roles: []
						}

						for (var i = $scope.createGroup.officeAndDepartments.length; i--;) {

							$scope.createGroup.submitGroup.departmentGroup.push({
								officeId: $scope.createGroup.officeAndDepartments[i].office.id,
								departmentId: $scope.createGroup.officeAndDepartments[i].dept.id
							});

						}


						for (var i = $scope.createGroup.roles.length; i--;) {

							var role = {
								name: $scope.createGroup.roles[i].name,
								userIds: [],
								permissionIds: []
							}

							if ($scope.createGroup.roles[i].editCurrentGroup.isEdit) {
								role.permissionIds.push($scope.createGroup.managerRoleId);
							}

							for (var j = $scope.createGroup.roles[i].permission.length; j--;) {
								for (var k = $scope.createGroup.roles[i].permission[j].permissions.length; k--;) {
									if ($scope.createGroup.roles[i].permission[j].permissions[k].checked) {
										role.permissionIds.push($scope.createGroup.roles[i].permission[j].permissions[k].id);
									}
								}
							}


							for (var j = $scope.createGroup.submitUsers.length; j--;) {
								for (var k = $scope.createGroup.submitUsers[j].roles.length; k--;) {
									if ($scope.createGroup.submitUsers[j].roles[k] === role.name) {
										role.userIds.push($scope.createGroup.submitUsers[j].userId);
									}
								}
							}

							$scope.createGroup.submitGroup.roles.push(role);
						}


						for (var i = $scope.createGroup.submitGroup.roles.length; i--;) {

							if ($scope.createGroup.submitGroup.roles[i].name === "Manager" && 
								!$scope.createGroup.IsIncludeManagerId($scope.createGroup.submitGroup.roles[i].permissionIds)) {
								$scope.createGroup.submitGroup.roles[i].permissionIds.push($scope.createGroup.managerRoleId);



							}

							if ($scope.createGroup.submitGroup.roles[i].name === "Manager" && 
								!$scope.createGroup.IsIncludeOriginUserId($scope.createGroup.submitGroup.roles[i].userIds)) {
								$scope.createGroup.submitGroup.roles[i].userIds.push($rootScope.userInfo.userId);
							}
						}

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

						$scope.steps.isSubmitting = true;
						$scope.steps.list[currentStepString].formatData();
						console.log($scope.createGroup.submitGroup);


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

		$scope.searchUserByOfficeAndDepartment_create = function(office, department) {

			$scope.createGroup.searchUserByOfficeAndDepartment(office, department, function(data) {
				$scope.createGroup.searchUsers = data;
			});

		}

		function initialSelectedRolePermission() {

			if ($scope.createGroup.roles[$scope.selectedRoleIndex]) {
				$scope.permissionInfo.displayedPermission = $scope.createGroup.roles[$scope.selectedRoleIndex].permission;

				$.each($scope.createGroup.roles, function(i, v) {

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

			if ($scope.createGroup.roles[$scope.selectedRoleIndex]) {
				$scope.permissionInfo.editCurrentGroup = $scope.createGroup.roles[$scope.selectedRoleIndex].editCurrentGroup;
			}
		}

		$scope.changedPermissionCount = function(value) {

			if (!$scope.createGroup.roles[$scope.selectedRoleIndex].hasOwnProperty('selectedCount')) {
				$scope.createGroup.roles[$scope.selectedRoleIndex].selectedCount = 0;
			}

			if (value) {
				$scope.createGroup.roles[$scope.selectedRoleIndex].selectedCount++;
			} else {
				$scope.createGroup.roles[$scope.selectedRoleIndex].selectedCount--;
			}

		}

		$('#navTab a').click(function(e) {
			e.preventDefault();
			$('#navTab a:last').tab('show');
		});

		$scope.currentStep = 0;

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

				$.each($scope.createGroup.roles, function(i, v) {
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


		$scope.addOfficeAndDepartment_create = function() {

			if ($scope.createGroup.hasSelectedOffice($scope.selectedOffice) && $scope.createGroup.hasSelectedDept($scope.selectedDept)) {

				if ($scope.createGroup.hasDepartment($scope.selectedOffice, $scope.selectedDept)) {
					alert('This department is already selected.');
				} else {

					$scope.createGroup.addOfficeAndDepartment($scope.selectedOffice, $scope.selectedDept);
				}

			} else {
				alert('Please select office and department first.');
			}

		}

		$scope.removeOfficeAndDepartment_create = function(index) {

			if ($scope.createGroup.officeAndDepartments && $scope.createGroup.officeAndDepartments.length >= index) {
				$scope.createGroup.removeOfficeAndDepartment(index, 1);
			} else {
				alert('Something is wrong. Please reset it and start over.');
			}
		}

		$scope.addRole_create = function() {

			if ($scope.createGroup.isNullOrEmptyByNewRoleName()) {
				alert("The role name is null");
				return;
			}

			if ($scope.createGroup.hasRoleByNewRoleName()) {
				alert('The role of \'' + $scope.createGroup.newRoleName + '\' is already existed.');
				return;
			}

			$scope.createGroup.addRole({
				name: $scope.createGroup.newRoleName,
				editCurrentGroup: {
					isEdit: false,
					isDisabled: false
				},
				permission: []
			});

			$scope.createGroup.newRoleName = "";
		}

		$scope.removeRole_create = function(index) {

			if ($scope.createGroup.roles && $scope.createGroup.roles.length >= index) {
				$scope.createGroup.removeRole(index, 1);
			} else {
				alert('Something is wrong. Please reset it and start over.');
			}
		}

		$scope.steps.initialStep();


		/*------------------------------------------------------------------------------------------*/
		/*-----------------------------------------Maintain-----------------------------------------*/
		/*------------------------------------------------------------------------------------------*/

		$scope.displayMaintainGroup = {
			groupList: [{
				id: 1,
				name: "Administrator"
			}, {
				id: 2,
				name: "G1"
			}, {
				id: 3,
				name: "G1R1-trzhou"
			}],
			currentSelectGroup: {},
			officeAndDepartment: [],
			roles: []
		}

		// $scope.submitModifyGroup = {
		// 	group: {
		// 		id: 1,
		// 		name: ""
		// 	},
		// 	officeAndDepartment: {
		// 		add: [],
		// 		del: []
		// 	}
		// }

		$scope.originModifyData = {
			group: {},
			officeAndDepartment: [],
			roles: []
		}


		function clearData() {

			$scope.displayMaintainGroup.currentSelectGroup = {};
			$scope.displayMaintainGroup.officeAndDepartment = [];
			$scope.displayMaintainGroup.roles = [];

			$scope.originModifyData.group = {};
			$scope.originModifyData.officeAndDepartment = [];
			$scope.originModifyData.roles = [];

		}

		$scope.changeSelectGroup = function(group) {

			for (var i = $scope.displayMaintainGroup.groupList.length; i--;) {
				$scope.displayMaintainGroup.groupList[i].select = false;
			}

			if (group.enable) {

				clearData();

				group.select = true;

				$.extend(true, $scope.displayMaintainGroup.currentSelectGroup, group);
				$.extend(true, $scope.originModifyData.group, group);

				$http({
					method: 'GET',
					url: '/restfulAPI/permission/GROUPRELATION',
					cache: false,
					params: {
						groupId: group.id
					}
				}).success(function(data, status) {

					if (data && data.length > 0) {

						for (var i = data[0].length; i--;) {

							$scope.originModifyData.officeAndDepartment.push({
								id: data[0][i].id,
								office: {
									id: data[0][i].officeId,
									name: data[0][i].officeName
								},
								dept: {
									id: data[0][i].departmentId,
									name: data[0][i].departmentName
								}
							});

							$scope.displayMaintainGroup.officeAndDepartment.push({
								id: data[0][i].id,
								office: {
									id: data[0][i].officeId,
									name: data[0][i].officeName
								},
								dept: {
									id: data[0][i].departmentId,
									name: data[0][i].departmentName
								}
							});
						}


						for (var i = data[1].length; i--;) {

							$scope.originModifyData.roles.push({
								id: data[1][i].roleId,
								name: data[1][i].roleName
							});

							$scope.displayMaintainGroup.roles.push({
								id: data[1][i].roleId,
								name: data[1][i].roleName
							});
						}
					}

				}).error(function(data, status) {
					alert(data);
				});

			} else {
				$scope.displayMaintainGroup.currentSelectGroup = {};
				// $scope.submitModifyGroup.group = {};
			}

		}

		$scope.addDepartment = function() {
			if ($scope.selectedOffice && $scope.selectedDept && $scope.selectedOffice.id && $scope.selectedDept.id) {
				var isExisted = false;
				$.each($scope.displayMaintainGroup.officeAndDepartment, function(i, v) {
					if (v.office.id == $scope.selectedOffice.id && v.dept.id == $scope.selectedDept.id) {
						isExisted = true;
						return false;
					}
				});

				if (isExisted) {
					alert('This department is already selected.');
					return;
				}

				addDeptData({
					id: $scope.selectedOffice.id,
					name: $scope.selectedOffice.name
				}, {
					id: $scope.selectedDept.id,
					name: $scope.selectedDept.name
				});

			} else {
				alert("Please select office and department first.");
			}
		}

		$scope.minusDepartment = function(index) {
			if ($scope.displayMaintainGroup.officeAndDepartment && $scope.displayMaintainGroup.officeAndDepartment.length >= index) {
				delDeptData(index);
			} else {
				alert('Something is wrong. Please reset it and start over.');
			}
		}

		//function/////////////////////////////////////////////////////////////////////

		function addDeptData(office, deparment) {

			$scope.displayMaintainGroup.officeAndDepartment.push({
				office: office,
				dept: deparment
			});


			// $.extend(true, $scope.submitModifyGroup.officeAndDepartment.add, $scope.displayMaintainGroup.officeAndDepartment);

			// for (var i = $scope.submitModifyGroup.officeAndDepartment.add.length; i--;) {
			// 	if ($scope.submitModifyGroup.officeAndDepartment.add[i].id) {
			// 		$scope.submitModifyGroup.officeAndDepartment.add.splice(i, 1);
			// 	}
			// }


		}



		function delDeptData(index) {
			var delDept = $scope.displayMaintainGroup.officeAndDepartment[index];

			// if (delDept.id) {
			// 	$scope.submitModifyGroup.officeAndDepartment.del.push(delDept);
			// }

			$scope.displayMaintainGroup.officeAndDepartment.splice(index, 1);
		}


		// $scope.$watch('displayMaintainGroup.officeAndDepartment.length', function(nV, oV) {

		// 	console.log("nV => ", nV)
		// 	console.log("oV => ", oV)
		// });

		$('a[data-toggle="tab"]').on('show.bs.tab', function(e) {

			if (e.currentTarget.outerText === "Maintain") {

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