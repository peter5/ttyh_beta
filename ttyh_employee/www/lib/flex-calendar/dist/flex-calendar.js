(function(){
  "use strict";
  angular
    .module('flexcalendar', [])
    .directive('flexCalendar', flexCalendar);

    function flexCalendar() {

      var template =
      '<div class="flex-calendar">'+
        '<div class="month">'+
          '<div class="arrow {{arrowPrevClass}}" ng-click="prevMonth()"></div>'+
          '<div class="label">{{ selectedMonth | translate }} {{selectedYear}}</div>'+
          '<div class="arrow {{arrowNextClass}}" ng-click="nextMonth()"></div>'+
        '</div>'+
        '<div class="week">'+
          '<div class="day" ng-repeat="day in weekDays(options.dayNamesLength) track by $index">{{ day }}</div>'+
        '</div>'+
        '<div class="days" ng-repeat="week in weeks">'+
          '<div class="day"'+
            'ng-repeat="day in week track by $index"'+
            'ng-class="{selected: isDefaultDate(day), event: day.event[0], disabled: day.disabled, out: !day}"'+
            'ng-click="onClick(day, $index, $event)"'+
          '>'+
            '<div class="number">{{day.day}}</div>'+
          '</div>'+
        '</div>'+
      '</div>';

      var directive = {
        restrict: 'E',
        scope: {
          options: '=?',
          events: '=?'
        },
        template: template,
        controller: Controller
      };

      return directive;

    }

    Controller.$inject = ['$scope' , '$filter'];

    function Controller($scope , $filter) {

      $scope.days = [];
      $scope.options = $scope.options || {};
      $scope.events = $scope.events || [];
      $scope.options.dayNamesLength = $scope.options.dayNamesLength || 1;
      $scope.options.mondayIsFirstDay = $scope.options.mondayIsFirstDay || false;

      $scope.onClick = onClick;
      $scope.allowedPrevMonth = allowedPrevMonth;
      $scope.allowedNextMonth = allowedNextMonth;
      $scope.weekDays = weekDays;
      $scope.isDefaultDate = isDefaultDate;
      $scope.prevMonth = prevMonth;
      $scope.nextMonth = nextMonth;

      $scope.arrowPrevClass = "visible";
      $scope.arrowNextClass = "visible";

      var $translate = $filter('translate');

      var MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      var WEEKDAYS = ['日' , '一' , '二' , '三' , '四' , '五' , '六'];

      if($scope.options.mondayIsFirstDay)
      {
        var sunday = WEEKDAYS.shift();
        WEEKDAYS.push(sunday)
      }

      if ($scope.options.minDate) {
        $scope.options.minDate = new Date($scope.options.minDate);
      }

      if ($scope.options.maxDate) {
        $scope.options.maxDate = new Date($scope.options.maxDate);
      }

      if($scope.options.disabledDates) {
        createMappedDisabledDates();
      }

      if($scope.events)
      {
        createMappedEvents();
      }

      function createMappedDisabledDates(){
        $scope.mappedDisabledDates = $scope.options.disabledDates.map(function(date)
        {
          return new Date(date);
        });
      }

      function createMappedEvents(){
        $scope.mappedEvents = $scope.events.map(function(obj)
        {
          obj.date = new Date(obj.date);
          return obj;
        });
      }

      $scope.$watch('options.defaultDate', function() {
        calculateSelectedDate();
      });

      $scope.$watch('options.disabledDates', function() {
        if($scope.options.disabledDates) {
            createMappedDisabledDates();
            calculateDisabledDates();
        }
      });

      $scope.$watch('events', function() {
        createMappedEvents();
        calculateWeeks();
      });

      /////////////////

      function onClick(date, index, domEvent) {
        if (!date || date.disabled) { return; }
        $scope.options.defaultDate = date.date;
        if (date.event.length != 0) {
          $scope.options.eventClick(date, domEvent);
        }
        else
        {
          $scope.options.dateClick(date, domEvent);
        }
      }

      function bindEvent(date) {
        if (!date || !$scope.mappedEvents) { return; }
        date.event = [];
        $scope.mappedEvents.forEach(function(event) {
          if (date.date.getFullYear() === event.date.getFullYear()
              && date.date.getMonth() === event.date.getMonth()
              && date.date.getDate() === event.date.getDate()) {
            date.event.push(event);
          }
        });
      }

      function allowedDate(date) {
        if (!$scope.options.minDate && !$scope.options.maxDate) {
          return true;
        }
        var currDate = date.date;
        if ($scope.options.minDate && (currDate < $scope.options.minDate)) { return false; }
        if ($scope.options.maxDate && (currDate > $scope.options.maxDate)) { return false; }
        return true;
      }

      function disabledDate(date) {
        if (!$scope.mappedDisabledDates) return false;
        for(var i = 0; i < $scope.mappedDisabledDates.length; i++){
          if(date.year === $scope.mappedDisabledDates[i].getFullYear() && date.month === $scope.mappedDisabledDates[i].getMonth() && date.day === $scope.mappedDisabledDates[i].getDate()){
            return true;
            break;
          }
        }
      }

      function allowedPrevMonth() {
        var prevYear = null;
        var prevMonth = null;
        if (!$scope.options.minDate) { return true; }
        var currMonth = MONTHS.indexOf($scope.selectedMonth);
        if (currMonth === 0) {
          prevYear = ($scope.selectedYear - 1);
          prevMonth = 11;
        } else {
          prevYear = $scope.selectedYear;
          prevMonth = (currMonth - 1);
        }
        if (prevYear < $scope.options.minDate.getFullYear()) { return false; }
        if (prevYear === $scope.options.minDate.getFullYear()) {
          if (prevMonth < $scope.options.minDate.getMonth()) { return false; }
        }
        return true;
      }

      function allowedNextMonth() {
        var nextYear = null;
        var nextMonth = null;
        if (!$scope.options.maxDate) { return true; }
        var currMonth = MONTHS.indexOf($scope.selectedMonth);
        if (currMonth === 11) {
          nextYear = ($scope.selectedYear + 1);
          nextMonth = 0;
        } else {
          nextYear = $scope.selectedYear;
          nextMonth = (currMonth + 1);
        }
        if (nextYear > $scope.options.maxDate.getFullYear()) { return false; }
        if (nextYear === $scope.options.maxDate.getFullYear()) {
          if (nextMonth > $scope.options.maxDate.getMonth()) { return false; }
        }
        return true;
      }

      function calculateWeeks() {
        $scope.weeks = [];
        var week = null;
        var daysInCurrentMonth = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth) + 1, 0).getDate();

        for (var day = 1; day < daysInCurrentMonth + 1; day += 1) {
          var date = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth), day);
          var dayNumber = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth), day).getDay();
          if($scope.options.mondayIsFirstDay)
          {
            dayNumber = (dayNumber + 6) % 7;
          }
          week = week || [null, null, null, null, null, null, null];
          week[dayNumber] = {
            year: $scope.selectedYear,
            month: MONTHS.indexOf($scope.selectedMonth),
            day: day,
            date: date,
            _month : date.getMonth() + 1
          };

          if (allowedDate(week[dayNumber])) {
            if ($scope.mappedEvents) { bindEvent(week[dayNumber]); }
          } else {
            week[dayNumber].disabled = true;
          }

          if (week[dayNumber] && disabledDate(week[dayNumber])) {
            week[dayNumber].disabled = true;
          }

          if (dayNumber === 6 || day === daysInCurrentMonth) {
            $scope.weeks.push(week);
            week = undefined;
          }
        }
        (!$scope.allowedPrevMonth()) ? $scope.arrowPrevClass = "hidden" : $scope.arrowPrevClass = "visible";
        (!$scope.allowedNextMonth()) ? $scope.arrowNextClass = "hidden" : $scope.arrowNextClass = "visible";
      }

      function calculateSelectedDate() {
        if ($scope.options.defaultDate) {
          $scope.options._defaultDate = new Date($scope.options.defaultDate);
        } else {
          $scope.options._defaultDate = new Date();
        }

        $scope.selectedYear  = $scope.options._defaultDate.getFullYear();
        $scope.selectedMonth = MONTHS[$scope.options._defaultDate.getMonth()];
        $scope.selectedDay   = $scope.options._defaultDate.getDate();
        calculateWeeks();
      }

      function calculateDisabledDates() {
        if (!$scope.mappedDisabledDates || $scope.mappedDisabledDates.length === 0) return;
        for(var i = 0; i < $scope.mappedDisabledDates.length; i++){
          $scope.mappedDisabledDates[i] = new Date($scope.mappedDisabledDates[i]);
        }
        calculateWeeks();
      }

      function weekDays(size) {
        return WEEKDAYS.map(function(name) { return $translate(name).slice(0, size); });
      }

      function isDefaultDate(date) {
        if (!date) { return; }
        var result = date.year === $scope.options._defaultDate.getFullYear() &&
          date.month === $scope.options._defaultDate.getMonth() &&
          date.day === $scope.options._defaultDate.getDate();
        return result;
      }

      function prevMonth() {
        if (!$scope.allowedPrevMonth()) { return; }
        var currIndex = MONTHS.indexOf($scope.selectedMonth);
        if (currIndex === 0) {
          $scope.selectedYear -= 1;
          $scope.selectedMonth = MONTHS[11];
        } else {
          $scope.selectedMonth = MONTHS[currIndex - 1];
        }
        var month = {name: $scope.selectedMonth, index: currIndex - 1, _index: currIndex+2 };
        $scope.options.changeMonth(month, $scope.selectedYear);
        calculateWeeks();
      }

      function nextMonth() {
        if (!$scope.allowedNextMonth()) { return; }
        var currIndex = MONTHS.indexOf($scope.selectedMonth);
        if (currIndex === 11) {
          $scope.selectedYear += 1;
          $scope.selectedMonth = MONTHS[0];
        } else {
          $scope.selectedMonth = MONTHS[currIndex + 1];
        }
        var month = {name: $scope.selectedMonth, index: currIndex + 1, _index: currIndex+2 };
        $scope.options.changeMonth(month, $scope.selectedYear);
        calculateWeeks();
      }
    }

})();
