angular.module('selfControllers',[])
.controller('UserCtrl',function($scope){
	$scope.registUser = {
		fullName:'',
		email:'',
		loginName:'',
		password:'',
		office:{id:-1,name:''},
		dept:{id:-1,name:''}
	};

	$scope.$watch('registUser.email',function(nV,oV){
		if(nV){
			registUser.loginName = registUser.email.replace(/@\S+/i,'');
		}
	});
})