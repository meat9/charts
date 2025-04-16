const sharp = require("sharp");

// Разбивает строку на подстроки указанной длины
// str - Исходная строка
// chunkLength - Максимальная длина подстроки
function chunkString(str, chunkLength) {
  if (
    typeof str !== "string" ||
    !Number.isInteger(chunkLength) ||
    chunkLength <= 0
  ) {
    throw new TypeError("Некорректные входные параметры");
  }
  return str.match(new RegExp(`.{1,${chunkLength}}`, "g")) || [];
}

// Конвертирует SVG в PNG (base64)
// svgContent - SVG содержимое
async function svgToPngBase64(svgContent) {
  try {
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .flatten({ background: "#ffffff" }) // Добавляем белый фон
      .png() // Указываем выходной формат
      .toBuffer();

    // Кодируем буфер в base64
    return pngBuffer.toString("base64");
  } catch (error) {
    throw new Error(`Ошибка конвертации SVG: ${error.message}`);
  }
}

// Рассчитывает ширину колонок таблицы
// rows - Строки таблицы
// headers - Заголовки таблицы
// padding - Отступ для расчета ширины
function getWidthTable(rows, headers, padding) {
  var resArray = [];
  var transRow = transposeFiltered(rows.concat([headers]));
  for (var i = 0; i < transRow.length; i++) {
    resArray.push(getMaxElementLength(transRow[i]) * padding);
  }
  return resArray;
}

// Находит длину самого длинного элемента в массиве
// arr - Входной массив
function getMaxElementLength(arr) {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((max, element) => {
    const currentLength = String(element).length;
    return currentLength > max ? currentLength : max;
  }, 0);
}

// Транспонирует матрицу с фильтрацией undefined
// matrix - Входная матрица
function transposeFiltered(matrix) {
  if (!Array.isArray(matrix)) return [];
  const maxLen = Math.max(...matrix.map((arr) => arr.length));
  return Array.from({ length: maxLen }, (_, i) =>
    matrix.map((row) => row[i]).filter((el) => el !== undefined)
  );
}

// метод для определения миксимума и минимума по оси X и Y
function getMaxMinFromObj(data, elem, type) {
  if (type == "max") {
    var result = data.reduce(
      (acc, item) => {
        var value = item[elem] ?? 0; // Если undefined, используем 0
        return {
          result: Math.max(acc.result, value),
        };
      },
      { result: 0 } // начальные значения
    );
  }
  if (type == "min") {
    var result = data.reduce(
      (acc, item) => {
        var value = item[elem] ?? Infinity; // Если undefined, используем Infinity
        return {
          result: Math.min(acc.result, value),
        };
      },
      { result: Infinity } // Начальный аккумулятор
    );
  }
  return result.result;
}

// метод для определения миксимума и минимума в массиве
function getMaxMinFromArray(data, defVal, type) {
  if (!(!isNaN(parseFloat(defVal)) && isFinite(defVal))) {
    defVal = 100;
  }
  // Фильтруем некорректные элементы
  var validNumbers = data.filter(Number.isFinite);

  // Проверяем, что есть валидные числа
  if (validNumbers.length === 0) return defVal; // или другое значение по умолчанию

  // Используем reduce для безопасности
  if (type == "max") {
    var result = validNumbers.reduce((a, b) => Math.max(a, b), 0);
    return result !== 0 ? result : defVal;
  }
  if (type == "min") {
    var result = validNumbers.reduce((a, b) => Math.min(a, b), Infinity);
    return result !== Infinity ? result : defVal;
  }
}

// метод для расчета максимума и минимума
function getMinMax(items, elem, defVal, type) {
  var combinedData = [];
  var result = "";

  for (let item of items) {
    var result = getMaxMinFromObj(item.data, elem, type);
    combinedData.push(result);
  }

  return getMaxMinFromArray(combinedData, defVal, type);
}

module.exports = {
  chunkString,
  svgToPngBase64,
  getMaxElementLength,
  transposeFiltered,
  getWidthTable,
  getMinMax,
};
