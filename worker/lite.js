const charts_lite = require("./draw_charts_lite.js");
const util = require("../utils/util.js");

/// Головная функция обработчик. Определяет в каком формате пришли данные и
/// в каком формате необходим ответ
///
/// **Параметры**
///  - array     - массив данных
///  - type      - тип возвращаемых графиков
///  -- svg      - закодированный SVG элемент
///  -- png      - закодированное PNG изображение
///  - masCoord  - тип входящих данных (массив графиков или один график)
///  -- 0        - один график
///  -- 1        - несколько графиков
///  - result    - массив для записи результата
/// **Возвращаемое значение**
/// заполненный массив result
///
/// **Примеры**
/// <code>
///     await workerLite.main(chartsSetArr,typeChart,typeCoords,result);
/// </code>
async function main(array, type, masCoord, result) {
  if (masCoord == 1) {
    if (type == "png") {
      var resString = [];
      await getChartLiteMas(array, resString, 1);
    } else if (type == "svg") {
      var resString = [];
      await getChartLiteMas(array, resString, 0);
    } else {
      var resString =
        "параметр typeresult должен иметь значение png или svg получено: " +
        type;
      result.error = resString;
      return 0;
    }
  } else if (masCoord == 0) {
    if (type == "png") {
      var resString = await getChartLitePng(array);
    } else if (type == "svg") {
      var resString = await getChartLiteSvg(array, 1);
    } else {
      var resString =
        "параметр typeresult должен иметь значение png или svg получено: " +
        type;
      result.error = resString;
      return 0;
    }
  } else {
    var resString =
      "параметр bodymas должен иметь значение 1 или 0 получено: " + masCoord;
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
///     await workerLite.getChartLiteSvg(array, 1);
/// </code>
async function getChartLiteSvg(data, param = 0) {
  if (param == 0) {
    var svgstr = charts_lite.initDiagramnew(data);
  }
  if (param == 1) {
    var svgstr = btoa(charts_lite.initDiagramnew(data));
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
///     await workerLite.getChartLitePng(array);
/// </code>
async function getChartLitePng(data) {
  var svgstr = await getChartLiteSvg(data, 0);

  // медленный вариант с браузером
  // var height=data.chart_params.height;
  // var width=data.chart_params.width;

  // if (typeof height=="undefined"){height=500}
  // if (typeof width=="undefined"){width=500}
  // var width=width*1.1
  // var height=height*1.1
  //return await util.screenShoot(svgstr,height,width);
  

  return await util.svgToPngBase64(svgstr) // быстрый вариант без браузера
}

/// Функция обработчик массива графиков
///
/// **Параметры**
///  - data       - массив координат
///  - resMas     - массив для записи результата
///  - param      - тип возвращаемых графиков (SVG или PNG)
///  -- 0         - SVG закодированные в BASE64
///  -- 1         - PNG закодированные в BASE64
/// **Возвращаемое значение**
/// заполненный массив с данными
///
/// **Примеры**
/// <code>
///     await workerLite.getChartLiteMas(array);
/// </code>
async function getChartLiteMas(data, resMas, param) {
  var resPar = {};
  resPar.width = data.width;
  resPar.height = data.height;
  for (let [k, v] of iterateObject(data.body)) {
    var resObj = {};
    var listObj = [];
    for (var item of data.body[k].ch1) {
      var resItem = {};
      resPar.body = item[0];
      var name = item[0][0].Duname;
      if (param == 0) {
        var stringRes = await getChartLiteSvg(resPar, 1);
      }
      if (param == 1) {
        var stringRes = await getChartLitePng(resPar);
      }
      resItem[name] = stringRes;
      listObj.push(resItem);
    }
    resObj[k] = listObj;
    resMas.push(resObj);
  }
  return 1;
}

/// Вспомогательная функция для итерации по полям объекта
///
/// **Параметры**
///  - obj       - объект
/// **Возвращаемое значение**
/// **Примеры**
/// <code>
///      for (let [key, value] of iterateObject(object))
/// </code>
let iterateObject = function* (obj) {
  for (let k in obj) yield [k, obj[k]];
};

module.exports = {
  main,
};
