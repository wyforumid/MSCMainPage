angular.module('selfControllers', ['selfServices'])
	.controller('UserCtrl', function($scope, fundationService, $http) {
		$scope.registUserInfo = {
			fullName: '',
			email: '',
			loginName: '',
			//password:'',
			office: {
				id: -1,
				name: ''
			},
			dept: {
				id: -1,
				name: ''
			}
		};
		$scope.company = {
			offices: [],
			depts: []
		};
		$scope.feedbackInfo = [];

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


		$scope.$watch('registUserInfo.email', function(nV, oV) {
			$scope.registUserInfo.loginName = $scope.registUserInfo.email.replace(/@\S*/i, '');
		});

		$scope.registUser = function() {
			$('#registBtn').prop('disabled', true);
			$scope.feedbackInfo = [];
			initialCSS();

			if (!checkEssentialInfo()) {
				return;
			}

			$http({
				method: 'POST',
				url: '/API/user',
				data: $scope.registUserInfo
			}).success(function(data, status) {
				//alert(data);
				$('#registBtn').prop('disabled', false);
				if (data && data[0]) {
					feedbackRegistPage(data[0].info);
				} else {

				}
			}).error(function(data, status) {
				$('#registBtn').prop('disabled', false);
				alert(data);
			});
		}


		function checkEssentialInfo() {
			var msg = 'You need enter these informations: '
			isValid = true;
			if (!$scope.registUserInfo.fullName) {
				isValid = false;
				msg += 'full name, ';
			}
			if (!$scope.registUserInfo.loginName) {
				isValid = false;
				msg += 'login name, ';
			}
			if (!$scope.registUserInfo.email) {
				isValid = false;
				msg += 'email, ';
			}
			if (!$scope.registUserInfo.office || $scope.registUserInfo.office.id == -1) {
				isValid = false;
				msg += 'office,';
			}
			if (!$scope.registUserInfo.dept || $scope.registUserInfo.dept.id == -1) {
				isValid = false;
				msg += 'department.';
			}
			if (!isValid) {
				alert(msg);
			}
			return isValid;

		}

		function feedbackRegistPage(msg) {
			if (msg == '') {
				alert('Regist user successfully. The password will be sent to ' + $scope.registUserInfo.email + 'in 1 minuts.');
				return;
			}

			if (msg.indexOf('login name') != -1) {
				feedbackDiv('loginNameInput');
			}
			if (msg.indexOf('email') != -1) {
				feedbackDiv('emailInput');
			}
			if (msg.indexOf('office') != -1) {
				feedbackDiv('officeSelect');
			}
			if (msg.indexOf('department') != -1) {
				feedbackDiv('deptSelect');
			}
			if (msg && msg.length != 0) {
				msg = msg.substr(0, msg.length - 1);
				$scope.feedbackInfo = msg.split(';');
				if ($scope.feedbackInfo.length != 0) {
					$('#errorZone').show();
				} else {
					$('#errorZone').hide();
				}
			}


		}

		function feedbackDiv(id) {
			$('#' + id).addClass('has-error').addClass('has-feedback');
			$('#' + id + ' span').show();
		}

		function initialCSS() {
			$('div[class*=form-group]').removeClass('has-error').removeClass('has-feedback');
			$('span').hide();
			$('#errorZone').hide();
		}

		function showfeedbackCSS(errInfo) {

		}

		initialCSS();
	})
	.controller('UserForgotPassowrdCtrl', function($scope) {

		$scope.email = "";

		$scope.resetPassword = function(email) {
			
			
			
		};

	});
