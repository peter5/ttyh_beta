angular.module('Oddjobs')

//首页
.controller('HomeCtrl', function($scope,$rootScope ,$log, $timeout,$ionicTabsDelegate, $ionicPopover, $ionicModal, $ionicLoading,$location, $state, Storage, Tabs, My, User, HttpFactory){

	console.log("enter jobs ctrl");
    
    var hometab = 'recommend'
    var Job = AV.Object.extend("PostJobSession");
    $scope.nextpage = false
	  // viewDidLoad
    $scope.$on('$ionicView.afterEnter', function() {
    });

    //

    AV.Cloud.run('getPostJobs',{},{
        success:function(results){
            console.log(results);
        }
    })



    $scope.work_type_dic = new Array();
    $scope.work_type_dic['促销导购'] = 'cxdg';
    $scope.work_type_dic['周末职位'] = 'zmzw';
    $scope.work_type_dic['客服人员'] = 'kfry';
    $scope.work_type_dic['打包分拣'] = 'dbfj';
    $scope.work_type_dic['服务助理'] = 'fwzl';
    $scope.work_type_dic['线下推广'] = 'xxtg';
    $scope.work_type_dic['迎宾礼仪'] = 'ybly';
    $scope.work_type_dic['高额补贴'] = 'gebt';
    $scope.doRefresh = function(){

        var query = new AV.Query(Job)

        query.limit(10)
        query.descending('createdAt')
        query.include('postUser')
        query.include('job')
        query.equalTo('status','waiting')
        query.find({
            success:function(results){
                $scope.$apply(function(){
                    $scope.jobs = results
                    console.log(results.length)
                    if ($scope.jobs.length === 10){
                        $scope.nextpage = true
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                })

            },
            error:function(error){
              console.log(error.message)
              $scope.$broadcast('scroll.refreshComplete');
            }
        })

    };

    $scope.doRefresh()


    $scope.loadMore = function(){
        
        
        var query = new AV.Query(Job)
        query.limit(10)
        query.include('postUser')
        query.descending('createdAt')
        query.include('job')
        query.skip($scope.jobs.length)
        query.find({
            success:function(results){

                
                    if (results.length == 10){
                        $scope.nextpage = true
                        $scope.jobs = $scope.jobs.concat(results)
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }else{
                        $scope.jobs = $scope.jobs.concat(results)                        
                        $scope.nextpage = false
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
               

            },
            error:function(error){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                console.log(error.message)
              
            }
        })
    };

    $scope.moreDataCanBeLoaded = function(){

        return $scope.nextpage;
    };




    $scope.showJobs = function(tab){
        $state.go('tab.jobs',{tab:tab});
    }

    $scope.showJobs_ad1 = function($event){
		// $event.stopPropagation();
  //     	//$state.go('tab.jobs',{tab:'bb'});
  //       $ionicLoading.show({
  //           template:"未开通~~~"
  //       });

  //       $timeout(function(){
  //           $ionicLoading.hide();
  //       },1500);
    }

    $scope.showJobs_ad2 = function($event){
		
      	$state.go('tab.homeguide');
    }


})
//不同分类
.controller('JobsCtrl',function($scope, $rootScope, $stateParams,$timeout,
	$ionicTabsDelegate, $ionicLoading, $state,$location,
	HttpFactory, Storage){

    $scope.tab = $stateParams.tab;
    $scope.jobs = [];    
    $scope.filter = {
        job:$scope.tab,
        region:'不限'
    }
    $scope.work_type_dic = new Array();
    $scope.work_type_dic['促销导购'] = 'cxdg';
    $scope.work_type_dic['周末职位'] = 'zmzw';
    $scope.work_type_dic['客服人员'] = 'kfry';
    $scope.work_type_dic['打包分拣'] = 'dbfj';
    $scope.work_type_dic['服务助理'] = 'fwzl';
    $scope.work_type_dic['线下推广'] = 'xxtg';
    $scope.work_type_dic['迎宾礼仪'] = 'ybly';
    $scope.work_type_dic['高额补贴'] = 'gebt';
    var Job = AV.Object.extend("data");
    var PostJob = AV.Object.extend("PostJobSession")

	// viewWillAppear
	$scope.$on('$ionicView.beforeEnter', function(){
	  });

	  // viewDidLoad
    $scope.$on('$ionicView.afterEnter', function() {
    });


    $scope.doRefresh = function(){
        var jobquery = new AV.Query(Job)
        
        if ($scope.filter.job != '不限' && $scope.filter.job.length > 0){
            console.log($scope.filter.job)
            jobquery.equalTo('work_type', $scope.filter.job)
        }
        if ($scope.filter.region != '不限' && $scope.filter.region.length > 0){
            jobquery.equalTo('work_region',$scope.filter.region)
        }
        var query = new AV.Query(PostJob)
        $scope.nextpage = true
        query.limit(10)
        query.include('postUser')
        query.include('job')
        query.descending('createdAt')
        query.matchesQuery('job',jobquery)
        query.equalTo('status','waiting')
        query.find({
            success:function(results){
                $scope.$apply(function(){
                    $scope.jobs = results;

                    if ($scope.jobs.length == 10){
                        $scope.nextpage = true;
                    }
                    
                    $scope.$broadcast('scroll.refreshComplete');
                })

            },
            error:function(error){

              $scope.$broadcast('scroll.refreshComplete');
            }
        })
    };

    $scope.doRefresh()  

    $scope.loadMore = function(){
        var jobquery = new AV.Query(Job)
        jobquery.equalTo('work_type',$scope.tab)        
        var query = new AV.Query(PostJob)
        query.limit(10);
        query.include('postUser');
        query.include('job');
        query.descending('createdAt')
        query.skip($scope.jobs.length)
        query.matchesQuery('job',jobquery)
        query.equalTo('status','waiting')
        query.find({
            success:function(results){

                if (results.length === 10){
                    $scope.nextpage = true
                    $scope.jobs = $scope.jobs.concat(results)
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }else{
                    $scope.nextpage = false
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }


            },
            error:function(error){
                $scope.$broadcast('scroll.infiniteScrollComplete'); 

              
            }
        })
    };

    $scope.moreDataCanBeLoaded = function(){

        return $scope.nextpage
    };  


    $scope.work_type = ['','不限','促销导购','快递配送','打包分拣','地推推广','客服人员','扫码关注','传单派发','服务人员','迎宾/礼仪','调查问卷','到店转化','充场/路演','文员/助理'];
    $scope.region = [{"text":"","checked":false},{"text":"北京市","checked":false},{"text":"不限","checked":false},{"text": "\u4e1c\u57ce\u533a", "checked": false}, {"text": "\u897f\u57ce\u533a", "checked": false}, {"text": "\u5d07\u6587\u533a", "checked": false}, {"text": "\u5ba3\u6b66\u533a", "checked": false}, {"text": "\u671d\u9633\u533a", "checked": false}, {"text": "\u6d77\u6dc0\u533a", "checked": false}, {"text": "\u4e30\u53f0\u533a", "checked": false}, {"text": "\u77f3\u666f\u5c71\u533a", "checked": false}, {"text": "\u901a\u5dde\u533a", "checked": false}, {"text": "\u5e73\u8c37\u533a", "checked": false}, {"text": "\u987a\u4e49\u533a", "checked": false}, {"text": "\u6000\u67d4\u533a", "checked": false}, {"text": "\u660c\u5e73\u533a", "checked": false}, {"text": "\u95e8\u5934\u6c9f\u533a", "checked": false}, {"text": "\u623f\u5c71\u533a", "checked": false}, {"text": "\u5927\u5174\u533a", "checked": false}, {"text": "\u5bc6\u4e91\u53bf", "checked": false}, {"text": "\u5ef6\u5e86\u53bf", "checked": false}]
    
    $scope.search = function(){
        $scope.tab = $scope.filter.job
        $scope.doRefresh()
        

    };


})


//job详情页
.controller('JobCtrl', function($scope, $rootScope, $ionicModal,$state, $timeout, $log, $ionicTabsDelegate, $stateParams, $ionicLoading, $ionicScrollDelegate,$location, Storage, AVFactory,$ionicActionSheet){

    $ionicLoading.show({template:"加载中..."})
    $scope.jobstatus = 0;
    $scope.$on('$ionicView.afterEnter', function() {
    });
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.doRefresh()
        $rootScope.hideTabs = '';
    });

    var id = $stateParams.id;
    var Job = AV.Object.extend("data");
    var PostJob = AV.Object.extend("PostJobSession");
    $scope.doRefresh = function(){

        var queryjob = new AV.Query(Job);
        queryjob.equalTo('objectId',id);
        var query = new AV.Query(PostJob);
        query.matchesQuery('job',queryjob);
        query.include('job');
        query.first({
            success:function(result){
                $ionicLoading.hide();
                $scope.job = result._serverData.job._serverData;
                var jobObject = result._serverData.job;
                jobObject.set('view_count',parseInt($scope.job.view_count + 1));
                jobObject.save();
                $scope.response = result;
                Storage.save(id,$scope.job);



            },error:function(_,error){
                $ionicLoading.hide();
            }
        })

    };


    $ionicModal.fromTemplateUrl('views/my/login.html',{
        scope:$scope
    }).then(function(modal){
        $scope.loginModal = modal;
    });
    $scope.LoginState = true
    $scope.transferLoginState = function(){
        $scope.LoginState = true
    }

    $scope.transferSignupState = function(){
        $scope.LoginState = false
    }
    $scope.signupParams = {
        usertype:1,
        realname:'',
        password:'',
        verify_code:'',
        username:''
    };

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
    };

    $scope.login = function(){

        var params = {
            username:$scope.signupParams.username,
            password:$scope.signupParams.password,
            client:3
        }

        AV.User.logIn(params.username, params.password, {
            success: function(user) {

                $scope.loginModal.hide()
                $ionicLoading.show({
                template:"登录成功"
            })
                $timeout(function () {
                $ionicLoading.hide();
                }, 1000);
                //location.reload(true)

            },
            error: function(user, error) {
                $ionicLoading.hide();

                if(error.code == 210){
                $ionicLoading.show({
                      template:"用户名或密码错误"
                      })
                      $timeout(function () {
                      $ionicLoading.hide();
                      }, 1500);
                }else{
                    $ionicLoading.show({
                    template:error.message
                    })
                    $timeout(function () {
                    $ionicLoading.hide();
                    }, 1500);
                }
            } 
        });

    };    
    $scope.applyJob = function() {

        var curUser = AV.User.current()
        if (curUser){
            AVFactory.applyJob($scope.response._serverData.job);
        }else{
            $ionicLoading.show({
                template:'请先登录！'
            })
            $timeout(function () {
                $ionicLoading.hide();
            }, 1000);

            $scope.loginModal.show()
                         
        }

    };

    $scope.applyGroup = function(){
        var curUser = AV.User.current();
        if (curUser){
            $state.go('tab.job-group',{id:id})
        }else{
            $ionicLoading.show({
                template:'请先登录！'
            })
            $timeout(function () {
                $ionicLoading.hide();
            }, 1000);

            $scope.loginModal.show()            
        }
        
    };



    //share
    $scope.share = function(title, desc, url, thumb) {
        $ionicActionSheet.show({
            buttons: [
                { text: '分享至微信朋友圈' },
                { text: '分享给微信好友' },
                { text: '举报'}
            ],
            titleText: '分享',
            cancelText: '取消',
            cancel: function() {
                // 取消时执行
            },
            buttonClicked: function(index) {
                if(index == 0) {
                    $scope.shareViaWechat(WeChat.Scene.timeline);
                }
                if(index ==1 ) {
                    $scope.shareViaWechat(WeChat.Scene.session);
                }
            }
        });
    };

    $scope.shareViaWechat = function(scene) {
        // 创建消息体
        var msg = {
            title: $scope.job.title,
            description: $scope.job.work_content,
            url: "www.ebuyme.cn:8101",
            thumb: "http://ac-dyaewuws.clouddn.com/6a186bed4b06fe45.png"
        };
        WeChat.share(msg, scene, function() {
            $ionicPopup.alert({
                title: '分享成功',
                template: '感谢您的支持！',
                okText: '关闭'
            });
        }, function(res) {
            $ionicPopup.alert({
                title: '分享失败',
                template: '错误原因：' + res + '。',
                okText: '我知道了'
            });
        });
    };







})

//jobgroup

.controller('JobGroupCtrl',function($scope,$rootScope,$ionicModal,$state,$ionicTabsDelegate,$timeout,$stateParams,$ionicLoading,$ionicPopup,AVFactory,Storage,$ionicActionSheet){

    var HUD = function(template){

        $ionicLoading.show({
            template:template
        })

        $timeout(function(){
            $ionicLoading.hide()
        },1500);
    };

    $scope.$on('$ionicView.beforeEnter', function() {

        $rootScope.hideTabs = 'tabs-item-hide';
    });
    var id = $stateParams.id;
    $scope.job = Storage.get(id);

    $scope.searchBar = true;
    $scope.joinBar = false;
    $scope.myBar = false;

    $scope.doRefresh = function(){
        AVFactory.showGroup(id);
        AVFactory.searchRemain(id);
    };
    $scope.doRefresh();
    
    $scope.$on('jobgroupLoadSuccess',function(_,results){
        $scope.groups = results;
        $scope.numGroups = results.length;
        $scope.$broadcast('scroll.refreshComplete');

    })

    $scope.$on('searchRemainSuccess',function(_,remain){
        $scope.remain = remain;
    })

    $scope.$on('groupPostJobObject',function(_,object){
        $scope.remain = 0;
        if (object._serverData.remain){
            $scope.remain = object._serverData.remain ;
        }else{
            $scope.remain = parseInt(object._serverData.job._serverData.recruit_num * 1.3);
        }
        $scope.postJob = object;
        var work_days = getDays($scope.postJob._serverData.job._serverData.work_days[0].date,$scope.postJob._serverData.job._serverData.work_days[1].date)
        $scope.rewardPerPerson = parseInt($scope.postJob._serverData.commandReward) * work_days.length;
    })

   $ionicModal.fromTemplateUrl('views/job/groupDesc.html',{
        scope:$scope
    }).then(function(modal){
        $scope.groupDescModal = modal;
    });   

    $scope.groupGuide = function(){
        $scope.groupDescModal.show();
    };




    $scope.showcreateGroup = function(){

        var JobGroup = AV.Object.extend("JobGroup");
        var query = new AV.Query(JobGroup);
        query.equalTo('command',AV.User.current());
        query.equalTo('job',$scope.job);
        query.find({
            success:function(results){
                if (results.length > 0){
                    HUD('您已经在该职位下创建过团了！');
                }else{


                    
                    $scope.createGroupModal.show()
                }
            },error:function(_,error){
                HUD(error.message);
            }
        })
        

    };

    $scope.createGroup = function(){
        if($scope.createGroupParams.name.length == 0){
            HUD('请填写团队名称');
        }else if ($scope.createGroupParams.num > $scope.remain){
            HUD('剩余名额仅剩'+$scope.remain+'人');
        }else if ($scope.createGroupParams.num < 5){
            HUD('5人以上才可以成团');
        }else{
           AVFactory.createGroup($scope.createGroupParams) 
        }
        

    };

    $scope.inputCode = '';

    $scope.searchGroupByCode = function(){
        AVFactory.searchGroupByCode($scope.inputCode,$scope.job);
    }

    $scope.$on('searchGroupByCodeSuccess',function(_,results){
        $scope.groups = results;

    })

    $scope.$on('createGroupSuccess',function(_,object){
        $scope.doRefresh();
        $scope.createGroupModal.hide();

    });




    $scope.searchGroup = function(){

        $scope.searchBar = true;
        $scope.joinBar = false;
        $scope.myBar = false;
        $scope.doRefresh();        
    };


    $scope.applyJoinGroup = function(group){
        var user = AV.User.current();
        if (group._serverData.command.id == user.id){
            HUD('请不要申请加入自己组建的团');
        }else if (group._serverData.members.contains(user)){
            HUD('您已经加入该团了');
        }else{
            AVFactory.applyJoinGroup(group);           
        }
        
    };



    $ionicModal.fromTemplateUrl('views/job/createGroup.html',{
        scope:$scope
    }).then(function(modal){
      $scope.createGroupModal = modal;
    });

    $scope.createGroupParams = {
        jobid:id,
        name:'',
        num:5,
        walfare:'1%',
        deadline:$scope.job.work_days[0]
    };



})

















