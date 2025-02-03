class Chart {
  d3 = require("d3");
  d3sel = require("d3-selection-multi");
  jsdom = require("jsdom");
  header = "";
  header_font_size = 25;
  name = "";
  width = 500;
  height = 500;
  maxX = 100;
  maxY = 100;
  minX = 0.001;
  minY = 0.001;
  footer = "";
  footer_font_size = 25;
  lines = [];
  areas = [];
  dots = [];
  tables = [];
  text_legend = [];
  rect_legend = [];
  divStart = "";
  constructor(args) {
    Object.assign(this, args);
  }

  createSVG() {
    var { JSDOM } = this.jsdom;
    var document = new JSDOM().window.document;
    var wSvg = this.width;
    var hSvg = this.height;
    this.divStart = this.d3
      .select(document.body)
      .append("div")
      .attr("class", "charts");
    if (this.header != "") {
      this.divStart
        .append("div")
        .attr("class", "Title")
        .text(this.header)
        .attr(
          "style",
          "white-space: pre-wrap;text-align:center;font-size:" +
            this.header_font_size +
            "px;"
        );
    }
    var svgElement = this.divStart
      .append("svg")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .classed("svg-container", true)
      .attr("id", this.name)
      .attr("width", wSvg)
      .attr("height", hSvg);
    if (this.footer != "") {
      this.divStart
        .append("div")
        .attr("class", "footer")
        .text(this.footer)
        .attr(
          "style",
          "white-space: pre-wrap;text-align:center;font-size:" +
            this.footer_font_size +
            "px;"
        );
    }
    return svgElement;
  }
  getStyles(arr) {
    var result = "";
    for (var elem of arr) {
      try {
        for (const [key, value] of Object.entries(elem)) {
          result = result + key.toString() + ":" + value.toString() + ";";
        }
      } catch {
        var result = "";
      }
    }
    return result;
  }
  drawLines(focus, x, y) {
    for (line of this.lines) {
      var strStyle = this.getStyles([line.style]);
      var lineDOM = this.d3
        .line()
        .curve(this.d3.curveMonotoneX)
        .x(function (d) {
          return x(d.x);
        })
        .y(function (d) {
          return y(d.y);
        });
      focus
        .append("path")
        .datum(line.data)
        .attr("class", "line")
        .attr("style", strStyle)
        .attr("d", lineDOM)
        .attrs(line.attributes);
      //focus.append('text').attr('transform','translate('+(width+3)+','+y(data[0].ccd_p)+')').attr('style','font-size: 14px;fill: black;').text(data[0].ccd_p_name);
    }
  }
  drawAreas(focus, x, y) {
    for (area of this.areas) {
      var strStyle = this.getStyles([area.style]);
      var areaDOM = this.d3
        .area()
        .curve(this.d3.curveMonotoneX)
        .x(function (d) {
          return x(d.x);
        })
        .y0(function (d) {
          return y(d.y);
        })
        .y1(function (d) {
          return y(d.y0);
        });
      focus
        .append("path")
        .datum(area.data)
        .attr("class", "area")
        .attr("style", strStyle)
        .attr("d", areaDOM)
        .attrs(area.attributes);
    }
  }
  drawDots(focus, x, y) {
    for (dot of this.dots) {
      var strStyle = this.getStyles([dot.style]);
      var dot = focus.append("g").selectAll("circle").data(dot.data).enter();
      dot
        .append("circle")
        .attr("class", "circle")
        .attr("style", strStyle)
        .attr("r", function (d) {
          return d.size;
        })
        .attr("fill", function (d) {
          return d.color;
        })
        .attr("cx", function (d) {
          if (d.result !== 0) {
            return x(d.x);
          }
        })
        .attr("cy", function (d) {
          if (d.result !== 0) {
            return y(d.y);
          }
        })
        .attrs(dot.attributes);
    }
  }
  drawAxis(focus, Axis, size, type, axisFontSize) {
    var lineAxis = focus.append("g").attr("class", type).call(Axis);
    if (axisFontSize!="") {lineAxis.selectAll("text").style("font-size", axisFontSize + "px");}
    else {lineAxis.selectAll("text").style("font-size", size * 0.02 + "px");}
    
    lineAxis.selectAll("line").style("stroke", "#D3D3D3");
    lineAxis.selectAll("path").style("stroke", "#D3D3D3");
  }
  darwAxisLegend(svg,axisText,width,height,isY) {

    if (isY==1) {var transform="translate(" + width + "," + height + ") rotate(-90)";}
    else {var transform="translate(" + width + "," + height + ")";}

    var focus_text = svg
      .append("g")
      .attr("class", "focus_title")
      .attr("transform",transform);
    var strStyle = this.getStyles([axisText.style]);
    var fontSize = axisText.style["font-size"];
    var text = axisText.text.split(/\n/).filter((n) => n);
    for (var i = 0; i < text.length; i++) {
      focus_text
        .append("text")
        .attr("class", "focus_title_text")
        .attr("style", strStyle)
        .attr("transform", "translate(1," + (i * fontSize + 5) + ")")
        .text(text[i]);
    }
  }
  
  darwTable(data) {
    for (table of data) {
      var headers = table.headers;
      var bodys = table.body;
      var strStyleHeaders = this.getStyles(table.styleHeaders);
      var strStyleBody = this.getStyles(table.styleBody);
      var strStyle = this.getStyles(table.style);

      //Создание таблицы
      var tableDOM = this.divStart
        .append("table")
        .attr("class", "tableshow")
        .attr("style", strStyle)
        .style("border-collapse", "collapse")
        .attrs(table.attributes);

      //Создание заголовка и тела таблицы
      var thead = tableDOM.append("thead");
      var tbody = tableDOM.append("tbody");
      //Заполнение заголовка таблицы
      for (var header of headers) {
        thead
          .append("tr")
          .selectAll("th")
          .data(header)
          .enter()
          .append("th")
          .attr("style", strStyleHeaders)
          .text(function (cell) {
            return cell;
          });
      }
      for (var body of bodys) {
        tbody
          .append("tr")
          .selectAll("td")
          .data(body)
          .enter()
          .append("td")
          .attr("style", strStyleBody)
          .text(function (cell) {
            return cell;
          });
      }
    }
  }
  darwLegend(focusText) {
    for (var legend of this.text_legend) {
      var strStyle = this.getStyles([legend.style]);
      var fontSize = legend.style["font-size"];
      var text = legend.text.split(/\n/).filter((n) => n);
      for (var i = 0; i < text.length; i++) {
        focusText
          .append("text")
          .attr("class", "focus_title_text")
          .attr("style", strStyle)
          .attr("transform", "translate(1," + (i * fontSize + 5) + ")")
          .text(text[i]);
      }
    }
  }
  drawDiagram() {
    var margin = { top: 0, right: 0, bottom: 0, left: 0 };
    var width = this.width * 0.85;
    var height = this.height * 0.85;
    var svg = this.createSVG();
    var minX=this.axis_x.min || this.minX
    var minY=this.axis_y.min || this.minY
    var maxX=this.axis_x.max || this.maxX
    var maxY=this.axis_y.max || this.maxY

    var formatX= this.axis_x.format || ''
    var formatY= this.axis_y.format || ''
    var axisYFontSize=this.axis_y.font_size || ''
    var axisXFontSize=this.axis_x.font_size || ''
    var cntTickY=this.axis_y.tick_count || maxY
    var cntTickX=this.axis_x.tick_count || maxX
    var nameY=this.axis_y.text || ''
    var nameX=this.axis_x.text || ''
    if (this.text_legend.length != 0) {
      margin.right = this.width * 0.15;
      var focus_text = svg
        .append("g")
        .attr("class", "focus_title")
        .attr(
          "transform",
          "translate(" +
            (width - margin.right) * 1.07 +
            "," +
            height * 0.1 +
            ")"
        );
    }

    var x = this.d3
      .scaleLinear()
      .range([0 + margin.left, width - margin.right])
      .domain([minX, maxX * 1.1]);
    var y = this.d3
      .scaleLinear()
      .range([height, 0])
      .domain([minY, maxY * 1.1]);
    var yAxis = this.d3.axisLeft(y).ticks(cntTickY,formatY).tickSize(-width + margin.right); //.tickFormat(this.d3.format(".0f"));
    var xAxis = this.d3.axisBottom(x).ticks(cntTickX,formatX).tickSize(height); //.tickFormat(this.d3.format(".0f"));

    var focus = svg
      .append("g")
      .attr("class", "focus")
      .attr(
        "transform",
        "translate(" + width * 0.1 + "," + height * 0.1 + ")"
      );
    this.drawAxis(focus, xAxis, width, "x axis", axisXFontSize,nameX);
    this.darwAxisLegend(svg,nameX,this.width * 0.50,this.height*0.98,0);
    this.drawAxis(focus, yAxis, height, "y axis", axisYFontSize,nameY);
    this.darwAxisLegend(svg,nameY,this.width * 0.04,this.height*0.5,1);
    this.drawLines(focus, x, y);
    this.drawAreas(focus, x, y);
    this.drawDots(focus, x, y);
    this.darwTable(this.tables);
    this.darwLegend(focus_text);
    return this.divStart.node().outerHTML;
  }
}

class ElemChart {
  name = "";
  params = {};
  style = {};
  attributes = {};
  data = [];
  constructor(name, params, style, attributes) {
    this.name = name;
    this.params = params;
    this.style = style;
    this.attributes = attributes;
    this.data = [];
  }
}
class ElemChartData {
  x = 0;
  y = 0;
  y0 = 0;
  color = "";
  size = 0;
  text = "";
  constructor(args) {
    Object.assign(this, args);
  }
}

class Table {
  headers = [];
  body = [];
  constructor(args) {
    Object.assign(this, args);
  }
}

class TextLegend {
  position = "";
  text = "";
  style = {};
  constructor(args) {
    Object.assign(this, args);
  }
}

module.exports = { Chart, ElemChart, ElemChartData, Table, TextLegend };
