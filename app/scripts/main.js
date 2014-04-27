var data,
    railData, // an array of days
    svg,
    set = "road",
    margin = {top: 0, right: 10, bottom: 110, left: 10},
    width = $(window).width() - margin.left - margin.right,
    height = $(window).height() - margin.top - margin.bottom,
    variable = "volume";
    unitsOfMeasure = { "volume" : "vehicles", "speed" : "mph" };
  
d3.json("../sample.json", function (json) {
  data = [];
  for (var date in json) {
    var day = json[date].data;
    for (var route in day) {
      if (day[route] !== null) {
        var name = route;
        data.push({"roadway": name,
          "date": new Date(json[date].day),
          "speed": +day[route].speed,
          "volume": +day[route].volume,
          "event": day[route].event});
      }
    }
  }
});

d3.json("../rail_count_info.json", function (json) {
  railData = [];
  for (var date in json) {
    for (var route in json[date]) {
      railData.push({"roadway": route,
        "date": new Date(date),
        "volume": json[date][route].passengerCount});
    }
  }
});


colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];

$("document").ready(function() {
  if (set === "rail") {
    DS = railData;
  }
  else {
    DS = data;
  }
  graph();
});

$(window).on("resize", function() {
  transitionWidth();
});

function transitionWidth() {
  width = $(window).width();
  d3.select("svg").attr("width", width);
  x = d3.time.scale().range([0, width]);
  area = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

  d3.select(".axis")
    .transition()
    .duration(2500)
    .call(drawNewXAxis);
  drawYAxis();
  svg.selectAll(".layer")
    .transition()
    .duration(1500)
    .attr("d", function(d) { area(d.values); });
}

function transitionDataSet(dataset) {
  variable = dataset;
  stack = d3.layout.stack()
    .offset("silhouette")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d[variable]; });
  layers = stack(nest.entries(DS));
  drawYAxis();
  svg.selectAll('.layer')
    .transition()
    .duration(1500)
    .attr("d", function(d) { return area(d.values); });
}



var datearray = [];
var dateFormat = d3.time.format('%m/%d')

var tooltip = d3.select("#river")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("top", "30px")
    .style("visibility", "hidden");

var x = d3.time.scale()
  .range([0, width]);

var y = d3.scale.linear()
  .range([height-10, 0+10]);

var z = d3.scale.ordinal()
  .range(colorrange);

var stack = d3.layout.stack()
  .offset("silhouette")
  .values(function(d) { return d.values; })
  .x(function(d) { return d.date; })
  .y(function(d) { return d[variable]; });

var nest = d3.nest()
    .key(function(d) { return d.roadway; });

var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d)  { return x(d.date); })
    .y0(function(d) {  return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

function graph() {
  svg = d3.select("#river")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  if (set === "rail") {
    newdata = nest.entries(DS).filter(function (element) { return element.values.length == 322});
  }
  else {
    newdata = nest.entries(DS);
  }
  console.log(newdata);
  for (var i in newdata) {
    newdata[i].values.sort(function(a,b){
      a = new Date(a.date);
      b = new Date(b.date);
      return a<b?-1:a>b?1:0;
    });
  }
  layers = stack(newdata);
  drawXAxis();
  drawYAxis();
  $(".tick text").eq(0).attr("x", "20px");
  $(".tick text").eq(6).attr("x", "-30px");

  svg.selectAll(".layer")
    .data(layers)
    .enter().append("path")
    .attr("class", "layer")
    .attr("d", function(d) { return area(d.values); })
    .style("fill", function(d, i) { return z(i); });

  svg.selectAll(".layer")
    .attr("opacity", 1)
    .on("mouseover", function(d, i) {
      svg.selectAll(".layer").transition()
      .duration(250)
      .attr("stroke", colorrange[0]) 
      .attr("stroke-width", function(d, j) {
        return j != i ? 0 : 1;
      })
      .attr("opacity", function(d, j) {
        return j != i ? 0.6 : 1;
    });
      vertical.style("visibility", "visible");
    })
    .on("mouseout", function(d, i) {
    vertical.style("visibility", "hidden");
    svg.selectAll(".layer")
    .transition()
    .duration(250)
    .attr("stroke", "0px")
    .attr("opacity", "1")
    .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + currentDate + "</p>" ).style("visibility", "hidden")})

    .on("mousemove", function(d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x.invert(mousex);
      invertedx = invertedx.getMonth() + invertedx.getDate();
      var selected = (d.values);
      for (var k = 0; k < selected.length; k++) {
        datearray[k] = selected[k].date
        datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
      }

      mousedate = datearray.indexOf(invertedx);
      currentVal = d.values[mousedate][variable];
      currentDate = new Date(d.values[mousedate].date).toDateString().substring(0,3);;

      d3.select(this)
      .classed("hover", true)
      .attr("stroke", "black")
      .attr("stroke-width", "0.5px"), 
      tooltip.html( "<p>" + d.key + " - " + currentDate + "<br>" + currentVal + " " + unitsOfMeasure[variable] + "</p>" ).style("visibility", "visible");
    });

    var vertical = d3.select("#river")
      .append("div")
      .attr("class", "vertical")
      .style("position", "absolute")
      .style("z-index", "4000")
      .style("width", "1px")
      .style("height", (height) +"px")
      .style("top", (8) + "px")
      .style("bottom", "0px")
      .style("left", "0px")
      .style("background", "black")
      .style("visibility", "hidden");

    svg.on("mousemove", function(){  
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", (mousex+margin.left) + "px" )})
      .on("mouseover", function(){  
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", mousex+margin.left + "px")});
}

function drawXAxis() {
  x.domain = x.domain(d3.extent(DS, function(d) { return d.date; }));

  xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(7)
    .tickFormat(d3.time.format('%m/%d'))
    .tickSize(10);
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Date");
}

function drawNewXAxis() {
  x.domain = x.domain(d3.extent(DS, function(d) { return d.date; }));

  xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(7)
    .tickFormat(d3.time.format('%m/%d'))
    .tickSize(10);
  svg.select(".x.axis")
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxis)
    .select(".label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Date");
}

function drawYAxis() {
  y.domain([0, d3.max(DS, function(d) { return d.y0 + d.y; })]);
 // var yAxis = d3.svg.axis()
 //   .scale(y);
 // svg.append("g")
 //     .attr("class", "y axis")
 //     .call(yAxis.orient("left"));
}
