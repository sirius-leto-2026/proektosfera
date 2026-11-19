// Все стенды выставки. Новый стенд = новый объект в массиве, код править не нужно.
// Поля: id, hall (it | nature | human), title, team, school, text, color, links {presentation, video, product, question — ссылка на Google Форму «Вопрос автору»}
// Ниже — ДЕМО-данные для проверки прототипа, не реальные проекты.
window.HALLS = [
  { id: "it",     name: "IT и робототехника" },
  { id: "nature", name: "Естественные науки" },
  { id: "human",  name: "Гуманитарные проекты" }
];

window.STANDS = [
  { id: "s01", hall: "it", title: "Умная теплица на Arduino", team: "Команда «Росток»", school: "Демо-школа", text: "Датчики влажности и температуры управляют поливом и проветриванием.", color: "#0b6e85", links: { presentation: "", video: "present.html?id=s01&auto=1", product: "product.html?id=s01" } },
  { id: "s02", hall: "it", title: "Чат-бот расписания", team: "Команда «Звонок»", school: "Демо-школа", text: "Телеграм-бот показывает расписание и замены уроков.", color: "#1b2a52", links: { presentation: "", video: "", product: "" } },
  { id: "s03", hall: "it", title: "Робот-сортировщик", team: "Команда «Манипулятор»", school: "Демо-школа", text: "Робот на LEGO сортирует детали по цвету с помощью датчика.", color: "#be123c", links: { presentation: "", video: "", product: "" } },
  { id: "s04", hall: "it", title: "Игра о кибербезопасности", team: "Команда «Пароль»", school: "Демо-школа", text: "Браузерная игра учит распознавать фишинговые письма.", color: "#7c3aed", links: { presentation: "", video: "", product: "" } },
  { id: "s05", hall: "it", title: "Распознавание жестов", team: "Команда «Ладонь»", school: "Демо-школа", text: "Нейросеть по веб-камере распознаёт 5 жестов для управления слайдами.", color: "#0f766e", links: { presentation: "", video: "", product: "" } },
  { id: "s06", hall: "nature", title: "Качество воды Байкала", team: "Команда «Нерпа»", school: "Демо-школа", text: "Сравнение проб воды из 5 точек по прозрачности и pH.", color: "#0369a1", links: { presentation: "", video: "present.html?id=s06&auto=1", product: "product.html?id=s06" } },
  { id: "s07", hall: "nature", title: "Микрозелень на подоконнике", team: "Команда «Зелень»", school: "Демо-школа", text: "Как освещение влияет на рост микрозелени за 14 дней.", color: "#15803d", links: { presentation: "", video: "", product: "" } },
  { id: "s08", hall: "nature", title: "Солнечный дистиллятор", team: "Команда «Капля»", school: "Демо-школа", text: "Опреснение воды солнечным теплом: конструкция и замеры.", color: "#a16207", links: { presentation: "", video: "", product: "" } },
  { id: "s09", hall: "nature", title: "Лишайники как индикатор воздуха", team: "Команда «Лихен»", school: "Демо-школа", text: "Карта загрязнения воздуха района по видам лишайников.", color: "#4d7c0f", links: { presentation: "", video: "", product: "" } },
  { id: "s10", hall: "nature", title: "Кристаллы из соли", team: "Команда «Грань»", school: "Демо-школа", text: "Скорость роста кристаллов при разной температуре раствора.", color: "#0e7490", links: { presentation: "", video: "", product: "" } },
  { id: "s11", hall: "human", title: "Улицы нашего города", team: "Команда «Топоним»", school: "Демо-школа", text: "История названий 20 улиц и интерактивная карта.", color: "#9a3412", links: { presentation: "", video: "present.html?id=s11&auto=1", product: "product.html?id=s11" } },
  { id: "s12", hall: "human", title: "Бурятские сказки в комиксах", team: "Команда «Улигер»", school: "Демо-школа", text: "Три сказки пересказаны в виде комиксов для младших школьников.", color: "#b45309", links: { presentation: "", video: "", product: "" } },
  { id: "s13", hall: "human", title: "Школьный музей онлайн", team: "Команда «Архив»", school: "Демо-школа", text: "Оцифровка 30 экспонатов школьного музея.", color: "#6d28d9", links: { presentation: "", video: "", product: "" } },
  { id: "s14", hall: "human", title: "Подростки и сон", team: "Команда «Режим»", school: "Демо-школа", text: "Опрос 120 учеников о сне и успеваемости.", color: "#be185d", links: { presentation: "", video: "", product: "" } },
  { id: "s15", hall: "human", title: "Словарь школьного сленга", team: "Команда «Слово»", school: "Демо-школа", text: "200 слов с объяснениями и примерами употребления.", color: "#1d4ed8", links: { presentation: "", video: "", product: "" } }
];
