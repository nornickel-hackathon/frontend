# Фабрика гипотез — Frontend

Демонстрационная витрина R&D-платформы «Фабрика гипотез»: объяснимый портфель
исследовательских гипотез с трассировкой до источников. Фронтенд работает от
фикстур/моков и не требует backend — это позволяет разрабатывать и демонстрировать
UI независимо от Rust-движка и Python-агента.

Целевая поставка — десктоп-приложение на **Tauri** (нативный file dialog, скан
папки, спавн Python-сайдкара). Сейчас фронт запускается как веб (Vite в браузере);
переход на Tauri аддитивный — весь доступ к данным идёт через единый `ApiClient`
([src/api.ts](src/api.ts)), нативные вызовы прячутся за feature-detection
`window.__TAURI__`.

## Стек

- React 19 + TypeScript
- Vite 6
- react-router 7
- TanStack Query 5
- CSS Modules
- lucide-react (иконки)
- Vitest + Testing Library
- pnpm 11 (`packageManager` закреплён в `package.json`)

## Быстрый старт

Требуется Node 22 и pnpm 11 (`corepack enable`).

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

### Docker

```bash
docker compose --profile dev up dev     # dev-сервер с hot-reload на :5173
docker compose up web                   # прод-сборка под nginx на :8080
```

## Скрипты

| Команда              | Действие                                                 |
| -------------------- | -------------------------------------------------------- |
| `pnpm dev`           | Dev-сервер Vite                                          |
| `pnpm build`         | Проверка типов (`tsc -b`) + прод-сборка                  |
| `pnpm lint`          | ESLint                                                   |
| `pnpm format`        | Prettier (`--write`)                                     |
| `pnpm format:check`  | Prettier в режиме проверки                               |
| `pnpm test`          | Прогон тестов (Vitest)                                   |
| `pnpm test:watch`    | Тесты в watch-режиме                                     |
| `pnpm test:coverage` | Тесты с покрытием                                        |
| `pnpm sync:fixtures` | Синхронизировать фикстуры из `../docs` (единый источник) |
| `pnpm preview`       | Локальный предпросмотр прод-сборки                       |

Pre-commit хук (husky + lint-staged) прогоняет `eslint --fix` и `prettier` по
застейдженным файлам.

## Структура

```text
src/
  api.ts          единый ApiClient (фикстуры + HTTP-клиент с валидацией ответов)
  contracts.ts    типы контрактов Rust/Python API
  app/            каркас: Layout, Sidebar, TopBar, роутер (lazy), фон
  features/       экраны: setup, run, diagnosis, hypotheses,
                  graph, benchmark, library, report
  components/     переиспользуемые UI-компоненты
  i18n/           словари ru/en и провайдер локали
  lib/            утилиты: score, rerun, capex, trace, force, format,
                  download, url, domain, validate
  mocks/          моковые данные и фикстуры (синхронизируются из ../docs)
tests/            зеркало src/ (Vitest + Testing Library)
scripts/          sync-fixtures.mjs — копирование фикстур из docs
```

## Экраны

Флотационный кейс (потери металла с хвостами). Переключатель фабрики в топбаре:
`kgmk` (полный сценарий с портфелем), `nof_vkr` / `nof_med` / `tof` (диагностика,
портфель — по запуску).

1. **Setup** — выбор фабрики, целевого элемента, цены и лимита CAPEX-класса.
2. **Run** — прогон пайплайна (сборка графа знаний) с анимацией стадий.
3. **Diagnosis** — тепловая карта потерь (класс крупности × минералогия),
   разбивка по диагнозам, data readiness.
4. **Hypotheses** — ранжированный портфель гипотез с деньгами, rerun-контролы
   (исключение фактора, вес cost, цена элемента) и детальный разбор гипотезы.
5. **Graph** — полный граф знаний: рычаги, механизмы, свойства, KPI.
6. **Benchmark** — сверка гипотез системы с экспертным мозговым штурмом.
7. **Library** — подключённая литература и данные, статус извлечения фактов.
8. **Report** — экспорт итогового портфеля (JSON / CSV).

## CI

GitHub Actions (`.github/workflows/`):

- **CI** — lint, typecheck, test (с покрытием), build (артефакт `dist`) и
  `docker build` со smoke-тестом контейнера.
- **Security** — `pnpm audit` (fail на high/critical для prod-зависимостей + не
  блокирующий аудит dev-зависимостей), CodeQL (SAST) и gitleaks (поиск секретов);
  плюс еженедельный запуск по расписанию.

Dependabot обновляет npm-зависимости и GitHub Actions еженедельно.

## Фикстуры

Единый источник фикстур — `../docs` (`docs/fixtures/*` и
`docs/golden/expert_hypotheses.json`). Локальные копии в `src/mocks/fixtures/`
обновляются командой `pnpm sync:fixtures`, чтобы не расходиться с контрактом
Demo/Data-трека.

## Контракты

Фронт согласован с Rust/Python API через типы в [src/contracts.ts](src/contracts.ts).
Пока backend недоступен, клиент возвращает данные из `src/mocks/`. При подключении
платформы добавляется второй клиент с той же сигнатурой `ApiClient` — компоненты
не меняются.
