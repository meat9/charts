const {
  Chart,
  ElemChart,
  ElemChartData,
  Table,
  TextLegend,
} = require("./draw_charts_universal.js");

const util = require("./util.js");

/// Головная функция обработчик. Определяет в каком формате пришли данные и
/// в каком формате необходим ответ
///
/// **Параметры**
///  - array     - массив данных
///  - type      - тип возвращаемых графиков
///  -- svg      - закодированный SVG элемент
///  -- png      - закодированное PNG изображение
///  - result    - массив для записи результата
/// **Возвращаемое значение**
/// заполненный массив result
///
/// **Примеры**
/// <code>
///     await workerUniversal.main(chartsSetArr,typeChart,typeCoords,result);
/// </code>
async function main(array, type, result) {
  if (type == "png") {
    var resString = await getChartPng(array);
  } else if (type == "svg") {
    var resString = await getChartSvg(array, 1);
  } else {
    var resString =
      "параметр typeresult должен иметь значение png или svg получено: " + type;
    result.error = resString;
    return 0;
  }
  result.result = resString;
  return 1;
}

/// Функция вызывает формирование графика и возвращет его в виде
/// svg элемента или закодированного в base64 svg элемента
///
/// **Параметры**
///  - data       - массив координат
///  - param      - тип возвращаемых графиков
///  -- 0         - возврат SVG элемента
///  -- 1         - возврат закодированного SVG элемента
/// **Возвращаемое значение**
/// строка с графиком (svg или base64)
///
/// **Примеры**
/// <code>
///     await workerLite.getChartSvg(array, 1);
/// </code>
async function getChartSvg(data, param = 0) {
  if (param == 0) {
    var svgstr = createCharts(data);
  }
  if (param == 1) {
    var svgstr = new Buffer.from(createCharts(data)).toString("base64");
  }
  return svgstr;
}

/// Функция вызывает формирование графика и возвращет его в виде
/// закодированного изображения PNG в base64
///
/// **Параметры**
///  - data       - массив координат
/// **Возвращаемое значение**
/// файл png в закодированный в base64
///
/// **Примеры**
/// <code>
///     await workerLite.getChartPng(array);
/// </code>
async function getChartPng(data) {
  var svgstr = await getChartSvg(data, 0);
  return await util.screenShoot(svgstr);
}

/// Функция создает экземпляр класса Chart и заполняет его
/// элементами (классы   ElemChart,ElemChartData,Table,TextLegend)
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
      element = addElemTochart(line);
      plot.lines.push(element);
    }
  }
  if (checkName(elem, "areas")) {
    for (area of elem.areas) {
      element = addElemTochart(area);
      plot.areas.push(element);
    }
  }
  if (checkName(elem, "dots")) {
    for (dot of elem.dots) {
      element = addElemTochart(dot);
      plot.dots.push(element);
    }
  }
  if (checkName(elem, "tables")) {
    for (table of elem.tables) {
      element = new Table(table);
      plot.tables.push(element);
    }
  }
  if (checkName(elem, "text_legend")) {
    element = new TextLegend(elem.text_legend);
    plot.text_legend.push(element);
  }
  return plot.drawDiagram();
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

/// Функция создает экземпляр класса ElemChart и заполняет его
/// элементами (класс ElemChartData)
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
function addElemTochart(array) {
  var elemObj = new ElemChart(
    array.name,
    array.params,
    array.style,
    array.attributes
  );
  for (dot of array.data) {
    var dot = new ElemChartData(dot);
    elemObj.data.push(dot);
  }
  return elemObj;
}

module.exports = {
  main,
};
