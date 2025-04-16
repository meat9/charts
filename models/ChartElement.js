// Класс для описания графических элементов диаграммы
class ChartElement {
  name = ""; // Название элемента (уникальный идентификатор)
  params = {}; // Параметры отображения элемента
  style = {}; // CSS-стили элемента
  attributes = {}; // Дополнительные SVG-атрибуты
  data = []; // Данные элемента для визуализации

  constructor(name, params, style, attributes = {}) {
    if (!name || typeof name !== "string") {
      throw new Error("Element name must be a non-empty string");
    }

    if (!params?.type) {
      throw new Error("Element type is required");
    }

    this.name = name;
    this.params = {
      type: params.type,
      ...params,
    };
    this.style = style || {};
    this.attributes = attributes;
  }

  // Добавляет данные для элемента
  addData(data) {
    if (Array.isArray(data)) {
      this.data.push(...data);
    } else {
      this.data.push(data);
    }
  }

  // Возвращает данные в формате для сериализации
  toJSON() {
    return {
      name: this.name,
      params: this.params,
      style: this.style,
      attributes: this.attributes,
      data: this.data.map((item) => item.toJSON()),
    };
  }
}

module.exports = { ChartElement };
