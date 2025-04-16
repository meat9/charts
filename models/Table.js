// Класс для представления таблицы данных со стилями
class Table {
  // Заголовки столбцов таблицы
  headers = [];
  // Данные таблицы (массив строк)
  rows = [];

  // Стили оформления таблицы
  // headers - Стили заголовков
  // rows - Стили строк
  // borders - Стили границ
  styles = {};

  constructor(config = {}) {
    this.headers = Array.isArray(config.headers) ? config.headers : [];
    this.rows = Array.isArray(config.rows) ? config.rows : [];
    this.styles = typeof config.styles === "object" ? config.styles : {};
  }

  // Добавляет стили для элементов таблицы
  setStyles(target, styles) {
    const validTargets = ["headers", "rows", "borders"];
    if (!validTargets.includes(target)) {
      throw new Error("Invalid style target");
    }
    this.styles[target] = { ...styles };
  }

  // Возвращает таблицу в формате JSON
  toJSON() {
    return {
      headers: [...this.headers],
      rows: [...this.rows],
      styles: structuredClone(this.styles),
    };
  }

  // Валидирует структуру таблицы
  validate() {
    const hasValidRows = this.rows.every(
      (row) => Array.isArray(row) && row.length === this.headers.length
    );

    return this.headers.length > 0 && hasValidRows;
  }

  // Добавляет новую строку в таблицу
  addRow(rowData) {
    if (!Array.isArray(rowData)) {
      throw new TypeError("Row data must be an array");
    }
    if (rowData.length !== this.headers.length) {
      throw new Error("Row length does not match headers");
    }
    this.rows.push(rowData);
  }
}

module.exports = { Table };
