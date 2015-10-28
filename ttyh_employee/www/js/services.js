//各种定制化服务

angular.module('Oddjobs.services',[])

//本地存储
.factory('Storage', function($window){

	
	var append = function(key, value){
	};
	var save = function(key, value){
		$window.localStorage.setItem(key, typeof value == 'object' ? JSON.stringify(value) : value);
		
	};
	var get = function(key){
		return JSON.parse($window.localStorage.getItem(key)) || null;
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
.factory('CommonService', function($http, $rootScope, LXS, Storage){

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


.factory('HttpFactory', function($http, $ionicPopup, $ionicLoading, Storage){

	/**
	 * method – {string} – HTTP method (e.g. 'GET', 'POST', etc)
	 * url – {string} – Absolute or relative URL of the resource that is being requested.
	 * params – {Object.<string|Object>} – Map of strings or objects which will be turned to ?key1=value1&key2=value2 after the url. If the value is not a string, it will be JSONified.
	 * data – {string|Object} – Data to be sent as the request message data.
	 * headers – {Object} – Map of strings or functions which return strings representing HTTP headers to send to the server. If the return value of a function is null, the header will not be sent.
	 * xsrfHeaderName – {string} – Name of HTTP header to populate with the XSRF token.
	 * xsrfCookieName – {string} – Name of cookie containing the XSRF token.
	 * transformRequest – {function(data, headersGetter)|Array.<function(data, headersGetter)>} – transform function or an array of such functions. The transform function takes the http request body and headers and returns its transformed (typically serialized) version. See Overriding the Default Transformations
	 * transformResponse – {function(data, headersGetter)|Array.<function(data, headersGetter)>} – transform function or an array of such functions. The transform function takes the http response body and headers and returns its transformed (typically deserialized) version. See Overriding the Default Transformations
	 * cache – {boolean|Cache} – If true, a default $http cache will be used to cache the GET request, otherwise if a cache instance built with $cacheFactory, this cache will be used for caching.
	 * timeout – {number|Promise} – timeout in milliseconds, or promise that should abort the request when resolved.
	 * withCredentials - {boolean} - whether to set the withCredentials flag on the XHR object. See requests with credentials for more information.
	 * responseType - {string} - see requestType.
	 */
	var send = function(config){

		// !!config.scope && ( config.scope.loading = true);

		// !!config.mask && $ionicLoading.show({
		// 	template: typeof config.mask == "boolean" ? '请稍等...' : config.mask
		// });

		// config.method == 'post' && ( config.data = config.data || {} ) && ionic.extend(config.data, {
		// 	accesstoken: Storage.get('accessToken')
		// });

		ionic.extend(config, {
			timeout: ERROR.TIME_OUT
		});

		var http = $http(config);

		http.catch(function(error){
			if ( error.status === 0 ) {
				error.data = {
					template: !navigator.onLine || error.data === '' ?
						'哥们，不是我瞎说，你断网了...' :
						'等了' + error.config.timeout + '毫秒都没有响应，所以我把请求取消了...'
				};
			} else if ( error.data.error_msg == ERROR.WRONG_ACCESSTOKEN || status == 403 ) {
				error.data = {
					template: '好像是鉴权失效了'
				};
			} else {
				error.data = {
					template: '喏，响应信息都在这了：' + JSON.stringify(error.data)
				};
			}
			$ionicPopup.alert({
				title: '擦，悲剧了...',
				template: error.data.template,
				buttons: [
					{
						text: '算了',
						type: 'button-balanced'
					}
				]
			});
		});

		// http.finally(function(){
		// 	!!config.scope && ( config.scope.loading = false);
		// 	!!config.mask && $ionicLoading.hide();
		// });

		return http;
	};

	return {
		send: send
	};

})


.factory('AVFactory',function($ionicLoading,$timeout,$rootScope,Storage){

	//alert
	var HUD = function(template){

		$ionicLoading.show({
	    	template:template
		})

		$timeout(function(){
	      	$ionicLoading.hide()
	    },1500);
	};

	var JobObject = AV.Object.extend("data");
	var curUser = AV.User.current();
	var JobSessionObject = AV.Object.extend("JobSession");
	var PostJobSessionObject = AV.Object.extend("PostJobSession");
	var JobSessionHistoryObject = AV.Object.extend("JobSessionHistory");
	var JobGroup = AV.Object.extend("JobGroup");
	var WalletObject = AV.Object.extend("Wallet");
	var WalletWithdraw = AV.Object.extend("WalletWithdraw");



	return {

		applyJob:function(job){
	        var query = new AV.Query(JobSessionObject);
	        query.equalTo('job',job)
	        query.equalTo('user',AV.User.current())
	        query.find({
	            success:function(results){
	                if (results.length > 0){
						HUD('你已经报过名了！')                   
	                }else{
	                	if (curUser){
		                    var JobSession = new JobSessionObject()
		                    JobSession.set('job',job)
		                    JobSession.set('user',curUser)
		                    JobSession.set('status',0)
		                    JobSession.set('message','您申请了工作');
		                    JobSession.set('is_command',false);
		                    JobSession.save(null,{
		                        success:function(jobsession){
		                        	
			                     	var jobsh = new JobSessionHistoryObject()
			                     	jobsh.set('jobsession',jobsession)
			                     	jobsh.set('waiting',jobsession.createdAt)
			                     	jobsh.save()

			                     	var postquery = new AV.Query(PostJobSessionObject)
			                     	postquery.equalTo('job',job)
			                     	postquery.first({
			                     		success:function(object){
			                     			console.log(object)
			                     			object._serverData.applying.push(jobsession.id)
			                     			object.save().then(function(obj){
			                     				HUD('报名成功，请耐心等待反馈！')
			                     			})
			                     		},error:function(_,error){

			                     		}
			                     	})

		                     	}
		                    });

	                	}else{
	                		HUD('请先登录');
	                	}
                    
	                }

	            },
	            error:function(_,error){
					HUD(error.message)               
	            }
	        })
		},
		getRecommendJobs:function(){
		},
	    signup:function(params){

	      $ionicLoading.show({template:"连接中..."})	
	      var newuser = new AV.User();
	      newuser.signUpOrlogInWithMobilePhone({
	        mobilePhoneNumber:params.username,
	        smsCode:params.verify_code,
	        username:params.username,
	        usertype:'worker',
	        conform:0,
	        invite_code:params.invite_code
	      },{
	        success:function(user){
	        	user.set('password',params.password)
	        	user.save().then(function(){
	        		$ionicLoading.hide()
	        		HUD('注册成功！')
	        	})
	          $rootScope.$broadcast('signupSucceed');

	        },
	        error:function(user,err){
	        	$ionicLoading.hide()
	          HUD(err.message)
	        }
	      });
	    },
	    login:function(params){
	      console.log(params)
	      $ionicLoading.show({
	      	template:"连接中..."
	      })
	      AV.User.logIn(params.username, params.password, {
	          success: function(user) {
	          	$ionicLoading.hide()
	            
	            HUD('登录成功！')
	            $rootScope.$broadcast('loginSucceed')         
	          },
	          error: function(user, error) {
	          	$ionicLoading.hide()
	            HUD(error.message)
	        } 
	      });      
	    },
	    sendCode:function(phone){

	      AV.Cloud.requestSmsCode(phone).then(function(){
	          HUD('验证码已发送！')
	      }, function(err){
	          HUD('验证码发送失败,请核对您的手机号')
	      });
	    },
	    showGroup:function(id){
	    	$ionicLoading.show({template:"连接中..."});
	    	var job = Storage.get(id);
	    	var jobGquery = new AV.Query(JobGroup);
	    	jobGquery.equalTo('job',job);
	    	jobGquery.include('command');
	    	jobGquery.include('job');
	    	jobGquery.include('members.user');
	    	jobGquery.greaterThan('num_left',0);
	    	jobGquery.find({
	    		success:function(results){
	    			$ionicLoading.hide();
	    			if (results.length == 0){
	    				HUD('暂时没有团队');
	    			}
	    			$rootScope.$broadcast('jobgroupLoadSuccess',results);
	    			
	    		},	
	    		error:function(_,error){
	    			$ionicLoading.hide();
	    			HUD(error.message);
	    		}
	    	})
	    },
	    createGroup:function(params){
	    	var job = Storage.get(params.jobid);
	    	var jobgroup = new JobGroup();
	    	if (!curUser._serverData.personal_invite_code){
			    var codeMat = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
			    var index = Math.floor((Math.random()*codeMat.length));
			    var phone = curUser._serverData.username.substring(curUser._serverData.username.length - 4,curUser._serverData.username.length);

			    var code = codeMat[index] + phone;
        		curUser.set('personal_invite_code',code);
        		curUser.save();		    		
	    	}

	    	$ionicLoading.show({template:"创建中..."});
	    	var group = new JobGroup();
	    	group.set('command',curUser);
	    	group.set('job',job);
	    	group.set('members',new Array());
	    	group.set('state',0);
	    	group.set('name',params.name);
	    	group.set('num',parseInt(params.num));
	    	group.set('deadline',params.deadline);
	    	group.set('num_left',parseInt(params.num));
	    	group.set('jobId',job.objectId);
	    	group.save().then(function(obj){
	    		$ionicLoading.hide();
	    		
	    		//更新postjob剩余名额人数
	    		var jobquery = new AV.Query(JobObject);
	    		jobquery.equalTo('objectId',obj._serverData.job.objectId);
	    		var query = new AV.Query(PostJobSessionObject);
	    		query.matchesQuery('job',jobquery);
	    		query.first({
	    			success:function(object){
	    				//create Jobsession
	    				var jobsession = new JobSessionObject();
	    				jobsession.set('job',object._serverData.job);
	    				jobsession.set('user',curUser);
	    				jobsession.set('status',0);
	    				jobsession.set('is_command',true);
	    				jobsession.save().then(function(js){

	    					object._serverData.applying.push(jobsession)
	    					if (object._serverData.remain){
	    						object.set('remain',object._serverData.remain - params.num);
	    						object.save().then(function(pj){
	    							$rootScope.$broadcast('createGroupSuccess',obj);
	    						});
	    					}else{
	    						object.set('remain',parseInt(job.recruit_num * 1.3) - params.num);
	    						object.save().then(function(pj){
	    							$rootScope.$broadcast('createGroupSuccess',obj);
	    						});
	    					}


    						var jobsh = new JobSessionHistoryObject()
	                     	jobsh.set('jobsession',js)
	                     	jobsh.set('waiting',jobsession.createdAt)
	                     	jobsh.save()



	    				})

	    			},error:function(_,error){
	    				HUD(error.message);

	    			}
	    		});



	    	},function(error){
	    		HUD(error.message);
	    	});
	    },
	    searchRemain:function(id){
	    	var jobquery = new AV.Query(JobObject);
	    	jobquery.equalTo('objectId',id);
			var query = new AV.Query(PostJobSessionObject);
	    	query.matchesQuery('job',jobquery);
	    	query.include('job');
	    	query.first({
	    		success:function(object){

	    			$rootScope.$broadcast('groupPostJobObject',object);
	    		}
	    	})    	
	    },
	    myGroup:function(){
	    	$ionicLoading.show({template:"连接中"});
	    	var query = new AV.Query(JobGroup);
	    	query.equalTo('command',curUser);
	    	query.descending('createdAt');
	    	query.include('command');
	    	query.find({
	    		success:function(results){
	    			$ionicLoading.hide();

	    			$rootScope.$broadcast('myjobgroupLoadSuccess',results);
	    		},
	    		error:function(_,error){

	    			$ionicLoading.hide();
	    			HUD(error.message);
	    		}
	    	})
	    },
	    joinGroup:function(){
	    	$ionicLoading.show({template:"连接中"});
	    	var query = new AV.Query(JobGroup);
	    	query.equalTo('members_users',curUser);
	    	query.descending('createdAt');
	    	query.include('command')
	    	query.find({
	    		success:function(results){
	    			$ionicLoading.hide();

	    			$rootScope.$broadcast('joinGroupLoadSuccess',results)
	    		},error:function(_,error){
	    			$ionicLoading.hide();
	    			HUD(error.message);
	    		}
	    	})
	    },
	    applyJoinGroup:function(group){
	    	$ionicLoading.show({template:"申请加入中..."})
	    	var jobquery = new AV.Query(JobObject);
	    	jobquery.equalTo('objectId',group._serverData.job.objectId);
	    	var jsquery = new AV.Query(JobSessionObject);
	    	jsquery.equalTo('user',curUser);
	    	jsquery.matchesQuery('job',jobquery);
	    	jsquery.equalTo('group',group);
	    	jsquery.first().then(function(obj){
	    		if(obj){
	    			if(obj._serverData.group){
	    				$ionicLoading.hide();
	    				HUD('您已经加入了'+group._serverData.name+',无法加入该团');
	    			}else{
	    				obj.set('group',group);
	    				obj.save();
	    				group._serverData.members.push(obj.id);
	    				group.save().then(function(object){
	    					$ionicLoading.hide();
	    					HUD('成功加入！');
	    				}),function(error){
	    					$ionicLoading.hide();
	    					HUD(error.message);
	    				}
	    			}
	    		}else{
	    			var js = new JobSessionObject();
	    			js.set('user',curUser);
	    			js.set('group',group);
	    			js.set('status',0);
	    			js.set('is_command',false);
	    			var jobq = new AV.Query(JobObject);
	    			jobq.get(group._serverData.job.objectId,{
	    				success:function(j){
	    					js.set('job',j);
	    					js.save().then(function(jso){

	    						//postjson
	    						var qp = new AV.Query(PostJobSessionObject);
	    						qp.equalTo('job',j);
	    						qp.first().then(function(qpo){
	    							qpo._serverData.applying.push(jso);
	    							qpo.save();

	    						})

		                     	var jobsh = new JobSessionHistoryObject()
		                     	jobsh.set('jobsession',jso)
		                     	jobsh.set('waiting',jso.createdAt)
		                     	jobsh.save();
		                     	var mat = [];
		                     	mat = group._serverData.members;
		                     	var mat2 = group._serverData.members_users
		                     	if (!mat2){
		                     		mat2 = [];
		                     	}
		                     	mat.push(jso.id);
		                     	mat2.push(curUser);
		                     	group.set('members',mat);
		                     	group.set('members_users',mat2);
				    			group.save({
				    				success:function(){
				    					$ionicLoading.hide();
				    					HUD('成功加入');
				    				},
				    				error:function(_,error){
				    					$ionicLoading.hide();
				    					HUD(error.message);
				    				}
				    			})
				    			
	    					});
	    				}
	    			})
	    			

	    		}
	    	})
	    },
	    searchGroupByCode:function(code,job){
	    	$ionicLoading.show({template:"搜索中..."});
	    	var query = new AV.Query(JobGroup);
	    	var commandQuery = new AV.Query(AV.User);
	    	commandQuery.equalTo('personal_invite_code',code);
	    	query.matchesQuery('command',commandQuery);
	    	query.equalTo('job',job);
	    	query.find({
	    		success:function(results){
	    			$ionicLoading.hide();
	    			if (results.length > 0){
	    				$rootScope.$broadcast("searchGroupByCodeSuccess",results);
	    			}else{
	    				HUD('该职位下位找到工号：'+code+'创建的团');
	    			}
	    			
	    		},error:function(_,error){
	    			HUD(error.message);
	    		}
	    	})
	    },
	    saveBankCard:function(params){
	    	$ionicLoading.show({template:"保存中..."})
	    	params.contact = curUser._serverData.username;
	    	var query = new AV.Query(WalletObject);
	    	query.equalTo('user',curUser);
	    	query.first().then(function(obj){
	    		if (obj){
	    			obj.set('bankcard',params);
	    			obj.save().then(function(){
	    				$ionicLoading.hide();
	    				HUD('保存成功');
	    			}),function(error){
	    				HUD(error.message);
	    			}
	    		}else{
	    			var wallet = new WalletObject();
	    			wallet.set('user',curUser);
	    			wallet.set('bankcard',params);
	    			wallet.set('balance',0);
	    			wallet.save().then(function(){
	    				$ionicLoading.hide();
	    				HUD('保存成功');
	    			}),function(error){
	    				HUD(error.message);
	    			}
	    		}
	    	})
	    },
	    withdraw:function(num,wallet){
	    	$ionicLoading.show({template:"提交中..."})
	    	var wd = new WalletWithdraw();
	    	wd.set('status','处理中');
	    	wd.set('wallet',wallet);
	    	wd.set('user',curUser);
	    	wd.set('withdraw_mount',parseInt(num));
	    	wd.save().then(function(){

	    		wallet.set('balance',wallet._serverData.balance - num);
	    		wallet.save().then(function(obj){
					$ionicLoading.hide();
	    			$rootScope.$broadcast('withdrawSuccess',obj);
	    			HUD('提交成功，我们会在一个工作日转账到您的银行卡')	;    			
	    		})

	    	}),function(error){
	    		$ionicLoading.hide();
	    		HUD(error.message);
	    	}
	    }


	}
})

//jobs分类过滤器
.factory('Tabs',function(){
	return [{
  		value: 'Category_cxdg',
  		label: '促销导购'
	}, {
  		value: 'Category_kdps',
  		label: '快递配送'
	}, {
  		value: 'Category_dbfj',
  		label: '打包分拣'
	}, {
  		value: 'Category_dttg',
  		label: '地推推广'
	}];
})

.filter('tabName', function(Tabs){

	return function(tab){
		for(var i in Tabs){
			if (Tabs[i].value === tab){
				return Tabs[i].label;
			}
		}
	};
})


// User Model
.factory('User', function($rootScope,$ionicLoading, Storage, HttpFactory){

    var storageKey = 'user';
    var user = Storage.get(storageKey) || {};
    return {
      login: function(params){
      	$ionicLoading.show();
      	HttpFactory.send({
      	 	url: API.LOGIN,
      	 	data: params,
      	 	method: 'post',
      	 	mask:true
      	 }).success(function(response){
      	 		console.log(response);
      	 		Storage.save(storageKey,response);
      	 		$rootScope.$broadcast('LoginInSuccessed',response);
			
      	 }).error(function(response,status){
      	 	$rootScope.$broadcast('LoginInFail',response);
      	 });
      	 $ionicLoading.hide();

      },

      signup: function(params){
      	HttpFactory.send({
      		url:API.SIGN_UP,
      		data:params,
      		method:'post',
      		mask:true
      	}).success(function(response){
      		$rootScope.$broadcast('SignUpSuccessed',response);
      	}).error(function(response){
      		$rootScope.$broadcast('SignUpFail',response);
      	});

      },

      logout: function(){

        Storage.remove(storageKey);

        HttpFactory.send({
        	url:API.LOGIN_OUT,
        	data:{},
        	method:'post',
        	mask:true
        });
        //unset alias for jpush

      },

      getCurrentUser: function(){

      	if (user.length > 10){
      		user = JSON.parse(user);
      	}
        return user;
      }



    };
})
//Profile setting Model
.factory('My', function( $log, Storage){

    var storageKey = 'settings';
    var settings = Storage.get(storageKey) || {
      sendFrom: true,
      showAvatar: true,

    };


    return {
      getSettings: function(){

        $log.debug('get settings:', settings);
        return settings;
      },

      setSettings: function(key, value){
        settings[key] = value;
        //return settings
        $log.debug('set settings', settings);

      },

      save: function(settings){

        $log.debug('save settings', settings);
        Storage.set(storageKey, settings);
      }

    };
})
//link filter
//protocol filter
//avatarFilter
.filter('avatarFilter', function() {
    return function(src) {
      // add https protocol
    if (src) {
       	src = src.replace("https://avatars.githubusercontent.com", "http://7xj5bc.com1.z0.glb.clouddn.com");
        src = src + "&imageView2/2/w/120";
    }
    return src;
    };
})	
// Collection-repeat image recycling while loading
.directive(
  'resetImg',
  function($document) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attributes) {
        var applyNewSrc = function(src) {
          var newImg = $element.clone(true);

          newImg.attr('src', src);
          $element.replaceWith(newImg);
          $element = newImg;
        };

        $attributes.$observe('src', applyNewSrc);
        $attributes.$observe('ngSrc', applyNewSrc);
      }
    };
  }
);





















