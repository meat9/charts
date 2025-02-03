const d3 = require("d3");
const jsdom = require("jsdom");

function initDiagramnew(data) {
  var { JSDOM } = jsdom;
  var document = new JSDOM().window.document;
  var width = data.width;
  var height = data.height;
  if (width === undefined || width === null) {
    var width = 500;
  }
  if (height === undefined || height === null) {
    var height = 500;
  }

  var array = data.body;
  if (array === undefined || array === null) {
    return 0;
  }

  var res = drawW(array, width, height, document);
  return res;
}

function drawW(elem, width, height, document) {
  //;Построение линий осей
  var listing = [];
  var tickLabels = [];
  var type = elem[0].Duname;
  var color = "blue";
  if (type == "PLTH" || type == "PLT") {
    var color = "green";
  }
  if (type == "RBCH" || type == "RBC") {
    var color = "red";
  }
  if (type == "WBCF" || type == "WBCF") {
    var color = "yellow";
  }
  if (type == "WBCT" || type == "WBC") {
    var color = "lightblue";
  }

  if (elem[0]["Arg1"] != "HIST") {
    elem.forEach(function (d, i) {
      tickLabels.push(d.name);
      listing.push(d.date);
    });
  }
  if (elem[0]["Arg1"] == "HIST") {
    for (let i = 0; i < elem[elem.length - 1].date; i += 10) {
      tickLabels.push(i);
      listing.push(i);
    }
  }
  var wSvg = width;
  var hSvg = height;
  var width = width * 0.85;
  var height = height * 0.85;
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var yAxis = d3.axisLeft(y).tickSize(-width);
  var xAxis = d3.axisBottom(x).tickSize(height);

  var linenow = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.result);
    });

  //Создание SVG контейнера, где будет находиться графики
  if (elem[0]["Arg1"] == "GTT" || elem[0]["Arg1"] == "protein") {
    var svg = d3
      .select(document.body)
      .append("svg")
      .classed("svg-container", true)
      .attr("id", elem[0]["Duname"])
      .attr("viewBox", "-10 0 " + width * 1.1 + " " + 1.15 * height)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .classed("svg-content-responsive", true);
  }

  if (elem[0]["Arg1"] != "GTT" && elem[0]["Arg1"] != "protein") {
    var divStart = d3
      .select(document.body)
      .append("div")
      .attr("class", "charts");
    var svg = divStart
      .append("svg")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .classed("svg-container", true)
      .attr("id", elem[0]["Duname"])
      .attr("width", wSvg)
      .attr("height", hSvg);
  }

  // svg.append('defs').append('clipPath').attr('id', 'clip').append('rect').attr('width', width*0.95).attr('height', height*0.95);
  var area = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x(function (d) {
      return x(d.date);
    })
    .y0(function (d) {
      return y(d.low);
    })
    .y1(function (d) {
      return y(d.high);
    });

  var focus = svg
    .append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + width * 0.1 + "," + height * 0.1 + ")");
  var focus_text = svg.append("g").attr("class", "focus_title"); //.attr('transform', 'translate(' + (width * 0.05) + ',' + height * 0.05 + ')');

  var legend = svg.append("g").attr("class", "legend");

  if (elem[0]["Arg1"] != "GTT" && elem[0]["Arg1"] != "protein") {
    svg
      .append("g")
      .attr("class", "legend")
      .append("text")
      .attr(
        "transform",
        "translate(" + width * 0.05 + "," + height * 0.05 + ")"
      )
      .style("font-size", width * 0.03 + "px")
      .text(elem[0].Duname);
  }

  if (elem[0]["Arg1"] != "HIST" && elem[0]["Arg1"] != "DIFF") {
    var legendref = svg.append("g").attr("class", "legend2");
    legendref
      .append("rect")
      .attr("x", width - width * 0.98)
      .attr("y", height * 0.05 - 20)
      .attr("fill", "yellow")
      .attr("stroke", "black")
      .attr("width", 10)
      .attr("height", 10);
    legendref
      .append("text")
      .attr(
        "transform",
        "translate(" + (width - width * 0.95) + "," + (height * 0.05 - 10) + ")"
      )
      .style("font-size", "12px")
      .text("Реф.границы");
    legend
      .append("rect")
      .attr("x", width - width * 0.98)
      .attr("y", height * 0.05 - 5)
      .attr("fill", "blue")
      .attr("stroke", "black")
      .attr("width", 10)
      .attr("height", 10);
    legend
      .append("text")
      .attr(
        "transform",
        "translate(" + (width - width * 0.96) + "," + (height * 0.05 + 5) + ")"
      )
      .style("font-size", "12px")
      .text(elem[1].Duname);
  }

  return drawChart(
    svg,
    elem,
    x,
    y,
    focus,
    yAxis,
    xAxis,
    color,
    linenow,
    focus_text,
    area,
    width,
    height
  );
}

//;Функция по отрисовке графика

function drawChart(
  svg,
  data,
  x,
  y,
  focus,
  yAxis,
  xAxis,
  color,
  linenow,
  focus_text,
  area,
  width,
  height
) {
  //Определение максимума по осям Х и Y

  var max = Math.max.apply(
    Math,
    data.map(function (o) {
      return o.date;
    })
  );
  var maxy = Math.max.apply(
    Math,
    data.map(function (o) {
      return o.result;
    })
  );
  //Отрисовка осей гфика и миниграфика
  x.domain([0.001, max * 1.1]);
  y.domain([0.001, maxy * 1.1]);

  //Отрисовка описания справа от графика
  if (data[0].legend) {
    var title = data[0].legend.split(/\n/).filter((n) => n);
    title.forEach(function (v, i, a) {
      focus_text
        .append("text")
        .attr("transform", "translate(2," + (height + i * 20) + ")")
        .style("font-size", "12px")
        .text(a[i]);
    });
  }
  // Отрисовка названия осей
  var xLines = focus.append("g").attr("class", "x axis").call(xAxis);
  xLines.selectAll("text").style("font-size", width * 0.02 + "px");
  xLines.selectAll("line").style("stroke", "#D3D3D3");
  xLines.selectAll("path").style("stroke", "#D3D3D3");

  var yLines = focus.append("g").attr("class", "y axis").call(yAxis);
  yLines.selectAll("text").style("font-size", height * 0.02 + "px");
  yLines.selectAll("line").style("stroke", "#D3D3D3");
  yLines.selectAll("path").style("stroke", "#D3D3D3");

  //Отрисовка площадей на графиках
  if (data[0]["Arg1"] != "HIST" && data[0]["Arg1"] != "DIFF") {
    focus.append("path").datum(data).attr("class", "area").attr("d", area);
  }
  if (data[0]["Arg1"] == "HIST") {
    var area2 = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x(function (d) {
        return x(d.date);
      })
      .y0(function (d) {
        return y(0);
      })
      .y1(function (d) {
        return y(d.result);
      });

    focus
      .append("path")
      .style("fill", color)
      .style("opacity", "0.5")
      .datum(data)
      .attr("class", "area")
      .attr("d", area2);
  }
  //    ;Отрисовка точек на графике

  var data2 = filterdata(data, 2);
  var dot = focus.append("g").selectAll("circle").data(data2).enter();
  if (data[0]["Arg1"] == "DIFF") {
    dot
      .append("circle")
      .attr("class", "circle")
      .attr("r", function (d) {
        return d.size;
      })
      .attr("fill", function (d) {
        return "#" + d.color;
      })
      .attr("cx", function (d) {
        if (d.result !== 0) {
          return x(d.date);
        }
      })
      .attr("cy", function (d) {
        if (d.result !== 0) {
          return y(d.result);
        }
      });
  }

  if (data[0]["Arg1"] != "HIST" && data[0]["Arg1"] != "DIFF") {
    dot
      .append("circle")
      .attr("class", "circle")
      .attr("r", "4")
      .style("fill", "blue")
      .attr("cx", function (d) {
        if (d.result !== 0) {
          return x(d.date);
        }
      })
      .attr("cy", function (d) {
        if (d.result !== 0) {
          return y(d.result);
        }
      });

    if (data[0]["Arg1"] != "DIFF") {
      focus
        .append("path")
        .datum(data)
        .attr("class", "linelite")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("d", linenow);
    }
  }
  return svg.node().outerHTML;
}

function filterdata(data, type) {
  var empIds = Array.from(Array(data.length).keys());
  var filteredArray = data.filter(function (itm) {
    if (type == 2 && itm.result !== 0) {
      return empIds.indexOf(itm.exclude) != 1;
    }
  });
  return filteredArray;
}

module.exports = {
  initDiagramnew,
};
