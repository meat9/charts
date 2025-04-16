// Класс для хранения данных элемента диаграммы
class ChartElementData {
  // [x=0] - Координата X на диаграмме
  // [y=0] - Координата Y на диаграмме
  // [baseline=0] - Базовое значение для областных графиков
  // [color='#000000'] - Цвет элемента
  // [size=5] - Размер элемента (радиус для точек)
  // [label=''] - Текстовая метка
  constructor(config = {}) {
    const {
      x = 0,
      y = 0,
      y0 = 0,
      baseline = 0,
      color = "#000000",
      size = 5,
      label = "",
    } = config;

    // Координата X элемента
    this.x = this.validateNumber(x, "X coordinate");

    // Координата Y элемента
    this.y = this.validateNumber(y, "Y coordinate");

    // Координата Y0 элемента
    this.y0 = this.validateNumber(y0, "Y coordinate");

    // Базовое значение для отрисовки областей
    this.baseline = this.validateNumber(baseline, "Baseline value");

    // Цвет элемента в HEX формате
    this.color = this.validateColor(color);

    // Размер элемента
    this.size = this.validatePositiveNumber(size, "Size");

    // Текстовая метка элемента
    this.label = label.toString();
  }

  // Валидирует числовое значение
  validateNumber(value, name) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      console.warn(`Invalid ${name}: ${value}. Defaulting to 0.`);
      return 0;
    }
    return num;
  }

  // Валидирует положительное число
  validatePositiveNumber(value, name) {
    const num = this.validateNumber(value, name);
    return num >= 0 ? num : Math.abs(num);
  }

  // Валидирует цвет
  validateColor(color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color) ? color : "#000000";
  }

  // Возвращает данные в формате для сериализации
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      y0: this.y0,
      baseline: this.baseline,
      color: this.color,
      size: this.size,
      label: this.label,
    };
  }
}

module.exports = { ChartElementData };
