angular.module('starter.services', [])

//本地存储
.factory('Storage', function($window){
  var append = function(key, value){
  };
  var save = function(key, value){
    $window.localStorage.setItem(key, typeof value == 'object' ? JSON.stringify(value) : value);
  };
  var get = function(key){
    return $window.localStorage.getItem(key) || null;
  };
  var remove = function(key){
    $window.localStorage.removeItem(key);
  };

  return {
    append: append,
    save: save,
    get: get,
    remove: remove
  };
})

.factory('SettingFactory', function(Storage){
  var setting = JSON.parse(Storage.get('setting'));
  var get = function(key){
    return !!key ? (setting[key] || null) : setting;
  };
  var save = function(){
    if ( arguments.length > 1 ) {
      setting[arguments[0]] = arguments[1];
    } else {
      setting = arguments[0];
    }
    Storage.save('setting', setting);
  };
  var remove = function(key){
    save(key, null);
  };
  return {
    save: save,
    get: get,
    remove: remove
  };
})
//获取设备信息
.factory('CommonService', function($http, $rootScope, Storage){

  return {

    getIOSVersion: function(){

      return $http.post(LXS.api + "/getIOSVersion.do")
          .success(function(data,status,headers,config){
            $rootScope.$broadcast('lxs.IOSVersionUpdate',data);
          });
    },
    getAndroidVersion: function() {

          return $http.post(LXS.api + "/getAndroidVersion.do")
              .success(function(data, status, headers, config) {

                $rootScope.$broadcast('lxs.AndroidVersionUpdate', data);
          });
    }
  

  };
})
//httpManager
.factory('AVFactory',function(Storage,$state,$ionicLoading,$timeout,$rootScope,$ionicPopup){


  //alert
  var HUD = function(template){

    $ionicLoading.show({
      template:template
    });

    $timeout(function(){
      $ionicLoading.hide();
    },1500);
  };

  var JobObject = AV.Object.extend("data");
  var PostJobSession = AV.Object.extend("PostJobSession");
  var JobSession = AV.Object.extend("JobSession");
  var JobSessionHistory = AV.Object.extend("JobSessionHistory");
  var Authentication = AV.Object.extend("Authentication");
  var JobGroup = AV.Object.extend('JobGroup');
  var user = AV.User.current(); 

  return {

    startJob:function(job){

          $ionicLoading.show({template:"连接中..."});
          var today = new Date();
          var todaystr = today.getFullYear()*365 +(today.getMonth()+1)*31 + today.getDate();
          var startstr = job._serverData.work_days[0].year *365  + (job._serverData.work_days[0].month + 1) * 31 + job._serverData.work_days[0].day
          var query = new AV.Query(PostJobSession);
          query.equalTo('job',job);
          query.first().then(function(object){
              $ionicLoading.hide()
              if (object._serverData.status == 'waiting'){

                  if (todaystr >= startstr){

                      var confirmPopup = $ionicPopup.confirm({
                          title: '开工！',
                          template: '提醒被录用者今天是开工日期'
                      });
                      confirmPopup.then(function(res) {
                          if(res) {
                              $ionicLoading.show({template:"连接中..."});
                              object.set('status','processing');
                              object.save();
                              var queryJobS = new AV.Query(JobSession);
                              queryJobS.equalTo('job',job);
                              queryJobS.equalTo('status',1);
                              queryJobS.find().then(function(results){
                                  for (var i in results){
                                      var jobs = results[i];
                                      jobs.set('status',2);
                                      jobs.save().then(function(js){
                                          var queryhis = new AV.Query(JobSessionHistory);
                                          queryhis.equalTo('jobsession',js);
                                          queryhis.first({
                                              success:function(jobhis){
                                                  $ionicLoading.hide();
                                                  jobhis.set('working',js.updatedAt);
                                                  jobhis.save();
                                              },error:function(error){
                                                  $ionicLoading.hide();
                                                  HUD(error.message);
                                              }
                                          });
                                      })
                                  };
                              });
                              
                              var groupquery = new AV.Query(JobGroup);
                              groupquery.equalTo('jobId',job.id);
                              groupquery.find({
                                  success:function(groups){
                                      if (groups.length > 0){
                                          for (var i=0;i<groups.length;i++){
                                              groups[i].set('state',1);
                                              groups[i].save();
                                          }
                                      }
                                  }
                              })
                              

                              HUD('开工！');
                          } 
                      });


                  }else{
                      HUD('还未到开工时间');
                  }

              }else if(object._serverData.status == 'stopped'){
                  HUD('该工作已经停止招聘了');
              }else if(object._serverData.status == 'processing'){
                  HUD('该职位已经开工啦！');
              }else if(object._serverData.status == 'completed'){
                  HUD('该职位已经完工啦！');
              }
          });
    },

    finishJob:function(job){
          $ionicLoading.show({template:"连接中..."});
          var today = new Date();
          var todaystr = today.getFullYear()*365 +(today.getMonth()+1)*31 + today.getDate();
          var endstr = job._serverData.work_days[1].year *365  + (job._serverData.work_days[1].month + 1) * 31 + job._serverData.work_days[1].day
          var query = new AV.Query(PostJobSession);
          query.equalTo('job',job);
          query.first().then(function(object){
              if (object._serverData.status == 'processing'){

                  if (todaystr >= endstr){
                      var confirmPopup = $ionicPopup.confirm({
                          title: '提示',
                          template: '完工后请及时发放工人的薪资'
                      });
                      confirmPopup.then(function(res) {
                          if(res) {
                              object.set('status','completed');
                              object.save();
                              var queryJobS = new AV.Query(JobSession);
                              queryJobS.equalTo('job',job);
                              queryJobS.equalTo('status',2);
                              queryJobS.find().then(function(results){
                                  for (var i in results){
                                      var jobs = results[i];
                                      console.log(jobs);
                                      jobs.set('status',3);
                                      jobs.save().then(function(js){
                                          var queryhis = new AV.Query(JobSessionHistory);
                                          queryhis.equalTo('jobsession',js);
                                          queryhis.first({
                                              success:function(jobhis){
                                                  jobhis.set('completeing',js.updatedAt);
                                                  jobhis.save().then(function(){
                                                      $ionicLoading.hide();
                                                  }),function(errors){
                                                      $ionicLoading.hide();
                                                  }
                                              }
                                          });
                                      })
                                  };
                              });



                              var groupquery = new AV.Query(JobGroup);
                              groupquery.equalTo('jobId',job.id);
                              groupquery.find({
                                  success:function(groups){
                                      if (groups.length > 0){
                                          for (var i=0;i<groups.length;i++){
                                              groups[i].set('state',2);
                                              groups[i].save();
                                          }
                                      }
                                  }
                              })
                              HUD('完工！') 
                          } 
                      });
                  }else{
                      HUD('还未到完工时间')
                  }


              }else if(object._serverData.status == 'stopped'){
                  HUD('该工作已经停止招聘了');
              }else if(object._serverData.status == 'waiting'){
                  HUD('该职位还没有开工！');
              }else if(object._serverData.status == 'completed'){
                  HUD('该职位已经完工啦！');
              }
          });        
    },

    stopJob:function(job){
        var num_required = parseInt(job._serverData.recruit_num)
        var query = new AV.Query(PostJobSession);
        query.equalTo('job',job);
        query.first().then(function(object){
            if (object._serverData.status == 'waiting'){
                var numPassing = object._serverData.passing.length;
                if (numPassing < num_required){
                    var confirmPopup = $ionicPopup.confirm({
                        title: '已招聘'+numPassing+'/'+num_required+',未招满',
                        template: '停止招聘将无法重新开启，确定要关闭吗？'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                             object.set('status','stopped');
                             object.save().then(function(){
                                  HUD('停止招聘！');
                             })
                        } 
                    });                    
                }else if (numPassing >= num_required){
                    var confirmPopup = $ionicPopup.confirm({
                        title: '已招聘'+numPassing+'/'+num_required+',已招满',
                        template: '停止招聘将无法重新开启，确定要关闭吗？'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                             object.set('status','stopped')
                             object.save().then(function(){
                                  HUD('停止招聘！');
                             })                              
                        } 
                    });                    
                }


            }else if(object._serverData.status == 'processing'){
                HUD('该职位已经开工啦！');
            }else if(object._serverData.status == 'completed'){
                HUD('该职位已经完工啦！');
            }else if(object._serverData.status == 'stopped'){
                HUD('该工作已经停止招聘了');
            }
        });      
    },

    postJob:function(params){
        $ionicLoading.show({template:"职位发布中..."})
        if (user._serverData.conform == 1){
            if(params.title.length == 0){
                HUD('请填写工作名称')
            }else if (params.work_type.length == 0){
                HUD('请填写工作类型')
            }else if (params.recruit_num.length == 0){
                HUD('请填写招聘人数')
            }else if (params.work_days.length == 0){
                HUD('请选择工作日期')
            }else if (params.work_hour.length == 0){
                HUD('请填写工作时间')
            }else if (params.work_region.length == 0){
                HUD('请选择工作所在区域')
            }else if (params.work_location.length == 0){
                HUD('请填写工作具体地址')
            }else if (params.pay_unit.length == 0){
                HUD('请填写薪资单位')
            }else if (params.pay_qty.length == 0){
                HUD('请填写薪资数量')
            }else if (params.pay_type.length == 0){
                HUD('请填写支付方式')
            }else if (params.contact.length == 0){
                HUD('请填写联系人')
            }else if (params.contact_num.length == 0){
                HUD('请填写联系人电话')
            }else {
            var Job = new JobObject();
            Job.set('title',params.title);
            Job.set('work_type',params.work_type);
            Job.set('recruit_num',params.recruit_num);
            Job.set('work_days',params.work_days);
            Job.set('work_hour',params.work_hour);
            Job.set('work_region',params.work_region);
            Job.set('work_location',params.work_location);
            Job.set('pay_unit',params.pay_unit);
            Job.set('pay_qty',params.pay_qty);
            Job.set('pay_type',params.pay_type);
            Job.set('gender_requirement',params.gender_requirement);
            Job.set('special_requirement',params.special_requirement);
            Job.set('contact',params.contact);
            Job.set('contact_num',params.contact_num);
            Job.set('work_desc',params.work_desc);
            Job.set('work_content',params.work_content);
            Job.set('recruit_requirement',params.recruit_requirement);
            Job.set('pay_rule',params.pay_rule);
            Job.set('postUser',user);
            Job.set('company',user._serverData.companyName);
            Job.set('work_day_str',params.work_day_str)
            Job.save(null,{
              success:function(job){
                  HUD('发布成功!');

                  var postjs = new PostJobSession();
                  postjs.set('postUser',user);
                  postjs.set('job',job);
                  postjs.set('status','waiting');
                  postjs.set('applying',new Array());
                  postjs.set('passing',new Array());
                  postjs.set('rejecting',new Array());
                  postjs.set('remain',parseInt(params.recruit_num * 1.3));
                  postjs.save().then(function(obj){
                      $ionicLoading.hide();
                  }),function(error){
                      $ionicLoading.hide();
                      HUD(error.message);
                  }

                  $rootScope.$broadcast('postJobSuccess')
              },
              error:function(_,error){
                  HUD(error.message) ;
              }
            })

            }



        }else{
            HUD('企业认证后才可以发布职位')
        }
    },

    signup:function(params){

      $ionicLoading.show({template:"连接中..."});
      var newuser = new AV.User();

      var query = new AV.Query(AV.User);
      query.equalTo('username',params.username);
      query.find({
          success:function(results){
              if (results.length > 0){
                  HUD('该手机号已注册')
              }else{
                  newuser.signUpOrlogInWithMobilePhone({
                    mobilePhoneNumber:params.username,
                    smsCode:params.verify_code,
                    username:params.username,
                    usertype:'employer',
                    conform:0,
                    invite_code:params.invite_code
                  },{
                    success:function(user){
                      
                      $rootScope.$broadcast('signupSucceed');
                      user.set('password',params.password);
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

    },

    uploadAvatar:function(file){

        user.set('avatar',file);
        user.save();
    },

    login:function(params){
      $ionicLoading.show({template:"登录中..."})

      AV.User.logIn(params.username, params.password, {
          success: function(user) {
            $ionicLoading.hide();
            
            HUD('登录成功！');
            $rootScope.$broadcast('loginSucceed')         
          },
          error: function(user, error) {
            $ionicLoading.hide();
            if (error.code == 210){
                HUD('用户名或密码错误')
            }else{
               HUD(error.message); 
            }
            
        } 
      });      
    },

    sendCode:function(phone){

      AV.Cloud.requestSmsCode(phone).then(function(){
          HUD('验证码已发送！');
      }, function(err){
          HUD(err.message);
      });

    },

    fetchJobs:function(){
        $ionicLoading.show({template:"连接中..."})
        var query = new AV.Query(PostJobSession);
        query.equalTo('postUser',user);
        query.descending('updatedAt');
        query.include('postUser');
        query.include('job');
        query.find({
            success:function(results){
              $ionicLoading.hide();
               $rootScope.$broadcast('fetchJobsSuccessed',results); 
            },
            error:function(_,error){
              $ionicLoading.hide();
                HUD(error.message);
            }
        })
    },

    auth:function(params){

        $ionicLoading.show({template:"资料提交中"});
        if (params.yyzz.length == 0){
            HUD('请上传营业执照！');
        }else if (params.sfz.length == 0){
            HUD('请上传身份证！');
        }else if (params.contact.length == 0){
            HUD('请填写联系人！');
        }else if (params.contact_num.length == 0){
            HUD('请填写联系电话');
        }else{


            var auth = new Authentication();
            auth.set('licence',params.yyzz);
            auth.set('idcard',params.sfz);
            auth.set('contact',params.contact);
            auth.set('contact_num',params.contact_num);
            auth.set('position',params.position);
            auth.set('postUser',user);
            auth.set('status',0);
            auth.set('message','');

            auth.save().then(function(obj){
                HUD('申请认证成功，我们会尽快处理！');
                $ionicLoading.hide();
                $state.go('tab.my');
            }),function(error){
                $ionicLoading.hide();
                HUD(error.message);
            }

        }
    },

    postJobSession:function(tab){
        $ionicLoading.show({template:"连接中..."})
        var query = new AV.Query(PostJobSession);
        query.equalTo('postUser',user);
        query.descending('updatedAt');
        query.include('job');
        query.include('postUser');
        query.include('passing.JobSession');
        query.include('applying.JobSession');
        query.include('rejecting.JobSession');
        query.equalTo('status',tab);
        query.find({
            success:function(results){
                $rootScope.$broadcast('postJobSessionSuccessed',results);
                $ionicLoading.hide();
            },
            error:function(_,error){
                $ionicLoading.hide();
                HUD(error.message);
            }
        })
    },

    jobDetail:function(jobid){
        $ionicLoading.show({template:'连接中...'});
        var query = new AV.Query(JobObject);
        query.get(jobid,{
            success:function(result){
              $ionicLoading.hide();
                $rootScope.$broadcast('jobDetailFetchSucceed',result._serverData); 
            },
            error:function(_,error){
              $ionicLoading.hide();
                HUD(error.message);
            }
        })
    },

    accept:function(jobsessionId){
        $ionicLoading.show({template:"连接中..."})
        var query = new AV.Query(JobSession);
        query.include('group');
        query.get(jobsessionId,{
            success:function(object){
                object.set('status',1);
                object.save(null,{
                    success:function(result){
                        
                        var history = new AV.Query(JobSessionHistory);
                        history.equalTo('jobsession',result);
                        history.first({
                            success:function(object){
                                object.set('passing',result.updatedAt);
                                object.save();
                            }
                        });

                        //group
                        var group = result._serverData.group;
                        if (group){
                            var left = group._serverData.num_left;
                            if (left){
                                group.set('num_left',left - 1);
                                group.save();
                            }else{
                                group.set('num_left',group._serverData.num - 1);
                                group.save();
                            }
                        }




                        var postJobSession = new AV.Query(PostJobSession);
                        postJobSession.equalTo('job',result._serverData.job);
                        postJobSession.first({
                            success:function(object){
                                var applymat = object._serverData.applying;
                                for (var i in applymat){
                                    var js = applymat[i]
                                    if (js == result.id){
                                        applymat.splice(i, 1);
                                        break
                                    }

                                }
                                var passingmat = object._serverData.passing;
                                passingmat.push(result.id);

                                object.set('applying',applymat);
                                object.set('passing',passingmat);
                                if(object._serverData.remain){
                                    object.set('remain')
                                }

                                object.save().then(function(){
                                    $ionicLoading.hide();
                                })
                                HUD('录用成功，请与应聘者及时沟通！');
                                $rootScope.$broadcast('acceptCompleted')

                            }
                        })
                    }
                })
                
                
                



            }
        })
    },

    reject:function(jobsessionId){
      $ionicLoading.show({template:'连接中...'});
        var query = new AV.Query(JobSession);
        query.get(jobsessionId,{
            success:function(object){
                object.set('status',4);
                object.save(null,{
                    success:function(result){
                        HUD('拒绝成功！');
                        var history = new AV.Query(JobSessionHistory);
                        history.equalTo('jobsession',result);
                        history.first({
                            success:function(object){
                                object.set('rejecting',result.updatedAt);
                                object.save();
                            }
                        });

                        var postJobSession = new AV.Query(PostJobSession);
                        postJobSession.equalTo('job',result._serverData.job);
                        postJobSession.first({
                            success:function(object){
                                var applymat = object._serverData.applying;
                                for (var i in applymat){
                                    var js = applymat[i];
                                    if (js == result.id){
                                        applymat.splice(i, 1);
                                        break
                                    }

                                }
                                var passingmat = object._serverData.rejecting;
                                passingmat.push(result.id);

                                object.set('applying',applymat);
                                object.set('rejecting',passingmat);
                                object.save().then(function(){
                                    $ionicLoading.hide();
                                })
                                $rootScope.$broadcast('rejectCompleted')

                            }
                        })
                    }
                })
                
                
                



            }
        })
    }
  }

})
