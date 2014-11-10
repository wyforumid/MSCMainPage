angular.module('selfControllers',['selfServices'])
.controller('UserCtrl',function($scope,fundationService,$http){
	$scope.registUserInfo = {
		fullName:'',
		email:'',
		loginName:'',
		//password:'',
		office:{id:-1,name:''},
		dept:{id:-1,name:''}
	};
	$scope.company = {
		offices:[],
		depts:[]
	}

	fundationService.getAllOffices(
		function(data){
			$scope.company.offices = data;
		},
		function(data,status){
			alert('Fail to fetch offices.');
		}
		);
	
	fundationService.getAllDepts(
		function(data){
			$scope.company.depts = data;
		},
		function(data,status){
			alert('Fail to fetch departments.');
		}
		);
	

	$scope.$watch('registUserInfo.email',function(nV,oV){
		$scope.registUserInfo.loginName = $scope.registUserInfo.email.replace(/@\S*/i,'');
	});

	$scope.registUser = function(){
		$http({
			method:'POST',
			url:'/API/user',
			data:$scope.registUserInfo
		}).success(function(data,status){
			//alert(data);
			if(data && data[0]){
				feedbackRegistPage(data[0].info);
			}else{

			}
		}).error(function(data,status){
			alert(data);
		})
	}

	function feedbackRegistPage(msg){
		if(data[0].info=''){
			alert('Regist user successfully. The password will be sent to ' + $scope.registUserInfo.email + 'in 1 minuts.');
			return;
		}

		var str = data[0].info;
		if(str.indexOf('login name') != -1){
			feedbackDiv('loginNameInput');
		}
		if(str.indexOf('email') != -1){
			feedbackDiv('emailInput');
		}
		if(str.indexOf('office') != -1){
			feedbackDiv('officeSelect');
		}
		if(str.indexOf('department') != -1){
			feedbackDiv('deptSelect');
		}

	}

	function feedbackDiv(id){
		$('#' + id).addClass('has-error').addClass('has-feedback');
		$('#' + id + ' span').show();
	}

	function initialCSS(){
		$('div[class*=form-group]').removeClass('has-error').removeClass('has-feedback');
		$('span').hide();
	}

	function showfeedbackCSS(errInfo){
		
	}

	initialCSS();
})