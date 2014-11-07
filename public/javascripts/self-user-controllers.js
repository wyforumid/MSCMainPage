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
			alert(data);
		}).error(function(data,status){
			alert(data);
		})
	}

	function initialCSS(){
		$('div[class*=form-group]').removeClass('has-error').removeClass('has-feedback');
		$('span').hide();
	}

	function showfeedbackCSS(errInfo){
		
	}

	initialCSS();
})