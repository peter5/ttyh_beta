angular.module('starter.controllers', [])


//HomeCtrl
.controller('HomeCtrl', function($scope, $rootScope, $ionicModal, $ionicPopup,$state, $timeout, $log, $ionicTabsDelegate, $stateParams, $ionicLoading, $ionicScrollDelegate,$location, Storage, AVFactory) {


    // viewWillAppear
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.events = [
            {foo: 'bar', date: "2014-10-18"}
        ];
    });
    // viewDidLoad
    $scope.$on('$ionicView.afterEnter', function() {
    });
    $scope.waitApplyTag = true;
    $scope.processingTag = false;
    $scope.completedTag = false;


    $scope.transferLoginState = function(){
      $scope.LoginState = true;
    };

    $scope.transferSignupState = function(){
      $scope.LoginState = false;
    };
    var HUD = function(template){

      $ionicLoading.show({
        template:template
      });

      $timeout(function(){
        $ionicLoading.hide();
      },1500);
    };

    $scope.clickTab = 'waiting';
    $ionicModal.fromTemplateUrl('templates/login.html',{
        scope:$scope
    }).then(function(modal){
      $scope.loginModal = modal;
      $rootScope.$broadcast("loginModal",modal);
    });

    $scope.signupParams = {
      usertype:2,
      username:'',
      password:'',
      verify_code:'',
      invite_code:''
    };
    var curUser = AV.User.current();

    if (curUser){
        
        var currentTab = 'waiting';
        $scope.changeTab = function(tab){

          currentTab = tab;
          $scope.clickTab = tab;
          $scope.doRefresh();

          if (tab === 'waiting'){
            $scope.waitApplyTag = true;
            $scope.processingTag = false;
            $scope.completedTag = false;
            $scope.doRefresh();

          }

          if (tab === 'processing'){
            $scope.waitApplyTag = false;
            $scope.processingTag = true;
            $scope.completedTag = false;
            $scope.doRefresh();
          }

          if (tab === 'completed'){

            $scope.waitApplyTag = false;
            $scope.processingTag = false;
            $scope.completedTag = true;
            $scope.doRefresh();
          }
        };

        

        $scope.doRefresh = function(){

            AVFactory.postJobSession($scope.clickTab);

        };

        $scope.$on('postJobSessionSuccessed',function(_,results){
            $scope.jobs = results;

            $scope.$broadcast('scroll.refreshComplete');
        });
        $scope.doRefresh();

        $scope.loadMore = function(){
        };

        $scope.moreDataCanBeLoaded = function(){

            return $scope.nextpage;
        };

        $scope.loadEmployeeList = function(tab,pjobsId){
            var id = tab+'+'+pjobsId;
            $state.go('tab.jobstatus',{id:id});
        };

        $ionicModal.fromTemplateUrl('templates/qiandaoList.html',{
            scope:$scope
        }).then(function(modal){
            $scope.signModal = modal;
        });

        var JobCheckIn = AV.Object.extend("JobCheckIn");

        $scope.showEmployeeList = function(job){
            var sessionMat = [];
            $scope.currentJob = job;
            for (var i in job._serverData.passing){
                sessionMat.push(job._serverData.passing[i].id);
            }
            var JobSession = AV.Object.extend("JobSession");
            var query = new AV.Query(JobSession);
            query.containedIn("objectId",sessionMat);
            query.include('job');
            query.include('user');
            query.find({
                success:function(results){

                    $scope.jobSessions = results;
                    var workDays = results[0]._serverData.job._serverData.work_days;
                    $scope.events = getDays(workDays[0].date,workDays[1].date);
                    $scope.currentDate = new Date();
                    $scope.currentDay = ($scope.currentDate.getMonth()+1)+'-'+$scope.currentDate.getDate();
                    
                    var q = new AV.Query(JobCheckIn);
                    q.equalTo('postJobSession',job);
                    q.equalTo('date',$scope.currentDate);
                    q.first().then(function(object){
                        if (object){
                            var signList = JSON.parse(object._serverData.checkList);
                            $rootScope.$broadcast("signListUpdate",signList);
                        }else{
                            var signList = [];
                            for (var i=0; i<results.length;i++){
                                var dic = {
                                    name:results[i]._serverData.user._serverData.realname,
                                    phone:results[i]._serverData.user._serverData.username,
                                    checked:false
                                }

                                signList.push(dic);
                            }
                            $rootScope.$broadcast("signListUpdate",signList);                            
                        }

                        $scope.signModal.show();
                    });

                    
                    
                },error:function(_,error){
                    HUD(error.message);
                }
            })



        };

        $scope.$on('signListUpdate',function(_,signlist){
            $scope.signList = signlist;
        })  



        $scope.saveSign = function(){

            var today = new Date();
            if ($scope.currentDate > today){
                HUD('当日工作完工后方可签到，请不要提前对员工签到');
            }else{

                var signListStr = JSON.stringify($scope.signList);
                $ionicLoading.show({template:"保存中..."})
                var query = new AV.Query(JobCheckIn);
                query.equalTo('postJobSession',$scope.currentJob);
                query.equalTo('date',$scope.currentDay);
                query.first().then(function(object){
                    $ionicLoading.hide();
                    if (object){
                        var confirmPopup = $ionicPopup.confirm({
                            title: $scope.currentDay+'签到修改',
                            template: '您已经完成过该日的签到，确定要修改吗?'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                object.set('checkList',signListStr);
                                object.save({
                                    success:function(){
                                        HUD('签到保存成功');
                                    },error:function(obj,error){
                                        HUD(error.message);
                                    }
                                })
                            }else{

                            }
                        });                   
                    }else{
                        var jc = new JobCheckIn();
                        jc.set('postJobSession',$scope.currentJob);
                        jc.set('date',$scope.currentDay);
                        jc.set('checkList',signListStr);
                        jc.save({
                            success:function(){
                                HUD('签到保存成功');
                            },error:function(obj,error){
                                HUD(error.message);
                            }
                        })
                    }
                })


            }







        };

        $scope.options = {
            defaultDate: new Date(),
            minDate: "2015-01-01",
            maxDate: "2016-12-31",
            dayNamesLength: 1, // 1 for "M", 2 for "Mo", 3 for "Mon"; 9 will show full day names. Default is 1.
            mondayIsFirstDay: true,//set monday as first day of week. Default is false
            eventClick: function(date) {
                $ionicLoading.show({template:"连接中..."})
                $scope.currentDay = date.month+1 + '-' + date.day;
                $scope.currentDate = date.date;
                var q = new AV.Query(JobCheckIn);
                q.equalTo('postJobSession',$scope.currentJob);
                q.equalTo('date',$scope.currentDay);
                q.first().then(function(object){
                    $ionicLoading.hide();
                    if (object){
                        var signList = JSON.parse(object._serverData.checkList);
                        $rootScope.$broadcast("signListUpdate",signList);
                    }else{
                        var signList = [];
                        for (var i=0; i<$scope.jobSessions.length;i++){
                            var dic = {
                                name:$scope.jobSessions[i]._serverData.user._serverData.realname,
                                phone:$scope.jobSessions[i]._serverData.user._serverData.username,
                                checked:false
                            }

                            signList.push(dic);
                        }
                        $rootScope.$broadcast("signListUpdate",signList);
                    
                    }

                })                
            },
            dateClick: function(date) {
            
            },
            changeMonth: function(month, year) {
            
            },
        }; 




    }else{

        $ionicLoading.show({
            template:'请先登录！'
        });
        $timeout(function () {
            $ionicLoading.hide();
        }, 1500);

        if ($scope.loginModal){
            
            $scope.loginModal.show();
        }else{
            $scope.$on("loginModal",function(){
                
                $scope.loginModal.show();
            });            
        }


    }


    $scope.sendCode = function(){
        AVFactory.sendCode($scope.signupParams.username);
    };

    $scope.signup = function(){
        AVFactory.signup($scope.signupParams);
        $scope.$on('signupSucceed',function(){
            console.log('singup')
            $scope.LoginState = true;
        });
    };

    $scope.login = function(){
        AVFactory.login($scope.signupParams);
        $scope.$on('loginSucceed',function(){
            $scope.loginModal.hide();
            location.reload(true)
          
        });
    };

    // $scope.processDate = function(dateMat){


    //   return DateDay(dateMat[0]) + ' ~ '+ DateDay(dateMat[1])

    // };
})


//jobControl
.controller('PostJobsCtrl',function($scope, $state, $location, $timeout,$ionicModal, $ionicPopup,$ionicLoading, Storage,AVFactory){

    $scope.currentUser = AV.User.current()._serverData;
    $scope.$on('fetchJobsSuccessed',function(_,results){
        $scope.jobs = results;
        console.log(results);
        $scope.$broadcast('scroll.refreshComplete');
    });

    $scope.$on('postJobSuccessAndback',function(){
        $scope.doRefresh()
    })

    $scope.doRefresh = function(){
        AVFactory.fetchJobs();
    };

    $scope.doRefresh();

    $scope.showDetail = function(jobid){
        $state.go('tab.postjob-detail',{id:jobid});  
    };

    var HUD = function(template){

      $ionicLoading.show({
        template:template
      });

      $timeout(function(){
        $ionicLoading.hide();
      },1500);
    };

    $scope.start = function(job){
       
        AVFactory.startJob(job);
    };

    $scope.finish = function(job){

        AVFactory.finishJob(job);
    };

    $scope.stop = function(job){

        AVFactory.stopJob(job);
    };

})

//jobstatus
.controller('JobStatusCtrl',function($scope, $state, $location, $timeout,$ionicModal, $ionicPopup,$ionicLoading, $stateParams,Storage,AVFactory){
    $ionicLoading.show({template:'连接中...'});
    var mat = $stateParams.id.split('+');
    var tab = mat[0];
    var id  = mat[1];

    var PjsObject = AV.Object.extend("PostJobSession");
    var JobsObject = AV.Object.extend("JobSession");

    $scope.Refresh = function(){
        $scope.mat = []
        var query = new AV.Query(PjsObject);
        query.include('applying.JobSession');
        query.include('passing.JobSession');
        query.include('rejecting.JobSession');

        if (tab == 'waiting'){
            $scope.tabName = '新申请';
        }else if (tab == 'passing'){
            $scope.tabName = '已录用';               
        }else if (tab == 'rejecting'){
            $scope.tabName = '已拒绝';                
        }    
        query.get(id,{
            success:function(result){
              
                
                if (tab == 'waiting'){
                    $scope.jobSessions = result._serverData.applying;
                    $scope.tabName = '新申请';
                }else if (tab == 'passing'){
                    $scope.jobSessions = result._serverData.passing;
                    $scope.tabName = '已录用';             
                }else if (tab == 'rejecting'){
                    $scope.jobSessions = result._serverData.rejecting;
                    $scope.tabName = '已拒绝';                
                }
                
                var jsQuery = new AV.Query(JobsObject);
                jsQuery.include('job');
                jsQuery.include('user');
                jsQuery.containedIn('objectId',$scope.jobSessions);
                jsQuery.find({
                    success:function(results){
                        $scope.mat = results;
                        $ionicLoading.hide();
                    },error:function(_,error){
                        $ionicLoading.hide();
                    }
                })
                
            },error:function(_,error){
                $ionicLoading.hide()
            }
        });        
    }

    $scope.Refresh()


    $scope.luyong = function(info){

        AVFactory.accept(info.id);

    };

    $scope.jujue = function(info){

        AVFactory.reject(info.id);
    
    };

    $scope.$on('acceptCompleted',function(){
        $scope.Refresh()
    });

    $scope.$on('rejectCompleted',function(){
        $scope.Refresh()
    });



})

//jobControl
.controller('PostJobCtrl',function($scope, $state, $location,$rootScope, $timeout,$ionicModal, $ionicPopup,$ionicLoading, Storage,AVFactory){

  $scope.currentUser = AV.User.current()._serverData;
  console.log($scope.currentUser);

  if ($scope.currentUser.conform === 0){
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '完成企业认证后才可以发布职位，请先进行认证'
        });
        confirmPopup.then(function(res) {
            if(res) {
              $state.go('tab.postJobs');
            }else{
              $state.go('tab.postJobs');
            }
        });


  }
  var HUD = function(template){

    $ionicLoading.show({
        template:template
    });

    $timeout(function(){
      $ionicLoading.hide();
    },1500);
  };

  $ionicModal.fromTemplateUrl('templates/datePicker.html',{
      scope:$scope
  }).then(function(modal){
    $scope.datePickerModal = modal;
  });


  $ionicModal.fromTemplateUrl('templates/dateSelect.html',{
      scope:$scope
  }).then(function(modal){
      $scope.dateSelectModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/region.html',{
      scope:$scope
  }).then(function(modal){
      $scope.regionModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/timepicker.html',{
      scope:$scope
  }).then(function(modal){
      $scope.timePickerModal = modal;
  });

  $scope.$on('postJobSuccess',function(){
      $state.go('tab.postJobs');
      $rootScope.$broadcast('postJobSuccessAndback')
  })

  $scope.datePicked = [];  
  $scope.regionStr = '';
  $scope.jobParams = {
      title:'',
      work_type:'',
      recruit_num:'',
      work_days:[],
      work_hour:'',
      work_region:[],
      work_location:'',
      pay_unit:'',
      pay_qty:'',
      pay_type:'',
      gender_requirement:'',
      special_requirement:'',
      contact:'',
      contact_num:'',
      work_desc:'',
      work_content:'',
      recruit_requirement:'',
      pay_rule:'',
      work_day_str:''
  };

  $scope.dateSelectParams = {
      start:'',
      end:'',
      startobject:{},
      endobject:{}
  };





  $scope.work_type = ['','不限','促销导购','快递配送','打包分拣','地推推广','客服人员','扫码关注','传单派发','服务人员','迎宾/礼仪','调查问卷','到店转化','充场/路演','文员/助理'];
  //$scope.region = ['东城区','西城区','崇文区','宣武区','朝阳区','海淀区','丰台区','石景山区','通州区','平谷区','顺义区','怀柔区','昌平区','门头沟区','房山区','大兴区','密云县','延庆县']
  $scope.region = [{"text": "北京市", "checked": false}, {"text": "\u4e1c\u57ce\u533a", "checked": false}, {"text": "\u897f\u57ce\u533a", "checked": false}, {"text": "\u5d07\u6587\u533a", "checked": false}, {"text": "\u5ba3\u6b66\u533a", "checked": false}, {"text": "\u671d\u9633\u533a", "checked": false}, {"text": "\u6d77\u6dc0\u533a", "checked": false}, {"text": "\u4e30\u53f0\u533a", "checked": false}, {"text": "\u77f3\u666f\u5c71\u533a", "checked": false}, {"text": "\u901a\u5dde\u533a", "checked": false}, {"text": "\u5e73\u8c37\u533a", "checked": false}, {"text": "\u987a\u4e49\u533a", "checked": false}, {"text": "\u6000\u67d4\u533a", "checked": false}, {"text": "\u660c\u5e73\u533a", "checked": false}, {"text": "\u95e8\u5934\u6c9f\u533a", "checked": false}, {"text": "\u623f\u5c71\u533a", "checked": false}, {"text": "\u5927\u5174\u533a", "checked": false}, {"text": "\u5bc6\u4e91\u53bf", "checked": false}, {"text": "\u5ef6\u5e86\u53bf", "checked": false}];
  //$scope.years = ['1960', '1961', '1962', '1963', '1964', '1965', '1966', '1967', '1968', '1969', '1970', '1971', '1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979', '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997']
  //$scope.jobs = ['送餐','保洁','家教','分拣','快递']
  $scope.jobs = [{"text": "\u9001\u9910", "checked": false}, {"text": "\u4fdd\u6d01", "checked": false}, {"text": "\u5bb6\u6559", "checked": false}, {"text": "\u5206\u62e3", "checked": false}, {"text": "\u5feb\u9012", "checked": false}];
  $scope.pay_unit = ['元/天','元/周','元/个','元/小时'];
  $scope.pay_type = ['日结','周结','月结','完工结'];
  $scope.gender_requirement = ['男','女','不限'];
  
  $scope.selectDate = function(type){
      if (type === 0){
          $scope.datetype = true
      }else{
          $scope.datetype = false
      }

      $scope.datePickerModal.show()
  }

  $scope.options = {
    defaultDate: new Date(),
    minDate: "2015-01-01",
    maxDate: "2016-12-31",
    dayNamesLength: 1, // 1 for "M", 2 for "Mo", 3 for "Mon"; 9 will show full day names. Default is 1.
    mondayIsFirstDay: true,//set monday as first day of week. Default is false

    dateClick: function(date) {
        var day = DateDay(date);
        // var dic = {'text':day,'checked':true};
        // if($scope.datePicked.contains(dic)){
        //     HUD('请不要重复选择日期');
        // }else{
        //     $scope.datePicked.push(dic);
        // }
        if ($scope.datetype){
            $scope.dateSelectParams.start = day;
            $scope.dateSelectParams.startobject = date;
            if ($scope.dateSelectParams.endobject.month){
                var e = $scope.dateSelectParams.endobject.month * 31 + $scope.dateSelectParams.endobject.day;
                var s = date.month * 31 + date.day;
                if (s < e){
                   $scope.datePickerModal.hide() 
                }else{
                  HUD('工作结束时间应早于'+$scope.dateSelectParams.end)
                }
            }else{
                $scope.datePickerModal.hide()
            }
        }else{
            $scope.dateSelectParams.end = day
            $scope.dateSelectParams.endobject = date;
            if ($scope.dateSelectParams.startobject.month){
                var s = $scope.dateSelectParams.startobject.month * 31 + $scope.dateSelectParams.startobject.day;
                var e = date.month * 31 + date.day;
                if (s < e){
                   $scope.datePickerModal.hide() 
                }else{
                  HUD('工作结束时间应晚于'+$scope.dateSelectParams.start)
                }
            }else{
                $scope.datePickerModal.hide()
            }
            
        }
        

        
    },
    changeMonth: function(month, year) {
        
    },
  };

  $scope.saveDatePicked = function(){
      
      $scope.jobParams.work_days = [];
      // for (var i in $scope.datePicked){
      //     var dic = $scope.datePicked[i];
      //     if (dic.checked){
      //         $scope.jobParams.work_days.push(dic.text);
      //     }
      // }

      // var len = $scope.jobParams.work_days.length;
      // if (len == 1){
      //     $scope.dateStr = $scope.jobParams.work_days[0];

      // }else if (len > 1){
      //     var day = $scope.jobParams.work_days[0];
      //     var day_end = $scope.jobParams.work_days[len-1];
      //     $scope.dateStr = day+' ~ '+day_end+',共'+len+'天';
      // }else{
      //   $scope.dateStr = '';
      // }
      if ($scope.dateSelectParams.start.length == 0){
          HUD('请选择开工日期');
      }else if ($scope.dateSelectParams.end.length == 0){
          HUD('请选择完工日期');
      }else{
          $scope.jobParams.work_days.push($scope.dateSelectParams.startobject);
          $scope.jobParams.work_days.push($scope.dateSelectParams.endobject);
          $scope.dateStr = DateDay($scope.dateSelectParams.startobject) + ' ~ ' + DateDay($scope.dateSelectParams.endobject);

          $scope.jobParams.work_day_str = $scope.dateStr;
          $scope.dateSelectModal.hide();          
      }


          
      


  };
  $scope.saveRegion = function(){
      $scope.regionModal.hide();
      $scope.jobParams.work_region = [];
      for (var i in $scope.region){
          dic = $scope.region[i];
          if (dic.checked){
              $scope.jobParams.work_region.push(dic.text);
          }
      }

      $scope.regionStr = $scope.jobParams.work_region.join();

      
  };

  $scope.postJob = function(){

      AVFactory.postJob($scope.jobParams);

  };


    $scope.timePickerObject = {
      inputEpochTime: (8 * 60 * 60),  //Optional
      step: 15,  //Optional
      format: 24,  //Optional
      titleLabel: '选择开工时间',  //Optional
      setLabel: '选择',  //Optional
      closeLabel: '关闭',  //Optional
      setButtonType: 'button-balanced',  //Optional
      closeButtonType: 'button-stable',  //Optional
      callback: function (val) {    //Mandatory
        timePickerCallback(val);
      }
    };

    function timePickerCallback(val) {
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        var selectedTime = new Date(val * 1000);
        if (selectedTime.getUTCMinutes() === 0){
            $scope.startTime = selectedTime.getUTCHours() + ':' + selectedTime.getUTCMinutes()+'0'
        }else{
            $scope.startTime = selectedTime.getUTCHours() + ':' + selectedTime.getUTCMinutes()
        }
      }
    }


    $scope.timePickerObject_end = {
      inputEpochTime: (18 * 60 * 60),  //Optional
      step: 15,  //Optional
      format: 24,  //Optional
      titleLabel: '选择完工时间',  //Optional
      setLabel: '选择',  //Optional
      closeLabel: '关闭',  //Optional
      setButtonType: 'button-balanced',  //Optional
      closeButtonType: 'button-stable',  //Optional
      callback: function (val) {    //Mandatory
        timePickerCallback_end(val);
      }
    };

    function timePickerCallback_end(val) {
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
        if (selectedTime.getUTCMinutes() === 0){
            $scope.endTime = selectedTime.getUTCHours() + ':' + selectedTime.getUTCMinutes()+'0'
        }else{
            $scope.endTime = selectedTime.getUTCHours() + ':' + selectedTime.getUTCMinutes()
        }
        
      }
    }

    $scope.saveTimePicked = function(){
        if (!$scope.endTime){
            HUD('请选择完工时间')
        }else if(!$scope.startTime){
            HUD('请选贼开工时间')
        }else{
            $scope.jobParams.work_hour = $scope.startTime + ' ~ ' + $scope.endTime
            $scope.timePickerModal.hide()
        }


    }

})

.controller('JobCtrl', function($scope,$rootScope,$stateParams,AVFactory){


    var id = $stateParams.id;
    AVFactory.jobDetail(id);
    $scope.$on('jobDetailFetchSucceed',function(_,result){
        $scope.job = result;
    });
    $scope.processDate = function(dateMat){
        return DateDay(dateMat[0]) + ' ~ '+ DateDay(dateMat[1])
    };
})


//MyControl
.controller('MyCtrl',function($scope, $state, $location, $timeout,$ionicModal, $ionicPopup,$ionicLoading, AVFactory, Storage){

    $scope.currentUser = AV.User.current()._serverData;
    console.log($scope.currentUser);
    $scope.companyName = $scope.currentUser.companyName || null;
    if ($scope.companyName){
        $scope.regionStr = $scope.currentUser.companyRegion;
    }
    $scope.LoginState = true;

    $scope.signupParams = {
      usertype:2,
      username:'',
      password:'',
      verify_code:'',
      invite_code:''
    };    
    $ionicModal.fromTemplateUrl('templates/login.html',{
        scope:$scope
    }).then(function(modal){
        $scope.loginModal = modal;
    });
    $scope.logout = function(){
        AV.User.logOut();
        $scope.loginModal.show();
        $scope.LoginState = false;
    };
        $scope.transferLoginState = function(){
      $scope.LoginState = true;
    };

    $scope.transferSignupState = function(){
      $scope.LoginState = false;
    };
    $scope.sendCode = function(){
        AVFactory.sendCode($scope.signupParams.username);
    };

    $scope.signup = function(){
        AVFactory.signup($scope.signupParams)
        $scope.$on('signupSucceed',function(){
            $scope.LoginState = true;
        })
    };

    $scope.login = function(){
        AVFactory.login($scope.signupParams);
        $scope.$on('loginSucceed',function(){
            $scope.loginModal.hide();
            $state.go('tab.my') ;
        })
    };

})


//Renzheng
.controller('RenzhengCtrl',function($scope, $state, $location, $timeout,$ionicModal, $ionicPopup,$ionicLoading, AVFactory, Storage){

    var currentUser = AV.User.current();
    $scope.authStatus = false;
    $ionicLoading.show({template:'连接中...'});
    var Authentication = AV.Object.extend("Authentication");
    var query = new AV.Query(Authentication);
    query.equalTo('postUser',currentUser);
    query.first({
        success:function(object){
            $ionicLoading.hide();
            if (object){
                if (object._serverData.status === 0){
                    var confirmPopup = $ionicPopup.confirm({
                        title: '提示',
                        template: '您已经提交了企业认证，请耐心等待'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            $state.go('tab.my');
                        }else{
                          $state.go('tab.my');
                        }
                    });
                }else if (object._serverData.status === 1){
                    var confirmPopup = $ionicPopup.confirm({
                        title: '认证失败，是否重新申请？',
                        template: '您提交的企业认证未通过认证，'+object._serverData.message
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            
                        }else{
                          $state.go('tab.my');
                        }
                    });                    

                }else if (object._serverData.status == 2){
                    $scope.authStatus = true;
                    $scope.rzparams = {
                        yyzz:object._serverData.licence,
                        sfz:object._serverData.idcard,
                        contact:object._serverData.contact,
                        contact_num:object._serverData.contact_num,
                        position:object._serverData.position

                    };
                    console.log($scope.rzparams)
                }           
            }else{
                $scope.rzparams = {
                    yyzz:'',
                    sfz:'',
                    contact:'',
                    contact_num:'',
                    position:''
                };

            }

        }
    });





    function el(id){return document.getElementById(id);} // Get elem by ID
    
    function readImage() {
        if ( this.files && this.files[0] ) {
            var FR= new FileReader();
            FR.onload = function(e) {
                 el("img_yyzz").src = e.target.result;
                 $scope.rzparams.yyzz = e.target.result;
            };       
            FR.readAsDataURL( this.files[0] );
        }
    }
    if($scope.authStatus){
      el("yyzz").addEventListener("change", readImage, false);
    }
    

    function readImage2() {
        if ( this.files && this.files[0] ) {
            var FR= new FileReader();
            FR.onload = function(e) {
                 el("img_sfz").src = e.target.result;
                 $scope.rzparams.sfz = e.target.result;
            };       
            FR.readAsDataURL( this.files[0] );
        }
    }

    
    if($scope.authStatus){
      el("sfz").addEventListener("change", readImage2, false);
    }
    $scope.requireAuth = function(){

        AVFactory.auth($scope.rzparams);
        
    };

})

//Guide
.controller('GuideCtrl',function($scope, $state, $location, $timeout,$ionicModal, $ionicPopup, $ionicLoading, AVFactory, Storage){

})

//Resume
.controller('ResumeCtrl', function($scope, $state, $rootScope, $ionicModal,$timeout,$ionicLoading, $ionicPopup, $log,AVFactory,Upload){

    var currentUser = AV.User.current()._serverData;
    if (currentUser.companyName){
        $scope.resumeParams = {
            companyName:currentUser.companyName,
            industries:currentUser.industries,
            companyType:currentUser.companyType,
            companyScale:currentUser.companyScale,
            companyRegion:currentUser.companyRegion,
            companyAddress:currentUser.companyAddress,
            companyContact:currentUser.companyContact,
            companyContactNum:currentUser.companyContactNum,
            companyDesc:currentUser.companyDesc,
            companyLogo:currentUser.avatar
        };      
    }else{
      
        $scope.resumeParams = {
            companyName:'',
            industries:'',
            companyType:'',
            companyScale:'',
            companyRegion:[],
            companyAddress:'',
            companyContact:'',
            companyContactNum:'',
            companyDesc:'',
            companyLogo:''  
        };
    }

    

    if ($scope.resumeParams.companyRegion){
        $scope.regionStr = $scope.resumeParams.companyRegion;        
    }else{
        $scope.regionStr = '';
    }


    $scope.optionSelected = '';

    var HUD = function(template){

      $ionicLoading.show({
        template:template
      });

      $timeout(function(){
        $ionicLoading.hide();
      },1500);
    }

    $scope.saveProfile = function(){
        $ionicLoading.show({template:"连接中..."})
        if ($scope.resumeParams.companyName.length == 0){
            HUD('请填写企业名称')
        }else if ($scope.resumeParams.industries.length == 0){
            HUD('请填写所属行业')
        }else if ($scope.resumeParams.companyType.length == 0){
            HUD('请填写企业类型')
        }else if ($scope.resumeParams.companyScale.length == 0){
            HUD('请填写企业规模')
        }else if ($scope.resumeParams.companyRegion.length == 0){
            HUD('请填写企业所在地区')
        }else if ($scope.resumeParams.companyContact.length == 0){
            HUD('请填写企业联系人')
        }else if ($scope.resumeParams.companyContactNum.length == 0){
            HUD('请填写企业联系方式')
        }else{
            var user = AV.User.current()
            user.set('companyName',$scope.resumeParams.companyName);
            user.set('industries',$scope.resumeParams.industries);
            user.set('companyType',$scope.resumeParams.companyType);
            user.set('companyScale',$scope.resumeParams.companyScale);
            user.set('companyRegion',$scope.resumeParams.companyRegion);
            user.set('companyAddress',$scope.resumeParams.companyAddress);
            user.set('companyContact',$scope.resumeParams.companyContact);
            user.set('companyContactNum',$scope.resumeParams.companyContactNum);
            user.set('companyDesc',$scope.resumeParams.companyDesc);
            user.set('companyLogo',$scope.resumeParams.companyLogo);
            user.save(null,{
              success:function(user){
                  $ionicLoading.hide();
                  $ionicLoading.show({
                  template:"修改资料成功"
                  })
                  $timeout(function () {
                      $ionicLoading.hide();
                  }, 1000)
              },error:function(_,error){
                  $ionicLoading.hide();
                  $ionicLoading.show({
                  template:error.message
                  })
                  $timeout(function () {
                      $ionicLoading.hide();
                  }, 1000)
              }

            })

        }

    }

    $ionicModal.fromTemplateUrl('templates/region.html',{
        scope:$scope
    }).then(function(modal){
      $scope.regionModal = modal;
    });

    // $scope.saveRegion = function(){
    //     $scope.regionModal.hide()

    //     for (var i in $scope.region){
    //         dic = $scope.region[i]
    //         if (dic.checked){
    //             $scope.resumeParams.companyRegion.push(dic.text)
    //         }
    //     }

    //     $scope.regionStr = $scope.resumeParams.companyRegion.join()

        
    // }

    //$scope.region = ['东城区','西城区','崇文区','宣武区','朝阳区','海淀区','丰台区','石景山区','通州区','平谷区','顺义区','怀柔区','昌平区','门头沟区','房山区','大兴区','密云县','延庆县']
    $scope.region = [{"text": "\u4e1c\u57ce\u533a", "checked": false}, {"text": "\u897f\u57ce\u533a", "checked": false}, {"text": "\u5d07\u6587\u533a", "checked": false}, {"text": "\u5ba3\u6b66\u533a", "checked": false}, {"text": "\u671d\u9633\u533a", "checked": false}, {"text": "\u6d77\u6dc0\u533a", "checked": false}, {"text": "\u4e30\u53f0\u533a", "checked": false}, {"text": "\u77f3\u666f\u5c71\u533a", "checked": false}, {"text": "\u901a\u5dde\u533a", "checked": false}, {"text": "\u5e73\u8c37\u533a", "checked": false}, {"text": "\u987a\u4e49\u533a", "checked": false}, {"text": "\u6000\u67d4\u533a", "checked": false}, {"text": "\u660c\u5e73\u533a", "checked": false}, {"text": "\u95e8\u5934\u6c9f\u533a", "checked": false}, {"text": "\u623f\u5c71\u533a", "checked": false}, {"text": "\u5927\u5174\u533a", "checked": false}, {"text": "\u5bc6\u4e91\u53bf", "checked": false}, {"text": "\u5ef6\u5e86\u53bf", "checked": false}];
    //$scope.years = ['1960', '1961', '1962', '1963', '1964', '1965', '1966', '1967', '1968', '1969', '1970', '1971', '1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979', '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997']
    //$scope.jobs = ['送餐','保洁','家教','分拣','快递']
    $scope.jobs = [{"text": "促销导购", "checked": false}, {"text": "快递配送", "checked": false}, {"text": "打包分拣", "checked": false}, {"text": "地推推广", "checked": false}, {"text": "问卷调查", "checked": false},{"text": "客服", "checked": false},{"text": "其他", "checked": false}];
    $scope.industries = ['---','计算机/网络/通信','酒店/餐饮','旅游','媒体/影视/文化','建筑/装修','贸易/交通/运输/物流','家政','运动健身','美容美发','生产/制造','广告/会展','教育/培训','超市/百货/零售','保健按摩','物业管理/商业中心','咨询/管理产业/法律/财会','检验/检查/认证','快速消费品(食品/饮料/烟酒/化妆品)','办公用品及设备','中介服务','其他行业'];
    $scope.company_type = ['---','民营','外企独资','国企','合资','股份制企业','上市企业','国家机关','事业单位','其他'];
    $scope.companyScale = ['---','20人以下','20-99人','100-499人','500-999人','1000-9999人','10000人以上'];


    $scope.genderPicker = function(optionSelected){
    };


    function el(id){return document.getElementById(id);} // Get elem by ID

    function readImage() {
        if ( this.files && this.files[0] ) {
            var FR= new FileReader();
            FR.onload = function(e) {
                 el("img").src = e.target.result;
                 AVFactory.uploadAvatar(e.target.result);
            };       
            FR.readAsDataURL( this.files[0] );
        }
    }

    el("asd").addEventListener("change", readImage, false);


})





