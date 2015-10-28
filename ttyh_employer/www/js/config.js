

Array.prototype.contains = function (element) { 
    for (var i = 0; i < this.length; i++) { 
        if (this[i].text == element.text) { 
            return true; 
        } 
    } 
    return false; 
}; 

var DateDay = function(date){

    var day = date.day;
    var year = date.year;
    var month = date.month + 1;
    return month+'-'+day;

};

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
  
// 给String对象添加getDate方法，使字符串形式的日期返回为Date型的日期  
String.prototype.getDate = function(){  
    var strArr = this.split('-');  
    var date = new Date(strArr[0], strArr[1] - 1, strArr[2]);  
    return date;  
} 


Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

//时间转化
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