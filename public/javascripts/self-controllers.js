angular.module('selfControllers',['toggle-switch'])
.controller('SICtrl',function($scope){
	$scope.searchingResult = [];
	$scope.filterResult = [];
	$scope.analyseResult = {};
	$scope.searchCondition = {BookingNo:[]};
	$scope.tableHeight = '600px';
	$scope.zoneStatus = true;

	


	function loadTestData(){
		$scope.searchingResult = [
		{BookingNo:'18100000000000001',BLNo:'000001', Vessel:'Vessel01', Voyage:'Voyage06', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'2014-10-05', Inputter:'Jason', PartBillNo:'2'},
		{BookingNo:'18100000000000002',BLNo:'000002', Vessel:'Vessel02', Voyage:'Voyage07', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'2014-10-05', Inputter:'Jason', PartBillNo:'2'},
		{BookingNo:'18100000000000003',BLNo:'000003', Vessel:'Vessel01', Voyage:'Voyage07', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Manual',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'2014-10-05', Inputter:'Jason', PartBillNo:'2'},
		{BookingNo:'18100000000000004',BLNo:'000004', Vessel:'Vessel03', Voyage:'Voyage08', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'2014-10-05', Inputter:'Jason', PartBillNo:'2'},
		{BookingNo:'18100000000000005',BLNo:'000005', Vessel:'Vessel04', Voyage:'Voyage09', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'2014-10-05', Inputter:'Jason', PartBillNo:'2'},
		{BookingNo:'18100000000000006',BLNo:'000006', Vessel:'Vessel01', Voyage:'Voyage06', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'2014-10-05', Inputter:'Jason', PartBillNo:'2'},
		{BookingNo:'18100000000000007',BLNo:'000007', Vessel:'Vessel05', Voyage:'Voyage07', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'2014-10-05', Inputter:'Jason', PartBillNo:'2'},
		{BookingNo:'18100000000000008',BLNo:'000008', Vessel:'Vessel01', Voyage:'Voyage08', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Manual',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000009',BLNo:'000009', Vessel:'Vessel02', Voyage:'Voyage06', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000010',BLNo:'000010', Vessel:'Vessel01', Voyage:'Voyage08', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'Shenzhen Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000011',BLNo:'000011', Vessel:'Vessel03', Voyage:'Voyage09', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000012',BLNo:'000012', Vessel:'Vessel01', Voyage:'Voyage06', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000013',BLNo:'000013', Vessel:'Vessel04', Voyage:'Voyage09', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000014',BLNo:'000014', Vessel:'Vessel01', Voyage:'Voyage08', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000015',BLNo:'000015', Vessel:'Vessel04', Voyage:'Voyage07', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000016',BLNo:'000016', Vessel:'Vessel01', Voyage:'Voyage06', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Manual',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000017',BLNo:'000017', Vessel:'Vessel05', Voyage:'Voyage09', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'SI Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000081',BLNo:'000018', Vessel:'Vessel01', Voyage:'Voyage09', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000091',BLNo:'000019', Vessel:'Vessel02', Voyage:'Voyage08', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000020',BLNo:'000020', Vessel:'Vessel01', Voyage:'Voyage06', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		{BookingNo:'18100000000000021',BLNo:'000021', Vessel:'Vessel05', Voyage:'Voyage06', Service:'Service01', Deadline:'2014-10-30', LoadPort:'CHIWAN', CNTRs:'4', SIOrigin:'Inttra',DispatchTime:'2014-10-05', TeamGroup:'WuHan Team', AssignedTime:'', Inputter:'', PartBillNo:'2'},
		];
		$scope.filterResult = $scope.searchingResult;
	}

	function analyseSearchingResult(){

		var CHECK_VALUE = 'checkValue'
		var data = $scope.searchingResult;
		
		if(!data || data.length == 0){
			return;
			clearAnalyseResult();	
		}
		clearAnalyseResult($scope.searchingResult[0]);	

		var analyseData = $scope.analyseResult;

		for(var i = data.length; i--;){
			(function(i){
				var item = data[i];
				for(var k = analyseData.props.length; k--;){
					var propName = analyseData.props[k];
					if(item[propName]){
						if(!(analyseData[propName + 'Obj'].hasOwnProperty(item[propName]) && analyseData[propName + 'Obj'][item[propName]] == CHECK_VALUE)){
							analyseData[propName].push(item[propName]);
							analyseData[propName + 'Obj'][item[propName]] = CHECK_VALUE;
						}
					}
				}
			})(i);
		}
	}

	function clearAnalyseResult(resultDataModel){
		if(resultDataModel){
			analyseData = $scope.analyseResult = {props:[]};

			if(!resultDataModel){
				alert('Result Model is null.');
			}

			for(var prop in resultDataModel){
				if(resultDataModel.hasOwnProperty(prop)){
					analyseData.props.push(prop);
					analyseData[prop] = [];
					analyseData[prop+'Obj'] = {};
				}
			}
		}else{
			$scope.analyseResult = {
				BookingNo:[],
				BookingNoObj:{},
				BLNo:[],
				BLNoObj:{},
				Vessel:[],
				VesselObj:{},
				Voyage:[],
				VoyageObj:{},
				Service:[],
				ServiceObj:{},
				Deadline:[],
				DeadlineObj:{},
				LoadPort:[],
				LoadPortObj:{},
				CNTRs:[],
				CNTRsObj:{},
				SIOrigin:[],
				SIOriginObj:{},
				DispatchTime:[],
				DispatchTime:{},
				TeamGroup:[],
				TeamGroupObj:{},
				AssignTime:[],
				AssignTimeObj:{},
				Inputter:[],
				InputterObj:{},
				PartBillNo:[],
				PartBillNoObj:{}
			};
		}
	}

	$scope.$watch('filterResult.length',function(nValue,oValue){
		$scope.tableHeight = 30 * nValue + 100 + 'px';
	})

	loadTestData();
	analyseSearchingResult();
	//alert($scope.analyseResult);
	$scope.siGrid = {
		data:'filterResult',
		enableColumnResize:true,
		multiSelect:true,
		showSelectionCheckbox:true,
		enablePinning: true,
		columnDefs:[
			{field:'BookingNo',displayName:'Booking', width:160,pinned:true},
			{field:'BLNo',displayName:'BOL', width:160},
			{field:'Inputter',displayName:'Inputter', width:160},
			{field:'Vessel',displayName:'Vessel', width:160},
			{field:'Voyage',displayName:'Voyage', width:160},
			{field:'Service',displayName:'Service', width:160},
			{field:'Deadline',displayName:'Deadline', width:100},
			{field:'LoadPort',displayName:'Load Port', width:160},
			{field:'CNTRs',displayName:'CNTRs', width:50},
			{field:'SIOrigin',displayName:'SI Origin', width:120},
			{field:'DispatchTime',displayName:'Dispatch ime', width:100},
			{field:'TeamGroup',displayName:'Team Group', width:160},
			{field:'AssignedTime',displayName:'Assigned Time', width:100},
			
			{field:'PartBillNo',displayName:'PartBillNo', width:50}
		]
	};

	// alert($scope.filterResult.length)
})