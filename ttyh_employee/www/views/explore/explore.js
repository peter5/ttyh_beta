angular.module('Oddjobs')

//我的工作
.controller('ExploreCtrl', function($scope, $rootScope, $ionicModal,$state, $timeout, $log,$ionicTabsDelegate, $stateParams, $ionicLoading, $ionicScrollDelegate,$location, User, HttpFactory) {

  	
    // viewWillAppear
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.events = [
            {foo: 'bar', date: "2014-10-18"}
        ];
    });
    $scope.work_type_dic = new Array();
    $scope.work_type_dic['促销导购'] = 'cxdg';
    $scope.work_type_dic['周末职位'] = 'zmzw';
    $scope.work_type_dic['客服人员'] = 'kfry';
    $scope.work_type_dic['打包分拣'] = 'dbfj';
    $scope.work_type_dic['服务助理'] = 'fwzl';
    $scope.work_type_dic['线下推广'] = 'xxtg';
    $scope.work_type_dic['迎宾礼仪'] = 'ybly';
    $scope.work_type_dic['高额补贴'] = 'gebt';
    
    // viewDidLoad
    $scope.$on('$ionicView.afterEnter', function() {
    });
    $scope.waitApplyTag = true;
  	$scope.processingTag = false;
  	$scope.completedTag = false;
    $scope.LoginState = true
    $scope.transferLoginState = function(){
      $scope.LoginState = true
    }

    $scope.transferSignupState = function(){
      $scope.LoginState = false
    }

    var JOBSessions = AV.Object.extend("JobSession")

    $scope.clickTab = 'waiting'
    $ionicModal.fromTemplateUrl('views/my/login.html',{
        scope:$scope
    }).then(function(modal){
      $scope.loginModal = modal;
      $rootScope.$broadcast("loginModal",modal);
    });


    $scope.signupParams = {
      usertype:1,
      realname:'',
      password:'',
      verify_code:'',
      username:''
    };

    var statusCode = {

        'waiting':0,
        'applied':1,
        'processing':2,
        'completed':3
    }


    $scope.options = {
        defaultDate: new Date(),
        minDate: "2015-01-01",
        maxDate: "2016-12-31",
        dayNamesLength: 1, // 1 for "M", 2 for "Mo", 3 for "Mon"; 9 will show full day names. Default is 1.
        mondayIsFirstDay: true,//set monday as first day of week. Default is false
        eventClick: function(date) {
            console.log(date);
        },
        dateClick: function(date) {
            
        },
        changeMonth: function(month, year) {
            
        },
    };

    $ionicModal.fromTemplateUrl('views/explore/work_calendar.html',{
        scope:$scope
    }).then(function(modal){
        $scope.calendarModal = modal;
    });


    var curUser = AV.User.current()
    if (curUser){
        
        var currentTab = 'waiting';
        $scope.changeTab = function(tab){

          currentTab = tab
          $scope.clickTab = tab
          if (tab === 'waiting'){
            $scope.jobs = [];
            $scope.waitApplyTag = true;
            $scope.waitInterviewTag = false;
            $scope.processingTag = false;
            $scope.completedTag = false
            $scope.doRefresh()

          }

          if (tab === 'applied'){
            $scope.jobs = [];
            $scope.waitApplyTag = false;
            $scope.waitInterviewTag = true;
            $scope.processingTag = false;
            $scope.completedTag = false
            $scope.doRefresh()
          }

          if (tab === 'processing'){
            $scope.jobs = [];
            $scope.waitApplyTag = false;
            $scope.waitInterviewTag = false;
            $scope.processingTag = true;
            $scope.completedTag = false
            $scope.doRefresh()
          }

          if (tab === 'completed'){
            $scope.jobs = [];
            $scope.waitApplyTag = false;
            $scope.waitInterviewTag = false;
            $scope.processingTag = false;
            $scope.completedTag = true
            $scope.doRefresh()
          }
        };

        

        $scope.doRefresh = function(){
            var query = new AV.Query(JOBSessions);
            query.equalTo('user',AV.User.current())
            if (currentTab == 'waiting'){
                query.containedIn('status',[0,1,4])
            }else{
                query.equalTo('status',statusCode[currentTab])
            }           
            query.include('job');
            query.include('job.postUser');
            query.descending('createdAt');
            query.find({
                success:function(results){
                    $scope.$apply(function(){
                        $scope.jobs = results
                        $scope.$broadcast('scroll.refreshComplete');                    
                    })

                },
                error:function(error){
                    $scope.$apply(function(){
                        $scope.$broadcast('scroll.refreshComplete');
                    })
                    
                }
            }) 
        }
        $scope.doRefresh()

        $scope.loadMore = function(){
        };

        $scope.moreDataCanBeLoaded = function(){

            return $scope.nextpage
        };


        $scope.WaitingJobDetail = function(jobid,$event){
          $event.stopPropagation();
          $state.go('tab.waitApply',{id:jobid});
        };

        $scope.WaitingInterviewDetail = function(jobid,$event){
          $event.stopPropagation();
          $state.go('tab.waitInterview',{id:jobid});      
        }

        $scope.ProcessingJobDetail = function(jobid, $event){
          $event.stopPropagation();





          $state.go('tab.processing',{id:jobid});
        };

        $scope.CompletedJobDetail = function(jobid, $event){
          $event.stopPropagation();
          $state.go('tab.completed', {id:jobid});
        };


    }else{

        $ionicLoading.show({
            template:'请先登录！'
        })
        $timeout(function () {
            $ionicLoading.hide();
        }, 1000);

        if ($scope.loginModal){
            console.log($scope.loginModal)
            $scope.loginModal.show()  
        }else{
            $scope.$on("loginModal",function(){
                console.log($scope.loginModal)
                $scope.loginModal.show()
            })            
        }


    }






    $scope.sendCode = function(){

        AV.Cloud.requestSmsCode($scope.signupParams.username).then(function(){
            $ionicLoading.show({
                template:'验证码已发送!'
            })
        }, function(err){
            //发送失败
        });
        $timeout(function(){
            $ionicLoading.hide()
        },1000);


    }
    var HUD = function(template){

        $ionicLoading.show({
            template:template
        })

        $timeout(function(){
            $ionicLoading.hide()
        },1500);
    };
    $scope.signup = function(){
      $ionicLoading.show({template:"连接中..."});
      var newuser = new AV.User();

      var query = new AV.Query(AV.User);
      query.equalTo('username',$scope.signupParams.username);
      query.find({
          success:function(results){
              if (results.length > 0){
                  HUD('该手机号已注册')
              }else{
                  newuser.signUpOrlogInWithMobilePhone({
                    mobilePhoneNumber:$scope.signupParams.username,
                    smsCode:$scope.signupParams.verify_code,
                    username:$scope.signupParams.username,
                    realname:$scope.signupParams.realname,
                    usertype:'employee',
                    conform:0,
                    invite_code:$scope.signupParams.invite_code
                  },{
                    success:function(user){
                      
                      $rootScope.$broadcast('signupSucceed');
                      user.set('password',$scope.signupParams.password);
                      user.save().then(function(user){
                          $ionicLoading.hide();
                          HUD('注册成功！');
                      })

                    },
                    error:function(user,err){
                      $ionicLoading.hide();
                      HUD(err.message);
                    }
                  });                  
              }
          }
      })
    }

    $scope.login = function(){
        $ionicLoading.show({template:"连接中..."})
        var params = {
            username:$scope.signupParams.username,
            password:$scope.signupParams.password,
            client:3
        }

        AV.User.logIn(params.username, params.password, {
            success: function(user) {
                $scope.loginModal.hide()
                $ionicLoading.hide()
                HUD('登录成功')
                location.reload(true)

            },
            error: function(user, error) {
                $ionicLoading.hide()
                HUD(error.message)
            } 
        });

    };

    $scope.calendar = function(){
        $scope.events = [];
        for (var i=0;i<$scope.jobs.length;i++){
            var job = $scope.jobs[i]
            var mat = getDays(job._serverData.job._serverData.work_days[0].date,job._serverData.job._serverData.work_days[1].date);
            $scope.events = $scope.events.concat(mat);
        }

        $scope.calendarModal.show()
    };

})
//待处理
.controller('WaitApplyCtrl', function($scope, $rootScope, $state, $timeout, $log,
    $stateParams, $ionicLoading, User){

    $scope.$on('$ionicView.afterEnter', function() {

    });

    $scope.$on('$ionicView.beforeEnter', function() {
      
    });

    $scope.$on('$ionicView.beforeLeave', function() {

    });

    var id = $stateParams.id;
    var JOBSessions = AV.Object.extend("JobSession");
    var JOBHistory = AV.Object.extend("JobSessionHistory");
    var Job = AV.Object.extend("data");

    $scope.loadJob = function(){
        $ionicLoading.show({template:"加载中..."})
        var query = new AV.Query(JOBSessions);
        query.include('job')
        query.include('job.postUser')
        query.get(id,{
            success:function(result){
                $ionicLoading.hide()
                $scope.jobsession = result
                $scope.job = result._serverData.job._serverData
                $scope.postUser = $scope.job.postUser._serverData
                $scope.status = result._serverData.status
               
                if ($scope.status > 0){
                    var queryhis = new AV.Query(JOBHistory)
                    queryhis.equalTo('jobsession',result)
                    queryhis.first({
                        success:function(object){
                            
                            $scope.history = object._serverData
                        },error:function(_,error){
                            
                        }
                    })
                }     
            },
            error:function(error){
                $ionicLoading.hide()
            }
        })


        

    };

    $scope.loadJob();

    $scope.showJobDetail = function(jobid,$event){
        $event.stopPropagation();
        $state.go('tab.waitApply-jobDetail',{id:jobid});
    }

})
//待面试
.controller('WaitInterviewCtrl',function($scope, $ionicPopup, $rootScope, $state, $timeout, $log,
    $stateParams, $ionicLoading, User){

    $scope.$on('$ionicView.afterEnter', function() {

    });

    $scope.$on('$ionicView.beforeEnter', function() {
      
    });

    $scope.$on('$ionicView.beforeLeave', function() {

    });

    var id = $stateParams.id;
    var JOBSessions = AV.Object.extend("JobSession");
    var Job = AV.Object.extend("data");

    $scope.loadJob = function(){

        var query = new AV.Query(JOBSessions);
        query.get(id,{
            success:function(result){
                $scope.jobsession = result
                var query = new AV.Query(Job)
                query.get($scope.jobsession._serverData.jobId,{
                    success:function(result){
                        $scope.job = result._serverData
                        $scope.response = result
                    },
                    error:function(error){
                        console.log(error)
                    }
                })
                             

            },
            error:function(error){
                console.log(error)
            }
        })


        

    };

    $scope.loadJob();

    $scope.showJobDetail = function(jobid,$event){
        $event.stopPropagation();
        $state.go('tab.waitApply-jobDetail',{id:jobid});
    }

    
    var setTimer = function(create_at){
        setInterval(function(){
            countDown(create_at)
            }, 1000);
    }



    var countDown = function(create_at){

        var nowTime = new Date()
        //var applyTime = new Date(create_at)
        var applyTime = new Date('2015/09/22 16:43:15')
        var t = applyTime.getTime() + 1000*60*60*24 - nowTime.getTime()

        var h=Math.floor(t/1000/60/60%24);
        var m=Math.floor(t/1000/60%60);
        var s=Math.floor(t/1000%60);

        if(h<0 && m<0 && s<0){
            clearInterval(countDown,1000);
            //location.reload(true);//é‡æ–°åˆ·æ–°é¡µé¢
        }else{
            $scope.$digest();
            $scope.timerString = getgate(h,m,s)
            console.log($scope.timerString)
        }

    }

    var getgate = function(h,m,s){
        h=h<10?'0'+h:h;
        m=m<10?'0'+m:m;
        s=s<10?'0'+s:s;
        return h+":"+m+":"+s;
    }

    $scope.JobGiveUp = function($event){
        $event.stopPropagation();
        var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '您确定要放弃这次申请吗？'

        });
        confirmPopup.then(function(res) {
            if(res) {
                console.log('You are sure');
            } else {
                console.log('You are not sure');
            }
        });

    }


    $scope.JobAccept = function($event){
        $event.stopPropagation();


    }
})
//进行中
.controller('PrcessingCtrl', function($scope, $ionicPopup,$rootScope, $state, $timeout, $log,$stateParams, $ionicLoading, User){

    $scope.$on('$ionicView.afterEnter', function() {
    });

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.events = [
            {foo: 'bar', date: "2014-10-18"}
        ];
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      // $rootScope.hideTabs = '';
    });


    var id = $stateParams.id;
    var JOBSessions = AV.Object.extend("JobSession");
    var JOBHistory = AV.Object.extend('JobSessionHistory')
    var Job = AV.Object.extend("data");

    var setEvent = function(days){
        $scope.events = getDays(days[0].date,days[1].date);
        console.log(days)
    }

    $scope.loadJob = function(){
        $ionicLoading.show({template:"加载中..."})
        var query = new AV.Query(JOBSessions);
        query.include('job');
        query.get(id,{
            success:function(result){
                $ionicLoading.hide()
                $scope.jobsession = result
                $scope.job = result._serverData.job._serverData;
                setEvent($scope.job.work_days)
                var queryHis = new AV.Query(JOBHistory)
                queryHis.equalTo('jobsession',result)
                queryHis.first().then(function(object){
                    $scope.history = object._serverData
                })              

            },
            error:function(error){
                $ionicLoading.hide()
            }
        })


        

    };

    $scope.loadJob();

    $scope.showJobDetail = function(jobid,$event){
        $event.stopPropagation();
        $state.go('tab.waitApply-jobDetail',{id:jobid});
    }

    $scope.options = {
        defaultDate: new Date(),
        minDate: "2015-01-01",
        maxDate: "2016-12-31",
        dayNamesLength: 1, // 1 for "M", 2 for "Mo", 3 for "Mon"; 9 will show full day names. Default is 1.
        mondayIsFirstDay: true,//set monday as first day of week. Default is false
        eventClick: function(date) {
            console.log(date);
        },
        dateClick: function(date) {
            
        },
        changeMonth: function(month, year) {
            
        },
    };


})

//进行中
.controller('CompletedCtrl', function($scope, $ionicPopup,$rootScope, $state, $timeout, $log,
    $stateParams, $ionicLoading, User){

    $scope.finished = false;
    var currentUser = User.getCurrentUser();

    $scope.$on('$ionicView.afterEnter', function() {
    });

    $scope.$on('$ionicView.beforeEnter', function() {      
    });

    $scope.$on('$ionicView.beforeLeave', function() {
    });

    var id = $stateParams.id;
    var JOBSessions = AV.Object.extend("JobSession");
    var JOBHistory = AV.Object.extend('JobSessionHistory')
    var Job = AV.Object.extend("data");

    $scope.loadJob = function(){
        $ionicLoading.show({template:"加载中..."})
        var query = new AV.Query(JOBSessions);
        query.get(id,{
            success:function(result){
                $ionicLoading.hide()
                $scope.jobsession = result
                var query = new AV.Query(Job)
                query.get($scope.jobsession._serverData.jobId,{
                    success:function(result){
                        $scope.job = result._serverData
                        $scope.jobid = result.id
                        console.log($scope.job)
                        setEvent($scope.job.work_days)
                    },
                    error:function(error){
                        console.log(error)
                    }
                })

                var queryHis = new AV.Query(JOBHistory)
                queryHis.equalTo('jobsession',result)
                queryHis.first().then(function(object){
                    $scope.history = object._serverData
                })              

            },
            error:function(error){
                $ionicLoading.hide()
            }
        })


        

    };

    $scope.loadJob();


    $scope.showJobDetail = function(jobid,$event){
      $event.stopPropagation();
      $state.go('tab.completed-jobDetail',{id:jobid});
    }

})

//group
.controller('GroupCtrl',function($scope,AVFactory){



    $scope.$on('myjobgroupLoadSuccess',function(_,object){
        $scope.groups = object;
    });

    $scope.$on('joinGroupLoadSuccess',function(_,objects){
        $scope.groups = objects;

    });

    $scope.myGroup = function(){
        $scope.bar = true;
        AVFactory.myGroup();
        
    };
    $scope.joinGroup = function(){
        $scope.bar = false;
        AVFactory.joinGroup();
    };
    $scope.bar = false;
    $scope.joinGroup();


})

//GroupDetailCtrl
.controller('GroupDetailCtrl',function($scope,AVFactory,$stateParams,$ionicLoading,$timeout){

    var HUD = function(template){

        $ionicLoading.show({
            template:template
        })

        $timeout(function(){
            $ionicLoading.hide()
        },1500);
    };   

    var user = AV.User.current();
    var id = $stateParams.id;
    var JobGroup = AV.Object.extend("JobGroup");
    var JobSessionObject = AV.Object.extend("JobSession");
    var PostJob = AV.Object.extend("PostJobSession");
    var JobObject = AV.Object.extend("data");
    var query = new AV.Query(JobGroup);
    $ionicLoading.show({template:'连接中...'})
    query.include('command');
    query.include('members.JobSession');
    query.get(id,{
        success:function(object){
            
            $scope.group = object;
            var jobquery = new AV.Query(JobObject);
            jobquery.equalTo('objectId',object._serverData.jobId);
            var postquery = new AV.Query(PostJob);
            postquery.matchesQuery('job',jobquery);
            postquery.first().then(function(postobj){
                console.log(postobj);
                if ($scope.group._serverData.command.id == user.id){
                    $scope.reward = postobj._serverData.commandReward;
                    $scope.command = true;
                }else{
                    $scope.reward = postobj._serverData.memberReward;
                    $scope.command = false;
                }
            })


            if ($scope.group._serverData.command.id  == user.id){

            }
            var mat = object._serverData.members;
            var jsquery = new AV.Query(JobSessionObject);
            jsquery.include('user');
            jsquery.containedIn('objectId',mat);
            jsquery.find({
                success:function(results){
                    $ionicLoading.hide();
                    $scope.jobs = results;
                },error:function(_,error){
                    $ionicLoading.hide();
                    HUD(error.message);
                }

            })
        },
        error:function(_,error){
            $ionicLoading.hide();
            HUD(error.message);
        }
    });

    



})





