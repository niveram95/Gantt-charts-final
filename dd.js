d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";
    console.log ("d3.gantt");
      
    var margin = {
        top : 40,
        right : 90,
        bottom : 10,
        left : 80
    };
    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE; 
    var taskTypes = [];
    var taskStatus = [];
    var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var width = document.body.clientWidth - margin.right - margin.left-5;
    var tickFormat = "%H:%M";

    var keyFunction = function(d) { return d.startDate + d.taskName + d.endDate; };
    var rectTransform = function(d) { return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")"; };

    var x = d3.time.scale().range([ 0, width ])
        ,
        y_1 = d3.scale.linear().domain(Object.keys(taskNames)).range([ 0,  height - margin.top - margin.bottom])
        ,
        
        y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], 0);
          
    
    var xAxis = d3.svg.axis()
                  .scale(x).orient("top").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
                  .tickSize(8),//.tickPadding(8),
        yAxis = d3.svg.axis()
                  .scale(y).orient("left").tickSize(0).ticks(5).tickPadding(12);
 

  var initTimeDomain = function(tasks) {
    if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
      if (tasks === undefined || tasks.length < 1) {
        timeDomainStart = d3.time.day.offset(new Date(), -3);
        timeDomainEnd = d3.time.hour.offset(new Date(), +3);
        return;
      }
      tasks.sort(function(a, b){ return b.endDate - a.endDate; });
      timeDomainEnd = tasks[0].endDate;
      
      tasks.sort(function(a, b) { return a.startDate - b.startDate; });
      timeDomainStart = tasks[0].startDate;
    }
  };

  var initAxis = function() {
   
  };

  function gantt(tasks) {
    console.log ("gantt function");
    initTimeDomain(tasks);
    
    console.log ("initAxis");
    x = d3.time.scale().range([ 0, width ]).domain([ timeDomainStart, timeDomainEnd ]);
    
    y_1 = d3.scale.linear().domain(Object.keys(taskTypes)).range([ 0,  height - margin.top - margin.bottom]);
    y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], 0);
    
    
    
    xAxis = d3.svg.axis()
                .scale(x).orient("top")
                .tickFormat(d3.time.format(tickFormat))
                .tickSubdivide(true)
                .tickSize(8), 
    yAxis = d3.svg.axis()
                .scale(y).orient("left").tickSize(3).ticks(20).tickPadding(12);

    var chart = d3.select("body")
                  .append("svg")
                    .attr("class", "chart")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

    var svg = chart.append("g")
                    .attr("class", "gantt-chart")
                    .attr("width", width)
                    .attr("height", height-margin.top-margin.bottom)
                    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
    
    svg.append("clipPath")
          .attr("id", "clip")
          .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height-margin.top-margin.bottom);
    
    svg.append("g")
      .attr("class", "gantt-chart-canvas")
      .attr("clip-path", "url(#clip)");
    
    var drw = chart.append("rect")
        .attr("class", "pane")
        .attr("width", width)
        .attr("height", height-margin.top-margin.bottom)
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
    
    svg.selectAll(".chart")
      .data(tasks, keyFunction).enter()
      .append("rect")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("class", function(d){ return taskStatus[d.status] || "bar"; }) 
        .attr("y", 0)
        .attr("transform", rectTransform)
        .attr("height", function(d) { return 5; }) // y.rangeBand(); })
        .attr("width", function(d) { return (x(d.endDate) - x(d.startDate)); })
  
    svg.append("g").attr("class", "x axis")
      .attr("transform",function(d){return "translate(0, (margin.top)-15))"}).call(xAxis);
    svg.append("g").attr("class", "y axis").call(yAxis);

    var zoom = d3.behavior.zoom()
                  .x(x)
                  .y(y_1)
                  .on("zoom", zoomed);
	
    chart.select("rect.pane").call(zoom);
    
    function zoomed () {
      console.log ("zoomed");
      gantt.redraw (tasks);


	
	
    
    }
    
    return gantt;
  };
    
  gantt.redraw = function(tasks) {
    
    var svg = d3.select("svg");
    var ganttChartGroup = svg.select(".gantt-chart-canvas");


    var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);
    rect
        .enter()
        .insert("rect")
          .attr("rx", 5).attr("ry", 5)
          .attr("class", function(d){ return taskStatus[d.status] || "bar"; });
    rect
      
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.rangeBand(); }) 
      .attr("width", function(d) { return (x(d.endDate) - x(d.startDate)); });
    
    rect.exit().remove();
    
      svg.select(".x").call(xAxis).selectAll('.tick').on('click',function(d) { alert (d); });
      svg.select(".y").call(yAxis).selectAll('.tick').on('click',function(d) { alert (d); });

      return gantt;
    };

    gantt.margin = function(value) {
      if (!arguments.length) return margin;
      margin = value;
      return gantt;
    };

    gantt.timeDomain = function(value) {
      if (!arguments.length) return [ timeDomainStart, timeDomainEnd ];
      timeDomainStart = +value[0], timeDomainEnd = +value[1];
      return gantt;
    };

    gantt.timeDomainMode = function(value) {
      if (!arguments.length) return timeDomainMode;
      timeDomainMode = value;
      return gantt;
    };

    gantt.taskTypes = function(value) {
      if (!arguments.length) return taskTypes;
      taskTypes = value;
      return gantt;
    };
    
    gantt.taskStatus = function(value) {
      if (!arguments.length) return taskStatus;
      taskStatus = value;
      return gantt;
    };

    gantt.width = function(value) {
      if (!arguments.length) return width;
      width = +value;
      return gantt;
    };

    gantt.height = function(value) {
      if (!arguments.length) return height;
      height = +value;
      return gantt;
    };

    gantt.tickFormat = function(value) {
      if (!arguments.length) return tickFormat;
      tickFormat = value;
      return gantt;
    };
    
    return gantt;
};

var tasks = []; 

var taskNames = [ "R1 emp1", "R1 Emp2", "R1 Emp3", "R1 Emp3 ", "R1 Emp4 ","R1 Emp5 ","R2 Emp6","R2 Emp7","R2 Emp8","R2 Emp9","R2 Emp10","R3 Emp 11","R3 Emp 12","R3 Emp 13","R3 Emp 14","R3 Emp 15","R4 Emp 16","R4 Emp 17","R4 Emp 18","R4 Emp 19","R4 Emp 20"];
var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};
var format = "%H:%M";

var gantt = d3.gantt()
              .taskTypes(taskNames)
              .taskStatus(taskStatus)
              .tickFormat(format)
              .height(450).width(800);

var timeDomainString = "1day";

gantt.timeDomainMode("fixed");
changeTimeDomain(timeDomainString);
gantt(tasks);

//Functions
//----------------------------------------------------------------------------------
function changeTimeDomain(timeDomainString) 
{
  this.timeDomainString = timeDomainString;
  switch (timeDomainString) {
    case "1hr":
      format = "%H:%M:%S";
      gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -1), getEndDate() ]);
    break;
    case "3hr":
      format = "%H:%M";
      gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -3), getEndDate() ]);
    break;
    case "6hr":
      format = "%H:%M";
      gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -6), getEndDate() ]);
    break;
    case "1day":
      format = "%H:%M";
      gantt.timeDomain([ d3.time.day.offset(getEndDate(), -1), getEndDate() ]);
    break;
    case "1week":
      format = "%a %H:%M";
      gantt.timeDomain([ d3.time.day.offset(getEndDate(), -7), getEndDate() ]);
    break;
    default:
      format = "%H:%M"
    }
    gantt.tickFormat(format);
    gantt.redraw(tasks);
}
//-----------------------------------------------------------------------------
function getEndDate() 
{
  return (tasks.length > 0)? tasks[tasks.length - 1].endDate:Date.now();
}
//-----------------------------------------------------------------------------
function addTask() 
{
    var lastEndDate = getEndDate();
    var taskStatusKeys = Object.keys(taskStatus);
    var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
    var taskName = taskNames[Math.floor(Math.random() * taskNames.length)];
  
    tasks.push({
      "startDate" : d3.time.hour.offset(lastEndDate, Math.ceil(1 * Math.random())),
      "endDate" : d3.time.hour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 1),
      "taskName" : taskName,
      "status" : taskStatusName
    });
  
    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};
//-----------------------------------------------------------------------------
function removeTask() 
{
    tasks.pop();
    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};
//-----------------------------------------------------------------------------
function clickMe(d)
{
  alert(d);
}