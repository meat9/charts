require("dotenv").config();
const bodyParser = require("body-parser");
const workerLite = require("./worker/lite.js");
const workerUniversal = require("./worker/universal.js");
const express = require("express");
const app = express();

// Настройка парсера JSON с обработкой ошибок
app.use(
  bodyParser.json({
    limit: "100mb",
    strict: true, // Разрешаем только объекты/массивы (по умолчанию)
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        throw new Error("Invalid JSON");
      }
    },
  })
);

app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// Middleware для обработки ошибок парсинга
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError || err.message === "Invalid JSON") {
    return res.status(400).json({
      error: "Invalid JSON format",
      message: "Request body must be valid JSON object/array",
    });
  }
  next();
});

const host = process.env.HOST;
const port = process.env.PORT;

/// Метод обработчик проверки доступности сервиса
/// **Параметры**
/// **Возвращаемое значение**
///   - { status: "ok" }
/// **Примеры**
/// <code>
///     (GET) http://server:port/health
/// </code>
app.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});

/// Метод обработчик пост запросов по адресу /lite
/// сделан для обработки координат гистограмм/скаттерграмм с приборов
/// **Параметры**
///  - bodymas     - 1/0 массив графиков или один график
///  - typeresult  - тип возвращаемого результата
///  -- png        - изображение (закодированное в base64)
///  -- svg        - svg элемент (закодированный в base64)
///  - width       - ширина возвращаемого графика
///  - height      - высота возвращаемого графика
/// **Возвращаемое значение**
/// {
///     "result": [
///       {
///         "GraphLite": [
///           {
///             "PLTF": "iVBORw0KGgoAAAANSUhEUgAAAyAAAAJYCAYAAA"
///           }
///         ]
///       }
///     ]
///   }
///
/// **Примеры**
/// <code>
///     (POST) http://server:port/lite?bodymas=1&typeresult=png
/// </code>
app.post("/lite", async (req, res) => {
  // await writeBody(req.body,'./config.json')
  if (!req.body || Object.keys(req.body).length == 0) {
    return res.status(400).send({ error: "body пустой" });
  }
  try {
    var typeChart = req.query.typeresult;
    var typeCoords = req.query.bodymas;
    var chartsSetArr = {};
    chartsSetArr.width = req.query.width;
    chartsSetArr.height = req.query.height;
    chartsSetArr.body = req.body;
    var result = {};
    var status = await workerLite.main(
      chartsSetArr,
      typeChart,
      typeCoords,
      result
    );
    if (status == 0) {
      return res.status(400).send({ error: result });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

/// Метод обработчик пост запросов по адресу /charts
/// сделан для обработки координат для универсальных графиков
/// **Параметры**
///  - typeresult  - тип возвращаемого результата
///  -- png        - изображение (закодированное в base64)
///  -- svg        - svg элемент (закодированный в base64)
/// **Возвращаемое значение**
/// {
///     "result": "iVBORw0KGgoAAAANSUhEUgAAAyAA"
///   }
///
/// **Примеры**
/// <code>
///     (POST) http://server:port/charts?typeresult=png
/// </code>
app.post("/charts", async (req, res) => {
  // await writeBody(req.body,'./config.json')
  if (!req.body || Object.keys(req.body).length == 0) {
    return res.status(400).send({ error: "body пустой" });
  }
  try {
    var typeChart = req.query.typeresult;
    var resultParam = req.query.resultParam || 0;
    var result = {};
    var status = await workerUniversal.main(
      req.body,
      typeChart,
      result,
      resultParam
    );
    if (status == 0) {
      return res.status(400).send({ error: result });
    }

    if (typeChart == "svg" && resultParam == "2") {
      return res.send(result.result);
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

/// Метод запускающий api
/// **Параметры**
///  - port  - порт
/// **Возвращаемое значение**
///  - сообщение с адресом по которому развернут api
/// **Примеры**
app.listen(port, function () {
  console.log(`server listens http://${host}:${port}`);
});

/// Функция для записи тела запроса в json файл
/// отладочная функция
/// **Параметры**
///  - body  - тело запроса
///  - path  - путь для сохранения
/// **Возвращаемое значение**
/// **Примеры**
async function writeBody(body, path) {
  const { writeFileSync } = require("fs");
  //const path = './config.json';
  writeFileSync(path, JSON.stringify(body, null, 2), "utf8");
  return 1;
}
