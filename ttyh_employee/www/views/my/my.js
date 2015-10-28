angular.module('Oddjobs')

//我的
.controller('MyCtrl', function($scope, $state, $location, $timeout,$ionicModal, $ionicPopup, $ionicLoading, Storage){
  

  console.log("enter My Ctrl");

  // viewWillAppear
  $scope.$on('$ionicView.beforeEnter', function(){
      var user = AV.User.current()
      
      var codeMat = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
      var index = Math.floor((Math.random()*codeMat.length));
      var phone = user._serverData.username.substring(user._serverData.username.length - 4,user._serverData.username.length);
      if (user._serverData.personal_invite_code){
          $scope.inviteCode = user._serverData.personal_invite_code;
      }else{
          $scope.inviteCode = codeMat[index] + phone;
          user.set('personal_invite_code',code);
          user.save()
      }
  });

  //viewDidLoad
  $scope.$on('$ionicView.afterEnter', function(){

  });

  //viewWillDisappear
  $scope.$on('$ionicView.beforeLeave', function(){
    //
  });


  // get current user
  $scope.currentUser = AV.User.current()
  $scope.loginName = $scope.currentUser || null;
  $scope.LoginState = true
  $scope.transferLoginState = function(){
    $scope.LoginState = true
  }

  $scope.transferSignupState = function(){
    $scope.LoginState = false
  }

  $ionicModal.fromTemplateUrl('views/my/login.html',{
      scope:$scope
  }).then(function(modal){
    $scope.loginModal = modal;
  });

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
          $timeout(function(){
              $ionicLoading.hide()
          },1000);

      }, function(err){
          console.log(err)
      });



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
            $ionicLoading.hide()
            $scope.loginModal.hide()
            location.reload(true)
            $ionicLoading.show({
            template:"登录中..."
          })
            $timeout(function () {
            $ionicLoading.hide();
            }, 1000);
            

        },
          error: function(user, error) {
            $ionicLoading.hide();
            console.log(error)
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

  }

  $scope.logout = function() {

      AV.User.logOut()
      $ionicLoading.show({
          template:"正在退出..."
      })
      $timeout(function () {
          $ionicLoading.hide();
      }, 1000)
      location.reload(true)
  }




    // do login
})
//个人资料
.controller('ResumeCtrl', function($scope, $ionicModal,$state, $rootScope, $timeout,
    $ionicLoading, $ionicPopup, $log, User, My){

    var currentUser = AV.User.current()._serverData
    console.log(currentUser)
    $scope.resumeParams = {
        name:currentUser.realname,
        phone:currentUser.username,
        gender:currentUser.gender,
        region:currentUser.region,
        birthyear:currentUser.birthyear,
        desc:currentUser.desc
    }



    $ionicModal.fromTemplateUrl('views/my/region.html',{
        scope:$scope
    }).then(function(modal){
      $scope.regionModal = modal;
    });


    $scope.optionSelected = ''

    $scope.saveProfile = function(){

        var user = AV.User.current()
        user.set('gender',$scope.resumeParams.gender)
        user.set('region',$scope.resumeParams.region)
        user.set('birthyear',$scope.resumeParams.birthyear)
        user.set('desc',$scope.resumeParams.desc)
        user.save(null,{
          success:function(user){
              
              $ionicLoading.show({
              template:"修改资料成功"
              })
              $timeout(function () {
                  $ionicLoading.hide();
              }, 1000)
          }

        })
        
    }

    $scope.genders = [
      {name:'---',tag:'M'},
      {name:'男',tag:'M'},
      {name:'女',tag:'F'}
    ]

    //$scope.region = ['东城区','西城区','崇文区','宣武区','朝阳区','海淀区','丰台区','石景山区','通州区','平谷区','顺义区','怀柔区','昌平区','门头沟区','房山区','大兴区','密云县','延庆县']
    $scope.region = [{"text":"---","checked":false},{"text": "\u4e1c\u57ce\u533a", "checked": false}, {"text": "\u897f\u57ce\u533a", "checked": false}, {"text": "\u5d07\u6587\u533a", "checked": false}, {"text": "\u5ba3\u6b66\u533a", "checked": false}, {"text": "\u671d\u9633\u533a", "checked": false}, {"text": "\u6d77\u6dc0\u533a", "checked": false}, {"text": "\u4e30\u53f0\u533a", "checked": false}, {"text": "\u77f3\u666f\u5c71\u533a", "checked": false}, {"text": "\u901a\u5dde\u533a", "checked": false}, {"text": "\u5e73\u8c37\u533a", "checked": false}, {"text": "\u987a\u4e49\u533a", "checked": false}, {"text": "\u6000\u67d4\u533a", "checked": false}, {"text": "\u660c\u5e73\u533a", "checked": false}, {"text": "\u95e8\u5934\u6c9f\u533a", "checked": false}, {"text": "\u623f\u5c71\u533a", "checked": false}, {"text": "\u5927\u5174\u533a", "checked": false}, {"text": "\u5bc6\u4e91\u53bf", "checked": false}, {"text": "\u5ef6\u5e86\u53bf", "checked": false}]
    $scope.years = ['---','1960', '1961', '1962', '1963', '1964', '1965', '1966', '1967', '1968', '1969', '1970', '1971', '1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979', '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997']
    //$scope.jobs = ['送餐','保洁','家教','分拣','快递']
    $scope.jobs = [{"text": "\u9001\u9910", "checked": false}, {"text": "\u4fdd\u6d01", "checked": false}, {"text": "\u5bb6\u6559", "checked": false}, {"text": "\u5206\u62e3", "checked": false}, {"text": "\u5feb\u9012", "checked": false}]


    $scope.genderPicker = function(optionSelected){
        console.log(optionSelected)
        console.log('Updated');
    };
})


//Invite

.controller('InviteCtrl', function($scope){

    $scope.clickTab = 'processing';
    var user = AV.User.current();
    $scope.changeTab = function(tab){
        $scope.clickTab = tab;
    };

    $scope.reward = 0;
    var JobSession = AV.Object.extend("JobSession");
    var userquery = new AV.Query(AV.User);
    userquery.equalTo('invite_code',user._serverData.personal_invite_code);
    userquery.find({
        success:function(users){
            $scope.users = users
        }
    })

})

//wallet
.controller('WalletCtrl',function($scope,AVFactory,$ionicLoading,$ionicPopup,$timeout){

    var HUD = function(template){

      $ionicLoading.show({
          template:template
      })

      $timeout(function(){
            $ionicLoading.hide()
        },1500);
    };    
    var user = AV.User.current();
    var WalletWithdraw = AV.Object.extend("WalletWithdraw");
    var WalletObject = AV.Object.extend("Wallet");
    var query = new AV.Query(WalletObject);
    $ionicLoading.show({template:"连接中..."});
    query.equalTo('user',user);
    query.first().then(function(object){
        if (object){
            $scope.wallet = object;
            var q = new AV.Query(WalletWithdraw);
            q.equalTo('wallet',object);
            q.descending('createdAt');
            q.find({
                success:function(results){
                    $scope.withdraw = results;
                    $ionicLoading.hide();
                },
                error:function(_,error){
                    $ionicLoading.hide();
                    HUD(error.message);
                }
            })

        }else{
            $ionicLoading.hide();
            $scope.wallet = null;
            $scope.withdraw = [];
        }

    });

    
    $scope.withDraw = function(){
        $scope.withdraw_mount = {
            num:$scope.wallet._serverData.balance
        }
        if ($scope.wallet._serverData.balance == 0){
            HUD('余额为0，无法提现');
        }else{
            var myPopup = $ionicPopup.show({
                template: '<input  ng-model="withdraw_mount.num" style="text-align:center;">',
                title: '余额提现',
                subTitle: '不超过'+$scope.wallet._serverData.balance+'元，不足300收取手续费3元，满（300）免手续费',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '<b>提现</b>',
                        type: 'button-balanced',
                        onTap: function(e) {

                            if ($scope.withdraw_mount.num > $scope.wallet._serverData.balance){
                                HUD('提现失败，提现金额不能多余您的余额');
                                $scope.withdraw_mount.num = $scope.wallet._serverData.balance
                                e.preventDefault();
                            }else{
                                AVFactory.withdraw($scope.withdraw_mount.num,$scope.wallet);
                            }
                            
                        }
                    },
                ]
              });
               
            }
    };

    $scope.$on('withdrawSuccess',function(_,obj){
        $scope.wallet = obj;
        var q = new AV.Query(WalletWithdraw);
        q.equalTo('wallet',$scope.wallet);
        q.descending('createdAt');
        q.find({
            success:function(results){
                $scope.withdraw = results;
            },
            error:function(_,error){
                HUD(error.message);
            }
        })        
    })

})

//addwallet
.controller('AddWalletCtrl',function($scope,AVFactory){

    $scope.bankCard = {
        num:'',
        name:'',
        bank:'',
        branch:'',
        contact:''
    };

    $scope.saveBankCard = function(){

        if ($scope.bankCard.num.length == 0){
            HUD('请填写银行卡号');
        }else if ($scope.bankCard.name.length == 0){
            HUD('请填写账户姓名');
        }else if ($scope.bankCard.bank.length == 0){
            HUD('请填写开户银行');
        }else{
            AVFactory.saveBankCard($scope.bankCard);
        }

    };
})

































