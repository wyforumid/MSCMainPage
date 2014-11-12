angular.module('selfPermissionCtrls', ['selfServices'])
.controller('permissionGroupCtrl', function($scope, fundationService, $http) {
	$('#navTab a').click(function(e) {
		e.preventDefault();
		$('#navTab a:last').tab('show');
	});

	$scope.currentStep = 1;

	$scope.company = {
		offices: [],
		depts: []
	};

	$scope.newGroup = {
		addedDepts: [],
		addedDeptsChanged: false,
		groupName: '',
		addedRoles:[]
	};
	$scope.existedGroupNames = [];
		$scope.selectedOffice = {};
		$scope.selectedDept = {};
		$scope.newRoleName ='';

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

		$scope.addDept = function() {
			if ($scope.selectedOffice && $scope.selectedDept && $scope.selectedOffice.id && $scope.selectedDept.id) {
				var isExisted = false;
				$.each($scope.newGroup.addedDepts, function(i, v) {
					if (v.office.id == $scope.selectedOffice.id && v.dept.id == $scope.selectedDept.id) {
						isExisted = true;
						return false;
					}
				});

				if (isExisted) {
					alert('This department is already selected.');
					return;
				}

				$scope.newGroup.addedDepts.push({
					office: {
						id: $scope.selectedOffice.id,
						name: $scope.selectedOffice.name
					},
					dept: {
						id: $scope.selectedDept.id,
						name: $scope.selectedDept.name
					}
				});
				$scope.newGroup.addedDeptsChanged = true;
			} else {
				alert('Please select office and department first.');
			}
		}

		$scope.addRoleName = function(){
			if($scope.newRoleName == ''){
				alert('The role name is null.');
				return;
			}
			var isExisted = false;
			$.each($scope.newGroup.addedRoles,function(i,v){
				if(v.name.toUpperCase() == $scope.newRoleName.toUpperCase()){					
					isExisted = true;
					return false;
				}
			});
			if(isExisted){
				alert('The role of \'' + $scope.newRoleName + '\' is already existed.');
				return;
			}

			$scope.newGroup.addedRoles.push({
				name:$scope.newRoleName,
				permission:[]
			});
			$scope.newRoleName = '';
		}

		$scope.minusDept = function(index) {
			if ($scope.newGroup.addedDepts && $scope.newGroup.addedDepts.length >= index) {
				$scope.newGroup.addedDepts.splice(index, 1);
				$scope.newGroup.addedDeptsChanged = true;
			} else {
				alert('Something is wrong. Please reset it and start over.');
			}
		}

		$scope.minusRole = function(index){
			if($scope.newGroup.addedRoles && $scope.newGroup.addedRoles.length >= index){
				$scope.newGroup.addedRoles.splice(index,1);
			}else{
				alert('Something is wrong. Please reset it and start over.');
			}
		}

		$scope.pre = function() {
			initialStepCSS(--$scope.currentStep);
		}

		$scope.next = function() {
			if (validateStep($scope.currentStep)) {
				initialStepCSS(++$scope.currentStep);
			}

		}

		$scope.checkExistedName = function() {
			if($scope.newGroup.groupName == ''){
				return false;
			}
			if (!$scope.newGroup.addedDeptsChanged) {
				isExistedName();
			} else {
				$http({
					method: 'GET',
					url: '/API/permission/CONCERNEDGROUPNAMES',
					cache: false,
					params: {info : JSON.stringify($scope.newGroup.addedDepts)} //JSON.stringify($scope.addedDepts)
				}).success(function(data, status) {
					$scope.existedGroupNames = data;
					$scope.newGroup.addedDeptsChanged = false;
					isExistedName();
				}).error(function(data, status) {
					alert(data);
				});
			}
		}

		function isExistedName(){
			var isExisted = false;
			$.each($scope.existedGroupNames, function(i, v) {
					if (v.GroupName.toUpperCase() == $scope.newGroup.groupName.toUpperCase()) {
						$('#newGroupNameDiv').addClass('has-error').addClass('has-feedback');
						$('#newGroupNameDiv span').show();
						$('div[class*="alert"]').show();
						isExisted = true;
						return false;
					}
				});
			if(!isExisted){
				$('#newGroupNameDiv').removeClass('has-error').removeClass('has-feedback');
				$('#newGroupNameDiv span').hide();
				$('div[class*="alert"]').hide();
			}
			return isExisted;
			
		}


		function initialStepCSS(stepNo) {
			switch (stepNo) {
				case 1:
				$('#preBtn').prop('disabled', true);
				$('#nextBtn').prop('disabled', false);
				break;
				case 2:
				initialStep2CSS();
				case 3:
				$('#preBtn').prop('disabled', false);
				$('#nextBtn').prop('disabled', false);
				break;
				case 4:
				$('#preBtn').prop('disabled', false);
				$('#nextBtn').prop('disabled', true);
				break;
			}
			var i = 1,
			distance = 0;
			while (i <= 4) {
				distance = stepNo - i;
				if (distance > 0) {
					$('#newgroup-step-' + i.toString()).removeClass('current').removeClass('next').removeClass('nnext').addClass('passed');
					$('#step' + i.toString() + 'Container').hide();
				} else if (distance == 0) {
					$('#newgroup-step-' + i.toString()).removeClass('passed').removeClass('next').removeClass('nnext').addClass('current');
					$('#step' + i.toString() + 'Container').show();
				} else if (distance == -1) {
					$('#newgroup-step-' + i.toString()).removeClass('passed').removeClass('current').removeClass('nnext').addClass('next');
					$('#step' + i.toString() + 'Container').hide();
				} else {
					$('#newgroup-step-' + i.toString()).removeClass('passed').removeClass('current').removeClass('next').addClass('nnext');
					$('#step' + i.toString() + 'Container').hide();
				}
				i++;
			}
		}

		function initialStep2CSS() {
			$('#newGroupNameDiv').removeClass('has-error').removeClass('has-feedback');
			$('#newGroupNameDiv span').hide();
			$('div[class*="alert"]').hide();
		}

		function validateStep(stepNo) {
			switch (stepNo) {
				case 1:
				return validateSelectedDepts();
				case 2:
				return validateGroupInfo();
				case 3:
				return validateRolePermission();
				case 4:
				return finalValidate();
				default:
				return false;

			}
		}

		function validateSelectedDepts() {
			if ($scope.newGroup.addedDepts && $scope.newGroup.addedDepts.length > 0) {
				return true;
			} else {
				alert('You need add some depertment which this new group belongs to.');
				return false;
			}
		}

		function validateGroupInfo() {
			var isValidate = true,
				msg = 'Something wrong. Please check these point: ';
			if($scope.newGroup.groupName == ''){
				isValidate = false;
				msg += ' ~the group name is neccessary for new group.';
			}
			if(isExistedName()){
				isValidate = false;
				msg +='  ~the group name is existed.';
			}
			if($scope.newGroup.addedRoles.length == 0){
				isValidate = false;
				msg +=' ~the role is neccessary for new group.';
			}
			if(!isValidate){
				alert(msg);
			}
			return isValidate;

		}

		function validateRolePermission() {
			return true;
		}

		function finalValidate() {
			return true;
		}

		function Test(step){
			$scope.newGroup = {
					addedDepts: [
						{
							office: {id:19,name:'kc'},
							dept: {id:4,name:'IT'}
						}
					],
					addedDeptsChanged: true,
					groupName: '',
					addedRoles:[
						{
							name:'Manager',
							permission:[]
						},
						{
							name:'programmer',
							permission:[]
						}
					]
			};

			$scope.currentStep = step;
		}

		Test(3)

		initialStepCSS($scope.currentStep);


	});