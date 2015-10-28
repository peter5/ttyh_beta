angular.module('starter.controllers', [])
.controller('AppCtrl',function($scope){

})

.controller('searchCtrl',function($scope,$ionicLoading,$timeout,$ionicModal,$location){



    var HUD = function(template){

        $ionicLoading.show({
          template:template
        });

        $timeout(function(){
          $ionicLoading.hide();
        },1500);
    };


    $scope.loginData = {};
    $scope.priceParams = {
        command:'',
        member:''
    };

    var user = AV.User.current();
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,

    }).then(function(modal) {
        $scope.modal = modal;
        if (user){
            $scope.doRefresh();
        }else{
            $scope.modal.show();
        }        


    });


    $ionicModal.fromTemplateUrl('templates/price.html', {
      scope: $scope
    }).then(function(modal) {
        $scope.priceModal = modal;
    });

    var PostJobSession = AV.Object.extend("PostJobSession");
    $scope.doRefresh = function(){

        $ionicLoading.show({template:'连接中...'})      
        var query = new AV.Query(PostJobSession);
        query.include('postUser');
        query.include('job');
        query.descending('updatedAt');
        query.doesNotExist('groupReward');
        query.find({
            success:function(results){
                $scope.jobs_unedit = results;
                $ionicLoading.hide();
                var query2 = new AV.Query(PostJobSession);
                query2.include('postUser');
                query2.include('job');
                query2.descending('createdAt');
                query2.exists('commandReward');
                query2.find({
                    success:function(results2){
                        $scope.jobs = $scope.jobs_unedit.concat(results2);
                        $ionicLoading.hide();
                    },error:function(_,error){
                        $ionicLoading.hide();
                        HUD(error.message);
                    }
                })
            },
            error:function(_,error){            
                HUD(error.message);
            }
        })

    };


    $scope.login = function(){
        AV.User.logIn($scope.loginData.username,$scope.loginData.password,{
            success:function(user){
                if (user._serverData.admin){
                    $scope.modal.hide();
                    $scope.doRefresh();
                    location.reload(true);
                    HUD('登录成功');
                }
            },
            error:function(_,error){
                HUD(error.messge);
            }

        })
    };

    $scope.showModal = function(job){
        $scope.currentJob = job;
        $scope.priceModal.show();
    };

    $scope.savePrice = function(){
        
        $ionicLoading.show({template:'保存中...'})
        if ($scope.priceParams.command.length == 0){
            HUD('请输入团长奖励金额');
        }else if ($scope.priceParams.member.length == 0){
            HUD('请输入团员奖励金额');
        }else{
            $scope.currentJob.set('commandReward',$scope.priceParams.command);
            $scope.currentJob.set('memberReward',$scope.priceParams.member);
            $scope.currentJob.set('groupReward',true);
            $scope.currentJob.save().then(function(obj){
                $ionicLoading.hide();
                $scope.doRefresh();
                $scope.priceModal.hide();
                HUD('保存成功');
            },function(error){
                HUD(error.message)
            })
        }


    };

    $scope.inputName = {};
    $scope.searchByName = function(){
        if (user){
            if($scope.inputName.text == 0){
                $scope.doRefresh();
            }else{
                $ionicLoading.show({template:'连接中...'}) 
                var Job = AV.Object.extend('data');
                var jobquery = new AV.Query(Job);
                jobquery.startsWith('title',$scope.inputName.text);     
                var query = new AV.Query(PostJobSession);
                query.matchesQuery('job',jobquery);
                query.include('job');
                query.find({
                    success:function(results){
                        $ionicLoading.hide();
                        $scope.jobs = results;
                        console.log(results.length)
                    },error:function(_,error){
                        $ionicLoading.hide();
                        HUD(error.message);
                    }
                })
             
            }


        }

    };

})  

.controller('browseCtrl',function($scope,$ionicLoading,$timeout,$ionicModal,$ionicPopup){

    var HUD = function(template){

        $ionicLoading.show({
          template:template
        });

        $timeout(function(){
          $ionicLoading.hide();
        },1500);
    };

    var WalletWithdraw = AV.Object.extend("WalletWithdraw");


    $scope.doRefresh = function(){
        var query = new AV.Query(WalletWithdraw);
        $ionicLoading.show({template:'连接中...'});
        query.equalTo('status','处理中');
        query.include('wallet');
        query.find({
            success:function(results){
                $scope.withdraws = results;
                console.log(results);
                $ionicLoading.hide();
            },
            error:function(_,error){
                $ionicLoading.hide();
                HUD(error.message);
            }
        })        
    };
    $scope.didRefresh = function(){
        var query = new AV.Query(WalletWithdraw);
        $ionicLoading.show({template:'连接中...'});
        query.equalTo('status','已处理');
        query.include('wallet');
        query.find({
            success:function(results){
                $scope.withdraws = results;
                $ionicLoading.hide();
            },
            error:function(_,error){
                $ionicLoading.hide();
                HUD(error.message);
            }
        })         
    }

    $scope.doRefresh();
    $scope.bar = true;

    $scope.underprocess = function(){
        $scope.bar = true;
        $scope.doRefresh();
    };

    $scope.processed = function(){
        $scope.bar = false;
        $scope.didRefresh();
    };
    $scope.mark = function(withdraw){
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '该比提现已处理完成?'
        });
        confirmPopup.then(function(res) {
        if(res) {
            withdraw.set('status','已处理');
            $ionicLoading.show({template:"保存中..."})
            withdraw.save().then(function(){
                $scope.doRefresh();
                $ionicLoading.hide();
                HUD('标记完成！');
            })
        }else{
        
        }
    });
    };

})
