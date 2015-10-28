

var SETTING= {

	version:'0.1',
	author:'sam.ding&stephen.zhang',
	copyright:'ttyh'
};


var ERROR = {

	NO_AUTHORITY:'请先登录',
	TIME_OUT:5000
};


var work_type_dic = new Array();
work_type_dic['促销导购'] = 'cxdg';
work_type_dic['周末职位'] = 'zmzw';
work_type_dic['客服人员'] = 'kfry';
work_type_dic['打包分拣'] = 'dbfj';
work_type_dic['服务助理'] = 'fwzl';
work_type_dic['线下推广'] = 'xxtg';
work_type_dic['迎宾礼仪'] = 'ybly';
work_type_dic['高额补贴'] = 'gebt';


//var API_HOST = 'https://ttyouhuo.dev.joinmind.org/v1/'
var API_HOST = 'http://10.14.25.10:8080/v1/';
var API = {

	AUTHOR_CODE: API_HOST + 'verify_code/',
	SIGN_UP: API_HOST + 'users/',
	JOBS: API_HOST + 'jobs/',
	JobSessions: API_HOST + 'jobsessions/',

	RECOMMEND_JOBS: API_HOST + 'recommend/',
	JOB_DETAIL: API_HOST + 'jobs/{:id}',

	LOGIN: API_HOST + 'auth/login/',
	LOGIN_OUT: API_HOST + 'auth/logout/'
};


Date.prototype.toRelativeTime = function(now_threshold) {
  var delta = new Date() - this;
 
  now_threshold = parseInt(now_threshold, 10);
 
  if (isNaN(now_threshold)) {
    now_threshold = 0;
  }
 
  if (delta <= now_threshold) {
    return '刚刚';
  }
 
  var units = null;
  var conversions = {
    '毫秒': 1, // ms    -> ms
    '秒': 1000,   // ms    -> sec
    '分钟': 60,     // sec   -> min
    '小时':   60,     // min   -> hour
    '天':    24,     // hour  -> day
    '月':  30,     // day   -> month (roughly)
    '年':   12      // month -> year
  };
 
  for (var key in conversions) {
    if (delta < conversions[key]) {
      break;
    } else {
      units = key; // keeps track of the selected key over the iteration
      delta = delta / conversions[key];
    }
  }
 
  // pluralize a unit when the difference is greater than 1.
  delta = Math.floor(delta);
  return [delta, units].join(" ");
};


var DateDay = function(date){
    var day = date.day
    var year = date.year
    var month = date.month
    return year+'/'+month+'/'+day

}



Array.prototype.contains = function (element) { 
    for (var i = 0; i < this.length; i++) { 
        if (this[i].id == element.id) { 
            return true; 
        } 
    } 
    return false; 
};

//var API_HOST = 'http://ionichina.com/api/v1/'
// var API_HOST = 'http://10.14.24.187:8000/v1/'
// var API_BASE = 'https://menke.dev.joinmind.org/v1/'

// var API = {

// 	JOBS: API_HOST + 'topics',
// 	JOB_DETAIL: API_HOST + 'topic/{:id}',
// 	NEW_JOBS: API_HOST + 'topics',
// 	AUTHOR_CODE: API_HOST + 'user/sendRegVerCode',
// 	LOGIN: API_HOST + 'user/login',
// 	SIGN_UP: API_HOST + 'user/register',
// 	LOGIN_OUT: API_BASE + 'user/logout',
// 	GET_USER_PROFILE: API_BASE + 'user/getProfile'
// }


var getDays = function(day1, day2) {  
    // 获取入参字符串形式日期的Date型日期  
    var st = day1  
    var et = day2
      
    // 定义返回的数组  
    var retArr = [];  
  
    // 循环，启动日期不等于结束日期时，进行循环  
    while (st.getTime() != et.getTime()) {  
          
        // 将启动日期的字符串形式的日期存放进数组  
        retArr.push(st.getYMD());  
          
        // 取得开始日期的天  
        var tempDate = st.getDate();  
          
        // 将开始日期st指向构造出的新的日期  
        // 新的日期较之前的日期多加一天  
        st = new Date(st.getFullYear(), st.getMonth(), st.getDate() + 1);  
    }  
  
    // 将结束日期的天放进数组  
    retArr.push(et.getYMD());  
      
    return retArr; // 或可换为return ret;  
} 

  
// 给Date对象添加getYMD方法，获取字符串形式的年月日  
Date.prototype.getYMD = function(){  
   var retDate = this.getFullYear() + "-";  // 获取年份。  
   retDate += this.getMonth() + 1 + "-";    // 获取月份。            
   retDate += this.getDate();               // 获取日。 
   var dic = {};
   dic["foo"] = "bar";
   dic["date"] = retDate; 
   return dic;                          // 返回日期。  
}

