# California – интернет-магазин техники Apple

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![SQLite](https://img.shields.io/badge/SQLite-3-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![License](https://img.shields.io/badge/License-MIT-yellow)

**California** — полноценный веб-магазин электроники Apple (iPhone, MacBook, iPad, Watch, AirPods) с серверной частью на Node.js + Express, базой данных SQLite, клиентскими страницами (каталог, акции, пользовательское соглашение) и админ-панелью для управления товарами и акциями.

---

## 🚀 Демо-режим

После запуска сервер доступен по адресу:  
- Каталог: `http://localhost:3001/catalog.html`  
- Акции: `http://localhost:3001/promotions.html`  
- Админ-панель: `http://localhost:3001/admin` (логин: `admin`, пароль: `admin123`)

---

## 📋 Функциональные возможности

### Для покупателей
- Регистрация и авторизация (JWT)
- Просмотр каталога с фильтрацией по категориям, поиском, сортировкой и пагинацией
- Добавление товаров в корзину (с сохранением на сервере)
- Изменение количества товаров в корзине, удаление
- Оформление заказа с указанием имени, телефона, email, адреса
- Личный кабинет: просмотр истории заказов, удаление аккаунта
- Слайдер акций на главной странице каталога
- Страница акций с подробным описанием

### Для администратора
- Защищённая админ-панель (Basic Auth)
- Управление товарами: добавление, редактирование, удаление
- Управление акциями: создание, редактирование, удаление

### Технические особенности
- SQLite — не требует отдельного сервера БД
- Автоматическое наполнение БД тестовыми товарами и акциями при первом запуске
- REST API с единой точкой входа `/api`
- Статическая раздача страниц (`pages/`) и изображений (`assets/`)

---

## 🛠️ Установка и запуск

### Требования
- [Node.js](https://nodejs.org/) (версия 18 или выше)
- [Git](https://git-scm.com/) (для клонирования репозитория)

### Инструкция

1. **Клонировать репозиторий**
   ```bash
   git clone https://github.com/civelpuzzle/California.git
   cd California
   ```

2. **Установить зависимости**
   ```bash
   npm install
   ```
   Будут установлены: `express`, `cors`, `sqlite3`, `bcryptjs`, `jsonwebtoken`.

3. **Запустить сервер**
   ```bash
   node server.js
   ```
   Сервер запустится на `http://localhost:3001`.

4. **Открыть в браузере**
   - Каталог: [http://localhost:3001/catalog.html](http://localhost:3001/catalog.html)
   - Админка: [http://localhost:3001/admin](http://localhost:3001/admin) (логин: `admin`, пароль: `admin123`)

> При первом запуске автоматически создаётся файл базы данных `database.sqlite` и заполняется тестовыми товарами/акциями.

---

## 📁 Структура проекта

```
California/
├── server.js                # Главный сервер (Express, API, SQLite)
├── admin.html               # Админ-панель (интерфейс)
├── package.json             # Зависимости и скрипты
├── database.sqlite          # База данных (создаётся автоматически)
├── assets/                  # Изображения товаров и логотип
│   ├── logoNoFone.png
│   ├── iphone15promax.jpg
│   ├── macbookairm313.jpg
│   └── ...
└── pages/                   # Клиентские страницы
    ├── catalog.html         # Каталог товаров
    ├── promotions.html      # Страница акций
    └── agreement.html       # Пользовательское соглашение
```

---

## 🔌 API эндпоинты

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/api/auth/register` | Регистрация | public |
| POST | `/api/auth/login` | Вход (возвращает JWT) | public |
| GET | `/api/products` | Список товаров (пагинация, фильтры) | public |
| GET | `/api/products/:id` | Товар по ID | public |
| GET | `/api/promotions` | Список акций | public |
| GET | `/api/cart` | Корзина пользователя | JWT |
| POST | `/api/cart` | Добавить/изменить товар в корзине | JWT |
| DELETE | `/api/cart/:productId` | Удалить товар из корзины | JWT |
| POST | `/api/orders` | Создать заказ | JWT |
| GET | `/api/orders` | История заказов | JWT |
| GET | `/api/profile` | Данные профиля | JWT |
| DELETE | `/api/profile` | Удалить аккаунт | JWT |
| GET | `/api/admin/products` | Все товары | Basic Auth (admin) |
| POST | `/api/admin/products` | Добавить/обновить товар | Basic Auth (admin) |
| DELETE | `/api/admin/products/:id` | Удалить товар | Basic Auth (admin) |
| GET | `/api/admin/promotions` | Все акции | Basic Auth (admin) |
| POST | `/api/admin/promotions` | Добавить/обновить акцию | Basic Auth (admin) |
| DELETE | `/api/admin/promotions/:id` | Удалить акцию | Basic Auth (admin) |

> JWT передаётся в заголовке: `Authorization: Bearer <token>`  
> Basic Auth для админки: `Authorization: Basic YWRtaW46YWRtaW4xMjM=` (кодировка admin:admin123)

---

## 🧪 Тестовые данные

При первом запуске в базу добавляются:
- **12 товаров** (iPhone, MacBook, iPad, Watch, AirPods)
- **4 акции** (скидки, кэшбэк, бесплатная доставка)

Все товары имеют корректные пути к изображениям из папки `assets/`.

---

## 🛠️ Технологии

- **Backend**: Node.js, Express, SQLite3, bcryptjs, jsonwebtoken
- **Frontend**: чистый HTML/CSS/JS (без фреймворков), адаптивная вёрстка
- **Аутентификация**: JWT для пользователей, Basic Auth для админа
- **База данных**: SQLite (embedded)

---

## 📄 Лицензия

Да нету ее, не смотри сюда.

---

## 🤝 Контрибьюция

Предложения по улучшению не приветствуются. Не пишите нам

---

## 📧 Контакты

Только по голубиной почте или мессенджер SUCKS.

---

**California** — учебный проект, демонстрирующий создание полноценного интернет-магазина с нуля на Node.js.