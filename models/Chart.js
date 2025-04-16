const util = require("../utils/util.js");
const d3 = require("d3");
const d3sel = require("d3-selection-multi");
const { JSDOM } = require("jsdom");

/// Класс для создания SVG-диаграмм с графиками и таблицами
class Chart {
  d3 = d3; // D3.js библиотека
  d3sel = d3sel; // Расширение для мульти-атрибутов D3

  // Статическое свойство для хранения экземпляров
  static instances = new Map(); // Хранилище экземпляров (id → instance)

  /// Конфигурация диаграммы по умолчанию
  defaultConfig = {
    name: "",
    width: 500,
    height: 500,
    lines: [],
    areas: [],
    dots: [],
    tables: [],
    text_legends: [],
    rect_legend: [],
    svgCont: "",
    chartCont: "",
  };

  constructor(args = {}) {
    Object.assign(this, this.defaultConfig, args);
    Chart.instances.set(this.id, this); // Сохраняем экземпляр
  }

  // Статический метод для вывода всех экземпляров
  static printAllInstances() {
    console.log("Все экземпляры Chart:");
    Chart.instances.forEach((instance, i) => {
      console.log(`[${i}]`, instance.id);
    });
  }

  // Статический метод для поиска по ID
  static getInstanceById(id) {
    return Chart.instances.get(id);
  }

  // Удаление экземпляра из хранилища
  // Статический метод для удаления по ID
  static deleteInstanceById(id) {
    if (Chart.instances.has(id)) {
      Chart.instances.delete(id);
      return true; // Успешное удаление
    }
    return false; // Экземпляр не найден
  }

  /// Создает базовый SVG-контейнер
  createSVG(svg, width, height, yStart) {
    if (svg === undefined) {
      const document = new JSDOM().window.document;
      this.svgCont = this.d3.select(document.body).append("svg").attrs({
        xmlns: "http://www.w3.org/2000/svg",
        class: "svg-container",
        id: "svgMain",
        width: this.width,
        height: this.height,
      });
    } else {
      this.svgCont = svg;
      this.width = parseInt(svg.attr("width"));
      this.height = parseInt(svg.attr("height"));
      this.widthMaxChart = width;
      this.heightMaxChart = height;
      this.widthChart = this.widthMaxChart * 0.8;
      this.heightChart = this.heightMaxChart * 0.8;
      this.yStartCoordFocus = yStart;
    }
  }

  // Создает контейнер для графика (с осями и в нужных размерах)
  createChart(endCoords) {
    // определим ширину,высоту графика и минимальные и максимальные значения по осям
    this.widthChart = this?.widthChart || this.width * 0.8;
    this.heightChart = this?.heightChart || this.height * 0.8;
    this.yStartCoordFocus = this.yStartCoordFocus || this.heightChart * 0.16;
    this.xStartCoordFocus = this.xStartCoordFocus || this.widthChart * 0.1;

    this.getMinMaxProcessor();

    this.chartCont = this.svgCont.append("g").attr("class", "chart");

    // отрисуем элемент для хранения данных графика в svg
    this.focus = this.chartCont
      .append("g")
      .attr("class", "focus")
      .attr(
        "transform",
        "translate(" + this.xStartCoordFocus + "," + this.yStartCoordFocus + ")"
      );

    // генерация данных для осей
    this.x = this.d3
      .scaleLinear()
      .range([0, this.widthChart])
      .domain([this.minX, this.maxX]);
    this.y = this.d3
      .scaleLinear()
      .range([this.heightChart, 0])
      .domain([this.minY, this.maxY]);

    endCoords.positionY = this.yStartCoordFocus + this.heightChart * 1.2;
    if ((endCoords?.positionX || 0) < this.widthMaxChart) {
      endCoords.positionX = this.widthMaxChart;
    }
  }

  ///Генерирует строку CSS из объекта стилей
  getStyles(styles = {}) {
    return Object.entries(styles)
      .map(([key, value]) => `${key}:${value}`)
      .join(";");
  }

  ///Рисует линии на диаграмме
  drawLines() {
    for (let line of this.lines) {
      var curve = line.params?.curve || 0;
      var viewDots = line.params?.view_dots || 0;

      var strStyle = this.getStyles(line.style);

      var lineGroup = this.focus
        .append("g")
        .attr("class", "line-group")
        .attrs(line.groupAttributes); // Дополнительные атрибуты группы

      var lineDOM = this.d3.line();

      //Условно добавляем кривую
      if (curve == 1) {
        lineDOM = lineDOM.curve(this.d3.curveMonotoneX);
      }

      lineDOM = lineDOM.x((d) => this.x(d.x)).y((d) => this.y(d.y));

      lineGroup
        .append("path")
        .datum(line.data)
        .attr("class", "line")
        .attr("d", lineDOM)
        .attr("style", strStyle)
        .attrs(line.attributes);

      if (viewDots == 1) {
        var fill = line?.style?.stroke || "green";
        lineGroup
          .selectAll("circle")
          .data(line.data)
          .enter()
          .append("circle")
          .attr("class", "data-point")
          .attr("cx", (d) => this.x(d.x))
          .attr("cy", (d) => this.y(d.y))
          .attr("r", 4)
          .attr("fill", fill);
      }
    }
  }

  /// Рисует закрашенные области на диаграмме
  drawAreas() {
    for (let area of this.areas) {
      var strStyle = this.getStyles(area.style);
      var areaDOM = this.d3
        .area()
        .curve(this.d3.curveMonotoneX)
        .x((d) => this.x(d.x))
        .y0((d) => this.y(d.y))
        .y1((d) => this.y(d.y0));
      this.focus
        .append("path")
        .datum(area.data)
        .attr("class", "area")
        .attr("style", strStyle)
        .attr("d", areaDOM)
        .attrs(area.attributes);
    }
  }

  /// Рисует точки данных на диаграмме
  drawDots() {
    for (let dot of this.dots) {
      var strStyle = this.getStyles(dot.style);
      var dotSingle = this.focus
        .append("g")
        .selectAll("circle")
        .data(dot.data)
        .enter();
      dotSingle
        .append("circle")
        .attr("class", "circle")
        .attr("style", strStyle)
        .attr("r", function (d) {
          return d.size;
        })
        .attr("fill", function (d) {
          return d.color;
        })
        .attr("cx", (d) => {
          if (d.result !== 0) {
            return this.x(d.x);
          }
        })
        .attr("cy", (d) => {
          if (d.result !== 0) {
            return this.y(d.y);
          }
        })
        .attrs(dot.attributes);
    }
  }

  // Обработчик для осей
  axisProcessor() {
    // определим форматирование текста у осей и стили
    var formatX = this.axis_x?.format ?? "";
    var formatY = this.axis_y?.format ?? "";

    // определим кол-во вертикальных и горизонтальных линий сетки графика
    var countTickY = this.axis_y?.tick_count ?? 15;
    var countTickX = this.axis_x?.tick_count ?? 15;

    // определим названия для осей
    var nameY = this.axis_y?.text ?? "";
    var nameX = this.axis_x?.text ?? "";

    // определим размер шрифта для осей
    var axisYFontSize = this.axis_y?.text?.style?.["font-size"] ?? "";
    var axisXFontSize = this.axis_x?.text?.style?.["font-size"] ?? "";

    this.yAxis = this.d3
      .axisLeft(this.y)
      .ticks(countTickY, formatY)
      .tickSize(-this.widthChart);
    this.xAxis = this.d3
      .axisBottom(this.x)
      .ticks(countTickX, formatX)
      .tickSize(this.heightChart);

    this.drawAxis(this.xAxis, this.widthChart, "x axis", axisXFontSize);
    this.drawAxisLegend(
      nameX,
      this.widthChart * 0.5,
      this.heightChart * 1.1 + this.yStartCoordFocus,
      0
    );
    this.drawAxis(this.yAxis, this.heightChart, "y axis", axisYFontSize);
    this.drawAxisLegend(
      nameY,
      this.widthChart * 0.02,
      this.heightChart * 0.5 + this.yStartCoordFocus,
      1
    );
  }

  /// Рисует оси диаграммы
  drawAxis(Axis, size, type, axisFontSize) {
    var lineAxis = this.focus.append("g").attr("class", type).call(Axis);
    if (axisFontSize != "") {
      lineAxis.selectAll("text").style("font-size", axisFontSize + "px");
    } else {
      lineAxis.selectAll("text").style("font-size", size * 0.02 + "px");
    }

    lineAxis.selectAll("line").style("stroke", "#D3D3D3");
    lineAxis.selectAll("path").style("stroke", "#D3D3D3");
  }

  /// Рисует подписи для осей диаграммы
  drawAxisLegend(axisText, width, height, isY) {
    if (axisText == "") {
      return;
    }
    if (isY == 1) {
      var transform = "translate(" + width + "," + height + ") rotate(-90)";
    } else {
      var transform = "translate(" + width + "," + height + ")";
    }

    var focus_text = this.chartCont
      .append("g")
      .attr("class", "focus_title")
      .attr("transform", transform);
    var strStyle = this.getStyles(axisText.style);
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

  // Обработчик для подписей к графику
  headFootProcessor() {
    this.drawHeaderFooter(
      this.footer,
      this.xStartCoordFocus,
      this.heightChart * 1.15 + this.yStartCoordFocus
    );
    this.drawHeaderFooter(
      this.header,
      this.xStartCoordFocus,
      this.yStartCoordFocus - 10
    );
  }

  /// Рисует заголовок или подвал для графика
  drawHeaderFooter(elem, width, height) {
    if (elem == "") {
      return;
    }
    if (typeof elem?.text == "undefined") {
      return;
    }
    var transform = "translate(" + width + "," + height + ")";
    var focus_text = this.chartCont
      .append("g")
      .attr("class", "focus_title")
      .attr("transform", transform);
    var text = elem.text.split(/\n/).filter((n) => n);
    var strStyle = this.getStyles(elem?.style);
    var fontSize = elem?.style?.["font-size"] ?? 8;
    for (var i = 0; i < text.length; i++) {
      focus_text
        .append("text")
        .attr("class", "focus_title_text")
        .attr("style", strStyle)
        .attr("transform", "translate(1," + (i * fontSize + 5) + ")")
        .text(text[i]);
    }
  }

  /// Добавляет текстовые аннотации на график
  drawTextOnChart() {
    // определим текст, который будет выводиться на графике
    var textConfig = this.text_legend_chart?.text ?? "";

    if (textConfig == "") {
      return;
    }

    var focus_text = this.focus.append("g").attr("class", "someTextOnChart");
    var strStyle = this.getStyles(this.text_legend_chart?.style);
    var fontSize = this.text_legend_chart?.style?.["font-size"] ?? 8;
    var text = this.text_legend_chart?.text.split(/\n/).filter((n) => n);
    for (var i = 0; i < text.length; i++) {
      focus_text
        .append("text")
        .attr("class", "some_elem_text")
        .attr("style", strStyle)
        .attr("font-size", fontSize)
        .attr("transform", "translate(1," + (i * fontSize + 5) + ")")
        .text(text[i]);
    }
  }

  /// Обработчик для таблиц
  tableProcessor(endCoords) {
    if (this.tables.length == 0) {
      return;
    }
    var dictMax = {};
    for (let table of this.tables) {
      this.drawTable(table, dictMax);
    }
    endCoords.positionY = dictMax.tableHeight + 10;
    if ((endCoords?.positionX || 0) < dictMax.tableWidth) {
      endCoords.positionX = dictMax.tableWidth;
    }
  }

  /// Рисует таблицу данных
  drawTable(params = {}, dictMax) {
    // выход, если нет строк или заголовков
    if (!params?.headers?.length || !params?.rows?.length) return;
    var rows = params.rows;
    var headers = params.headers;

    // Настройки по умолчанию
    var padStyleHead = params?.styles?.text?.headers?.padding ?? "";
    var padStyleRow = params?.styles?.text?.rows?.padding ?? "";
    var cellHeadHeight = params?.styles?.cells?.headers?.height ?? 35;
    var cellRowdHeight = params?.styles?.cells?.rows?.height ?? 35;
    var celHeadBgColor =
      params?.styles?.cells?.headers?.backgroundColor ?? "white";
    var celRowEvBgColor =
      params?.styles?.cells?.rows?.evenBackgroundColor ?? "grey";
    var celRowOdBgColor =
      params?.styles?.cells?.rows?.oddBackgroundColor ?? "white";
    var headerFontSize = params?.styles?.text?.headers["font-size"] ?? 14;
    var rowFontSize = params?.styles?.text?.rows["font-size"] ?? 14;
    var bordCol = params?.styles?.borders?.color ?? "black";
    var bordWidth = params?.styles?.borders?.width ?? 1.5;
    var stylesHeaders = params?.styles?.text?.headers ?? "";
    var stylesRows = params?.styles?.text?.rows ?? "";
    var strStyleHeaders = this.getStyles(stylesHeaders);
    var strStyleBody = this.getStyles(stylesRows);

    // Рассчитываем размеры отступа между строками и колонками
    if (typeof padStyleHead !== "" && padStyleHead) {
      var paddingHeader = padStyleHead;
    } else {
      var paddingHeader = 0.55 * headerFontSize;
    }
    if (typeof padStyleRow !== "" && padStyleRow) {
      var paddingRow = padStyleRow;
    } else {
      var paddingRow = 0.55 * rowFontSize;
    }

    // Рассчитываем общие размеры таблицы
    var columnWidths = util.getWidthTable(rows, headers, paddingHeader);
    var tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    var tableHeight = cellHeadHeight + rows.length * cellRowdHeight;

    // стартовая позиция для отрисовки таблицы
    var xStartCoord = this.xStartCoordFocus || 10;
    var yStartCoord = this.yStartCoordFocus + this.heightMaxChart || 10;
    this.heightMaxChart =
      this.heightMaxChart + tableHeight + 10 || this.heightMaxChart;
    dictMax.tableHeight = yStartCoord + tableHeight * 1.1;
    if ((dictMax?.tableWidth || 0) < tableWidth * 1.1) {
      dictMax.tableWidth = tableWidth * 1.1;
    }

    var svgTable = this.chartCont.append("g").attr("class", "table");

    // Рисуем фон у заголовка
    svgTable
      .append("rect")
      .attr("class", "headerbackground")
      .attr("x", xStartCoord)
      .attr("y", yStartCoord)
      .attr("width", tableWidth)
      .attr("height", cellHeadHeight)
      .attr("fill", celHeadBgColor);

    // Рисуем и заполняем заголовки таблицы
    var currentX = xStartCoord;
    for (var i = 0; i < headers.length; i++) {
      svgTable
        .append("text")
        .attr("class", "headertext")
        .attr("x", currentX + paddingHeader)
        .attr("y", yStartCoord + (cellHeadHeight / 2 + headerFontSize / 2))
        .attr("dominant-baseline", "middle")
        .attr("style", strStyleHeaders)
        .text(headers[i]);
      currentX += columnWidths[i];
    }

    // Работа со строками таблицы
    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const yPosition =
        yStartCoord + (cellHeadHeight + rowIndex * cellRowdHeight);
      const bgColor = rowIndex % 2 === 0 ? celRowEvBgColor : celRowOdBgColor;

      // рисуем фон строки
      svgTable
        .append("rect")
        .attr("class", "rowsbackground")
        .attr("x", xStartCoord)
        .attr("y", yPosition)
        .attr("width", tableWidth)
        .attr("height", cellRowdHeight)
        .attr("fill", bgColor);

      // рисуем и заполняем ячейки строки
      var cellX = xStartCoord;
      for (var cellIndex = 0; cellIndex < rows[rowIndex].length; cellIndex++) {
        svgTable
          .append("text")
          .attr("class", "rowstext")
          .attr("x", cellX + paddingRow)
          .attr("y", yPosition + cellRowdHeight / 2)
          .attr("dominant-baseline", "middle")
          .attr("style", strStyleBody)
          .text(rows[rowIndex][cellIndex]);
        cellX += columnWidths[cellIndex];
      }
    }

    // Вертикальные границы таблицы
    var borderX = xStartCoord;
    for (var i = 0; i <= columnWidths.length; i++) {
      svgTable
        .append("line")
        .attr("class", "borderY")
        .attr("x1", borderX)
        .attr("y1", yStartCoord + tableHeight)
        .attr("x2", borderX)
        .attr("y2", yStartCoord)
        .attr("stroke", bordCol)
        .attr("stroke-width", bordWidth);
      borderX += columnWidths[i];
    }

    // Горизонтальные границы таблицы
    const horizontalLines = [
      yStartCoord,
      yStartCoord + cellHeadHeight,
      ...Array.from(
        { length: rows.length },
        (_, i) => yStartCoord + (cellHeadHeight + (i + 1) * cellRowdHeight)
      ),
    ];
    for (var i = 0; i < horizontalLines.length; i++) {
      svgTable
        .append("line")
        .attr("class", "borderX")
        .attr("x1", xStartCoord)
        .attr("y1", horizontalLines[i])
        .attr("x2", xStartCoord + tableWidth)
        .attr("y2", horizontalLines[i])
        .attr("stroke", bordCol)
        .attr("stroke-width", bordWidth);
    }
  }

  // метод для отрисовки текста (легенды) рядом с графиком (слева, справа, сверху, снизу)
  drawLegend(endCoords) {
    if (this.text_legends.length == 0) {
      return;
    }

    var legend = this.chartCont.append("g").attr("class", "legend");
    var maxDictHeight = {};
    var maxDictWidth = {};
    for (let textElem of this.text_legends) {
      // определим позицию текста относительно графика
      var position = textElem?.position ?? "right";

      // стартовая позиция для отрисовки текста справа от графика
      if (position == "right") {
        var xStartCoord =
          this.posXRight || this.xStartCoordFocus + this.widthChart * 1.1;

        var yStartCoord = this.positionY ?? 0;
        var yStartCoord = yStartCoord + this.yStartCoordFocus + 15;
        this.posXRight = xStartCoord;
      }

      // стартовая позиция для отрисовки текста снизу от графика
      if (position == "bottom") {
        var xStartCoord = this.posXBottom ?? this.xStartCoordFocus + 10;
        var yStartCoord = this.positionY ?? 0;
        var yStartCoord =
          yStartCoord + this.yStartCoordFocus + this.heightMaxChart;
      }

      // стартовая позиция для отрисовки текста снизу от графика
      if (position == "left") {
        var xStartCoord = this.posXLeft ?? 10;
        var yStartCoord = this.yStartCoordFocus + 15;
      }
      // стартовая позиция для отрисовки текста снизу от графика
      if (position == "top") {
        var xStartCoord = this.posXTop ?? 10;
        var yStartCoord = this.yStartCoordFocus;
      }

      // создадим элемент для размещения текста
      var svgLegend = legend.append("g").attr("class", position);
      var strStyle = this.getStyles(textElem.style);
      var rowFontSize = textElem?.style?.["font-size"] ?? 14;
      var paddingY = 0.7 * rowFontSize;
      var paddingX = 0.47 * rowFontSize;
      var text = textElem.text.split(/\n/).filter((n) => n);
      var textHeight = text.length * paddingY;
      var textWidth = 0;
      for (var i = 0; i < text.length; i++) {
        if (textWidth <= text[i].length) {
          var textWidth = text[i].length;
        }
      }

      // отрисуем текст на графике
      for (var i = 0; i < text.length; i++) {
        svgLegend
          .append("text")
          .attr("x", xStartCoord)
          .attr("y", yStartCoord + i * paddingY)
          .attr("dominant-baseline", "middle")
          .attr("style", strStyle)
          .text(text[i]);
      }

      // для правого расположения текста изменим ширину элемента svg
      if (position == "right") {
        if ((maxDictHeight?.right || 0) <= textHeight) {
          maxDictHeight.right = textHeight;
        }
        if ((maxDictWidth?.right || 0) <= textWidth * paddingX + 10) {
          maxDictWidth.right = textWidth * paddingX + 10;
        }
        this.posXRight = this.posXRight + textWidth * paddingX + 10;
      }
      // для нижнего расположения текста изменим высоту элемента svg
      if (position == "bottom") {
        if ((maxDictHeight?.bottom || 0) <= textHeight) {
          maxDictHeight.bottom = textHeight;
        }
        if ((maxDictWidth?.bottom || 0) <= textWidth * paddingX + 10) {
          maxDictWidth.bottom = textWidth * paddingX + 10;
        }
      }
      // для левого расположения необходимо сместить график, таблицу и все легенды вправо. И изменить ширину элемента svg
      if (position == "left") {
        this.posXLeft = textWidth * paddingX + 10; // вычислим на сколько необходимо сместить элементы
        this.xStartCoordFocus = this.xStartCoordFocus + textWidth * paddingX;
        this.moveElements(position, this.posXLeft, 0); // сместим график и все его дочерние элементы

        if ((maxDictHeight?.left || 0) <= textHeight) {
          maxDictHeight.left = textHeight;
        }
        if ((maxDictWidth?.left || 0) <= textWidth * paddingX + 10) {
          maxDictWidth.left = textWidth * paddingX + 10;
        }
      }
      // для верхнего расположения необходимо сместить график, таблицу и все легенды вниз. И изменить высоту элемента svg
      if (position == "top") {
        this.positionY = textHeight + 10; // вычислим на сколько необходимо сместить элементы
        this.moveElements(position, 0, this.positionY); // сместим график и все его дочерние элементы
        if ((maxDictHeight?.top || 0) <= textHeight + this.positionY) {
          maxDictHeight.top = textHeight;
        }
        if ((maxDictWidth?.top || 0) <= textWidth * paddingX + 10) {
          maxDictWidth.top = textWidth * paddingX + 10;
        }
      }
    }
    var maxY =
      (maxDictHeight?.top || 0) +
      Math.max(
        maxDictHeight?.bottom || 0,
        maxDictHeight?.right || 0,
        maxDictHeight?.left || 0
      ) +
      15;
    var maxX =
      Math.max(
        maxDictWidth?.top || 0,
        maxDictWidth?.bottom || 0,
        (maxDictWidth?.right || 0) + (maxDictWidth?.left || 0) + this.widthChart
      ) + 15;

    //console.log("endCoords.positionY " + endCoords?.positionY);
    //console.log("maxY " + maxY);
    //console.log("endCoords.positionX " + endCoords?.positionX);
    //console.log("maxX " + maxX);
    //console.log(this.endCoords);

    endCoords.positionY = maxY + (endCoords?.positionY || 0);
    if ((endCoords?.positionX || 0) < maxX) {
      endCoords.positionX = maxX;
    }
  }

  // метод для перемещения элементов по осям X Y через добавление аттрибута transform translate
  moveElements(name, newX, newY) {
    // Объявляем именованную функцию
    const updateTransform = (element) => {
      const currentTransform = d3.select(element).attr("transform") || "";
      let x = 0,
        y = 0;

      // Парсим текущий translate
      const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
      if (translateMatch) {
        [x, y] = translateMatch[1]
          .split(",")
          .map(Number)
          .map((val) => (isNaN(val) ? 0 : val));
      }

      // Обновляем координаты
      x += newX;
      y += newY;

      // Сохраняем другие трансформации
      const otherTransforms = currentTransform
        .replace(/translate\([^)]+\)/g, "")
        .trim();

      return `${otherTransforms} translate(${x},${y})`.trim();
    };

    this.chartCont.selectAll(".focus").attr("transform", function () {
      return updateTransform(this);
    });
    this.chartCont.selectAll(".focus_title").attr("transform", function () {
      return updateTransform(this);
    });
    this.chartCont.selectAll(".table").attr("transform", function () {
      return updateTransform(this);
    });
    this.chartCont.selectAll(".right").attr("transform", function () {
      return updateTransform(this);
    });
    this.chartCont.selectAll(".bottom").attr("transform", function () {
      return updateTransform(this);
    });
    if (name == "left") {
      this.chartCont.selectAll(".top").attr("transform", function () {
        return updateTransform(this);
      });
    }
    if (name == "top") {
      this.chartCont.selectAll(".left").attr("transform", function () {
        return updateTransform(this);
      });
    }
  }

  // метод для определения максимума и минимума
  getMinMaxProcessor() {
    var allItems = [
      ...(this.lines || []),
      ...(this.areas || []),
      ...(this.dots || []),
    ];

    if (!this.axis_x?.max) {
      this.maxX = util.getMinMax(allItems, "x", 100, "max");
    } else this.maxX = this.axis_x?.max;

    if (!this.axis_y?.max) {
      this.maxY = util.getMinMax(allItems, "y", 100, "max");
    } else this.maxY = this.axis_y?.max;

    if (!this.axis_x?.min) {
      this.minX = util.getMinMax(allItems, "x", 0.001, "min");
    } else this.minX = this.axis_x?.min;

    if (!this.axis_y?.min) {
      this.minY = util.getMinMax(allItems, "y", 0.001, "min");
    } else this.minY = this.axis_y?.min;
  }

  /// Основной метод генерации диаграммы
  drawDiagram(svg, width, height, yStart, endCoords) {
    // создадим svg контейнер
    this.createSVG(svg, width, height, yStart);

    // создадим контейнер с графиком
    this.createChart(endCoords);

    // отрисуем оси и названия к ним в svg
    this.axisProcessor();

    // отрисуем линии в svg
    this.drawLines();

    // отрисуем площади в svg
    this.drawAreas();

    // отрисуем точки в svg
    this.drawDots();

    // отрисуем таблицы в svg
    this.tableProcessor(endCoords);

    // отрисуем заголовок и подвал (текст)
    this.headFootProcessor();

    // отрисуем текст на графике в svg
    this.drawTextOnChart();

    // отрисуем описание к графику в svg
    this.drawLegend(endCoords);

    return this.svgCont.node().outerHTML;
  }
}

module.exports = { Chart };
