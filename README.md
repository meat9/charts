# Charts

Сервис для генерации графиков по координатам <!-- описание репозитория -->

<!--Установка-->

## Установка и запуск

1. Клонирование репозитория

`git clone https://github.com/meat9/charts.git`

2. Переход в директорию Charts

`cd charts`

3. Установка зависимостей

`npm install`

4. Запуск сервиса

`node main.js`

<!--Docker-->

## Docker

1. Создание образа

`docker build --build-arg <build arguments> -t <image-name>:<tag-name>`

Пример:

`docker build --build-arg APP_DIR=var/app -t charts_service:V1 .`

2. Запуск

`docker run -p <External-port:exposed-port> -d --name <name of the container> <image-name>:<tag-name>`

Пример:

`docker run -p 8000:7000 -d --name charts_service charts_service:V1`

<!--Примеры работы сервиса-->

## Примеры работы сервиса

Доступные запросы:

### 1. /health

`GET http://server:port/health`

Проверка доступности сервиса. В случае успеха будет получент ответ вида

    {"status": "ok"}

    http код - 200

### 2. /lite

Данный запрос реализован для "фоновой" конвертации координат в графики. Координаты приходят с некоторых анализаторов вместе с результатами

`POST http://server:port/lite`

Параметры запроса:

    - bodymas     - массив графиков или один график
    -- 1         -- несколько графиков в body
    -- 2         -- один график в body

    - typeresult  - тип возвращаемого результата
    -- png       -- изображение (закодированное в base64)
    -- svg       -- svg элемент (закодированный в base64)

    - width       - ширина возвращаемого графика
    - height      - высота возвращаемого графика

### 3. /charts

Данный запрос реализован для генерации графиков из данных в body запроса.

Пример структуры JSON лежит в корне репозитория в файле [exampleJSON.json](https://gitlab.sparm.com/qms/dep7/charts/-/blob/main/exampleJSON.json)

`POST http://server:port/charts`

Параметры запроса:

    - typeresult  - тип возвращаемого результата
    -- png       -- изображение (закодированное в base64)
    -- svg       -- svg элемент (закодированный в base64)
