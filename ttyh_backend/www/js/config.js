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