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
			groupName: ''
		};
		$scope.existedGroupNames = [];
		//$scope.addedDepts = [];
		$scope.selectedOffice = {};
		$scope.selectedDept = {};

		fundationService.getAllOffices(
			function(data) {
				$scope.company.offices = data;
			},
			function(data, status) {
				alert('Fail to fetch offices.');
			}
		);

		fundationService.getAllDepts(
			function(data) {
				$scope.company.depts = data;
			},
			function(data, status) {
				alert('Fail to fetch departments.');
			}
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

		$scope.minus = function(index) {
			if ($scope.newGroup.addedDepts && $scope.newGroup.addedDepts.length >= index) {
				$scope.newGroup.addedDepts.splice(index, 1);
				$scope.newGroup.addedDeptsChanged = true;
			} else {
				alert('Something is wrong. Please reset it and start over.')
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

		$scope.isExistedName = function() {
			if (!$scope.newGroup.addedDeptsChanged) {
				$.each($scope.existedGroupNames, function(i, v) {
					if (v == $scope.newGroup.groupName) {
						$('#newGroupNameDiv').addClass('has-error').addClass('has-feedback');
						$('#newGroupNameDiv span').show();
					}
				});
			} else {
				$http({
					method: 'GET',
					url: '/API/permission/CONTAINGOUPNAMES',
					cache: false,
					params: JSON.stringify($scope.addedDepts)
				}).success(function(status, data) {

				}).error(function(status, data) {

				});
			}
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
			return true;
		}

		function validateRolePermission() {
			return true;
		}

		function finalValidate() {
			return true;
		}

		initialStepCSS($scope.currentStep);
	});