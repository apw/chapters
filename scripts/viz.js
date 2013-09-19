/* global _ */

var format_result = require("./format_result").format_result;

var listToArray = function(xs) {
  var pair = xs;
  var kar = xs[0];
  var a = [];

  while(pair.length == 2) {
    var nextVal = pair[0];
    /*
    if (Object.prototype.toString.call( nextVal ) === '[object Array]') {
      nextVal = listToArray(nextVal);
    } */
    a.push(nextVal);
    pair = pair[1];
  }
  return a;
};

_hist = function(samps, title) {

  function mySort(array) {
    var firstElem = array[0];
    if (typeof(firstElem) == "number") {
      return array.sort(function(a,b) {return a-b});
    }
    if (typeof(firstElem) == "string") {
      return array.sort();
    }
    if (Object.prototype.toString.call(firstElem) === '[object Array]') {
      return array;
    }
    return array;
  }

  // TODO: this is a hack. we want proper conversion of data types
  var values = mySort(listToArray(samps)).map(function(x) {return format_result(x);}),
      strValues = values,//values.map(function(x) {return format_result(x);}),
      n = values.length,
      counts = _(strValues)
        .uniq()
        .map(function(val) {
          return {
            value: val,
            freq: _(strValues).filter(function(x) {return x == val;}).length / n
          };
        }),
      maxFreq = _(counts).chain().map(function(x) { return x.freq}).max().value();

  return function($div) {

    var $histDiv = $("<div></div>").appendTo($div);
    var div = $histDiv[0];
    
    //TODO: make left margin vary depending on how long the names of the elements in the list are
    var margin = {top: 40, right: 20, bottom: 60, left: 60},
        width = 0.8 * $div.width() - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var formatPercent = d3.format(".0%");

    var x = d3.scale.linear()
          .domain([0, maxFreq])
          .range([0, width]);
    var y = d3.scale.ordinal()
          .domain(values)
          .rangeRoundBands([height, 0], .1);

    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickFormat(formatPercent);
    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");

    var svg = d3.select(div).append("svg")
          .attr("class", "chart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height+ margin.top + margin.bottom)
          .style('margin-left', '10%')
          .style('margin-top', '20px')
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // d3.tsv("data.tsv", type, function(error, data) {
    //   debugger;
    //   x.domain(data.map(function(d) { return d.letter; }));
    //   y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
    
    var data = counts;

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .text("Frequency")
      .attr("dy", "3em")
      .attr("x", (width/2))
      .attr("text-anchor", "middle");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", function(d) {return y(d.value);})
      .attr("width", function(d) { return x(d.freq); })
      .attr("height", y.rangeBand());
    // });
    
    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .attr("stroke", "none") 
        .attr("fill", "black")
        .text(title);
        
    var $clearButton = $("<button>Delete Histogram</button>")
    $clearButton.appendTo($histDiv);
    $clearButton.click(function() {
      $histDiv.remove();
    });

    return data;

  };

};
