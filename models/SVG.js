const d3 = require("d3");
const d3sel = require("d3-selection-multi");
const { JSDOM } = require("jsdom");

/// Класс для работы с текстовыми легендами диаграмм
class SVG {
  d3 = d3; // D3.js библиотека
  d3sel = d3sel; // Расширение для мульти-атрибутов D3
  height = 500; // Высота SVG элемента
  width = 500; // Ширина SVG элемента
  id = "svgMain"; // id SVG элемента
  charts = [];

  // Статическое свойство для хранения экземпляров
  static instances = new Map(); // Хранилище экземпляров (id → instance)

  // constructor- Конфигурация SVG
  constructor(config = {}) {
    this.setWith(config.width);
    this.setHeight(config.height);
    this.setId(config.id);
    SVG.instances.set(this.id, this); // Сохраняем экземпляр
  }

  // Статический метод для вывода всех экземпляров
  static printAllInstances() {
    console.log("Все экземпляры SVG:");
    SVG.instances.forEach((instance, i) => {
      console.log(`[${i}]`, instance.id, instance.width, instance.height);
    });
  }

  // Устанавливает id SVG элемента
  setId(id) {
    this.id = id ? id : this.id;
  }

  // Устанавливает ширину SVG элемента
  setWith(width) {
    this.width = parseInt(width) ? width : this.width;
  }

  // Устанавливает высоту SVG элемента
  setHeight(height) {
    this.height = parseInt(height) ? height : this.height;
  }

  // Сериализует объект в JSON
  toJSON() {
    return {
      id: this.id,
      width: this.width,
      height: this.height,
    };
  }

  // Создание svg контейнера
  createSVG() {
    const document = new JSDOM().window.document;
    this.svgContainer = this.d3
      .select(document.body)
      .append("svg")
      .attrs({
        xmlns: "http://www.w3.org/2000/svg",
        class: "svg-container",
        id: this.id,
        width: this.width * 0.8,
        height: this.height * 0.8,
      });
  }

  // создание графиков
  generateCharts() {
    this.createSVG();
    this.endCoords = {};
    for (let chart of this.charts) {
      chart.drawDiagram(
        this.svgContainer,
        chart.width,
        chart.height,
        this.yStart,
        this.endCoords
      );

      this.calcStartCoord(chart);
    }
    this.svgContainer.attr("height", this.endY);
    if (this.svgContainer.attr("width") < this.endX) {
      this.svgContainer.attr("width", this.endX);
    }

    return this.svgContainer.node().outerHTML;
  }

  // Вычисление начальных координат графика
  calcStartCoord(chart) {
    this.endY = this.endCoords?.positionY || this.heightMaxChart * 1.12;
    this.yStart = this.endY + chart.height * 0.02 || this.heightMaxChart * 0.1;

    var endX = this.endCoords?.positionX || this.widthMaxChart * 1.12;
    this.endX = endX;
  }
}

module.exports = { SVG };
