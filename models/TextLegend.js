/**
 * Класс для работы с текстовыми легендами диаграмм
 * @class
 */
class TextLegend {
  // Позиция легенды относительно графика
  position = "bottom";

  // Текст легенды (поддерживает переносы строк через \n)
  text = "";

  // CSS-стили оформления
  style = {
    fontSize: "14px",
    color: "#333",
  };

  constructor(config = {}) {
    this.setPosition(config.position);
    this.setText(config.text);
    this.setStyle(config.style);
  }

  // Устанавливает позицию легенды
  setPosition(position) {
    const validPositions = ["top", "bottom", "left", "right", "custom"];

    if (position && !validPositions.includes(position)) {
      throw new Error(
        `Invalid position for text legend: ${position}. Valid values: ${validPositions.join(", ")}`
      );
    }

    this.position = position || this.position;
  }

  // Устанавливает текст легенды
  setText(text) {
    this.text = typeof text === "string" ? text : this.text;
  }

  // Обновляет стили оформления
  setStyle(newStyles) {
    if (typeof newStyles === "object" && newStyles !== null) {
      this.style = { ...this.style, ...newStyles };
    }
  }

  // Возвращает массив строк легенды
  getLines() {
    return this.text.split("\n").filter((line) => line.trim());
  }

  // Сериализует объект в JSON
  toJSON() {
    return {
      position: this.position,
      text: this.text,
      style: { ...this.style },
    };
  }

  // Валидирует корректность данных
  validate() {
    return this.getLines().length > 0 && !!this.position;
  }
}

module.exports = { TextLegend };
