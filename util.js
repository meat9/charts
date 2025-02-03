const puppeteer = require("puppeteer");

/// Функция которая делает преобразование html в png
/// фактически это заупск headless хромиума рендер страницы из html и создание скриншота
/// **Параметры**
///  - htmlStr  - HTML код
/// **Возвращаемое значение**
/// изображение в формате png закодированное в base64 (строка)
///
/// **Примеры**
/// <code>
///     await screenShoot("<body><div></div></body>")
/// </code>
async function screenShoot(htmlStr) {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlStr);
  const base64 = await page.screenshot({ encoding: "base64" });
  await browser.close();
  return base64.toString("base64");
}

/// Функция для дробления строки на подстроки указанной длинны
///
/// **Параметры**
///  - str       - исходная строка
///  - length    - длина подстроки
/// **Возвращаемое значение**
/// массив в котором элементы это подстроки строки указанной длинны
/// **Примеры**
/// <code>
///      chunkString(str,len)
/// </code>
function chunkString(str, length) {
  return str.match(new RegExp(".{1," + length + "}", "g"));
}

module.exports = {
  screenShoot,
  chunkString,
};
