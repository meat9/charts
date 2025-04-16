const { Chart } = require("../models/Chart.js");
const { ChartElement } = require("../models/ChartElement.js");
const { ChartElementData } = require("../models/ChartElementData.js");
const { Table } = require("../models/Table.js");
const { TextLegend } = require("../models/TextLegend.js");
const { SVG } = require("../models/SVG.js");
const util = require("../utils/util.js");

/// Головная функция обработчик. Определяет в каком формате пришли данные и
/// в каком формате необходим ответ
///
/// **Параметры**
///  - body           - тело запроса
///  - type           - тип возвращаемых графиков
///    -- svg           -- SVG элемент
///    -- png           -- PNG изображение
///  - answer         - массив для записи результата
///  - resultParam    - параметр возврата результата
///    -- 0             -- для type=SVG не будет выполняться кодирование в base64
///    -- 1             -- для type=SVG будет выполняться кодирование в base64
///    -- 2             -- для type=SVG не будет выполняться кодирование в base64
///
/// **Возвращаемое значение**
/// заполненный массив result
///
/// **Примеры**
/// <code>
///     await workerUniversal.main(chartsSetArr,typeChart,typeCoords,result);
/// </code>
async function main(body, type, answer, resultParam) {

  var resString = createSVG(body);

  if (type == "svg" && (resultParam == "1" || resultParam == "2")) {
    answer.result = resString;
  }
  else if (type == "svg" && resultParam == "0") {
    answer.result = new Buffer.from(resString).toString("base64");
  }
  else if (type == "png") {
    answer.result = await util.svgToPngBase64(resString);
  }
  else {
    answer.error = "Ошибочная комбинация параметров. resultParam=" + resultParam + " type=" + type;
  }

  return 1;
}


function createSVG(elem) {
  var svg = new SVG(elem.params);

  for (item of elem.charts) {
    element = createCharts(item);
    svg.charts.push(element);
  }

  return svg.generateCharts();
}
/// Функция создает экземпляр класса Chart и заполняет его
/// элементами (классы   ChartElement,ChartElementData,Table,TextLegend)
/// и вызывает метод drawDiagram для генерации графика
///
/// **Параметры**
///  - elem       - массив с данными графика
/// **Возвращаемое значение**
/// html созданного графика
/// **Примеры**
/// <code>
///      var svgstr = createCharts(data);
/// </code>
function createCharts(elem) {
  var plot = new Chart(elem.chart_params);

  if (checkName(elem, "lines")) {
    for (line of elem.lines) {
      element = addElemTochart(line, "lines");
      plot.lines.push(element);
    }
  }
  if (checkName(elem, "areas")) {
    for (area of elem.areas) {
      element = addElemTochart(area, "areas");
      plot.areas.push(element);
    }
  }
  if (checkName(elem, "dots")) {
    for (dot of elem.dots) {
      element = addElemTochart(dot, "dots");
      plot.dots.push(element);
    }
  }
  if (checkName(elem, "tables")) {
    for (table of elem.tables) {
      element = new Table(table);
      plot.tables.push(element);
    }
  }
  if (checkName(elem, "text_legends")) {
    for (legend of elem.text_legends) {
      element = new TextLegend(legend);
      plot.text_legends.push(element);
    }
  }

  return plot;
}

/// Вспомогательная функция для проверки наличия поля у объекта
///
/// **Параметры**
///  - obj       - объект
///  - name      - название поля
/// **Возвращаемое значение**
///   true/false
/// **Примеры**
/// <code>
///      if (checkName(elem, "text_legend"))
/// </code>
function checkName(obj, name) {
  return Object.keys(obj).includes(name);
}

/// Функция создает экземпляр класса ChartElement и заполняет его
/// элементами (класс ChartElementData)
/// и вызывает метод drawDiagram для генерации графика
///
/// **Параметры**
///  - array       - массив с данными элемента графика
/// **Возвращаемое значение**
/// экземпляр созданного класса объекта
/// **Примеры**
/// <code>
///      element = addElemTochart(dot);
/// </code>
function addElemTochart(array, elemName) {
  if (!array?.name || typeof array?.name !== "string") {
    array.name = elemName;
  }
  if (!array?.params?.type || typeof array?.params?.type !== "string") {
    try {
      array.params.type = elemName;
    } catch {
      array["params"] = { type: elemName };
    }
  }
  var elemObj = new ChartElement(
    array.name,
    array.params,
    array.style,
    array.attributes
  );
  for (dot of array.data) {
    var dot = new ChartElementData(dot);
    elemObj.data.push(dot);
  }
  return elemObj;
}

module.exports = {
  main,
};
