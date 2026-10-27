# 🌌 RV Workspace

### Offline-First Client & Project Management Dashboard

**Your Work. One Workspace.**

RV Workspace is a browser-based workspace for organising clients, projects, tasks, contacts, and payment records in one place. Built with **HTML5, CSS3, and Vanilla JavaScript**, it demonstrates how a responsive, local-first management application can deliver structured data management, connected records, and offline app-shell support without a backend or frontend framework.

> **Project scope:** RV Workspace is a frontend-only application. Records are stored locally in the browser. There is no backend, authentication, cloud synchronisation, multi-user collaboration, or real payment processing.

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [🧰 Technology Stack](#-technology-stack)
- [🏗️ Project Architecture](#️-project-architecture)
- [📁 Project Structure](#-project-structure)
- [🗂️ Management Modules](#️-management-modules)
- [🔄 Record Management](#-record-management)
- [🔎 Search, Filtering & Pagination](#-search-filtering--pagination)
- [🧾 Import & Export](#-import--export)
- [💾 Data Storage & Relationships](#-data-storage--relationships)
- [📡 Offline Support](#-offline-support)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [🛡️ Data Safety & Limitations](#️-data-safety--limitations)
- [📝 Changelog](#-changelog)
- [🎯 Project Objectives](#-project-objectives)
- [👨‍💻 Author](#-author)

---

## ✨ Features

### 🗂️ Five Connected Management Modules

Manage essential business records through a unified workspace.

- **Clients** — Store client and company information.
- **Projects** — Organise project details, budgets, statuses, due dates, notes, and optional client relationships.
- **Tasks** — Track task descriptions, priorities, statuses, due dates, notes, and optional project relationships.
- **Contacts** — Maintain contact information and optional client relationships.
- **Payments** — Track payment and invoice references, amounts, statuses, methods, due dates, notes, and optional project relationships.

### 🛠️ Record Management

- Create, view, edit, and duplicate records.
- Move records to the Trash or Recycle Bin using soft deletion.
- Restore deleted records or permanently remove them.
- Perform supported bulk actions on selected records.
- Generate record IDs and maintain creation and update timestamps.
- Track recent workspace activity.

### 🔎 Search, Filtering & Organisation

- Debounced search for a smoother browsing experience.
- Filter records by supported statuses, task priorities, and relationships.
- Sort records using supported fields.
- Navigate large record lists through pagination.
- Configure the page size.
- Save supported view preferences.

### 🧾 Data Import & Export

- Export supported module records to CSV.
- Import CSV files with validation and skipped-row feedback.
- Export JSON backups and import supported JSON backup files.
- Validate supported fields and relationships during import.
- Support relationship references through existing record IDs, such as `clientId` and `projectId`.

### 🎨 User Experience & Accessibility

- Light and dark themes with a saved preference.
- Icon-only Sun/Moon theme toggle.
- Responsive desktop, tablet, and mobile layouts.
- Responsive sidebar dismissal through outside clicks, navigation selection, and the `Escape` key.
- Inline form validation and field-level feedback.
- Confirmation dialogs for destructive actions.
- Toast notifications for user feedback.
- Empty states, loading states, and a skeleton-style loading screen.
- Keyboard-focus styling and reduced-motion CSS support.

### 📡 Offline App-Shell Support

- Service Worker-based caching of the application shell and supported assets.
- Offline navigation fallback to the cached application entry point.
- IndexedDB persistence for application records.
- Browser-based operation without requiring a remote application server after the app shell has been cached.

Offline availability depends on successful initial loading, Service Worker installation, browser support, and serving the application from `localhost` or HTTPS.

---

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure, forms, and application markup |
| CSS3 | Layout, responsive design, themes, and interface styling |
| Vanilla JavaScript (ES6+) | Application logic, DOM manipulation, validation, and interactions |
| IndexedDB | Persistent application records and activity data |
| LocalStorage | Persistent user preferences |
| SessionStorage | Temporary view state and recoverable form drafts |
| Service Worker | Application-shell caching and offline navigation fallback |
| Cache API | Caching supported application resources |
| Web App Manifest | Application metadata, launch configuration, and icon settings |

**No frontend framework or UI framework is required.** The application is built with native browser technologies and does not use React, Vue, Angular, jQuery, or Bootstrap.

---

## 🏗️ Project Architecture

RV Workspace follows a modular, browser-native architecture that separates application behaviour, database operations, and storage utilities.

### Application Layer — `js/app.js`

Responsible for the application controller, management modules, UI rendering, form validation, record relationships, user interactions, import/export workflows, and activity events.

### Database Layer — `js/database.js`

Handles the IndexedDB connection, database schema, version upgrades, indexes, and record transaction helpers.

### Storage Utility Layer — `js/storage.js`

Provides guarded helpers for LocalStorage preferences and SessionStorage state.

### Offline Layer — `service-worker.js`

Manages versioned application-shell caching, cache cleanup, asset caching, and offline navigation fallback.

### Installation Metadata — `manifest.webmanifest`

Defines the application name, short name, description, launch path, display mode, theme colours, and icon metadata.

---

## 📁 Project Structure

```text
RV-Workspace/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── icon.svg
├── README.md
├── CHANGELOG.md
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── database.js
    └── storage.js
```

---

## 🗂️ Management Modules

| Module | Main purpose | Example relationship |
|---|---|---|
| Clients | Client and company records | Linked to projects or contacts |
| Projects | Project planning and tracking | Optionally linked to a client |
| Tasks | Task organisation and progress tracking | Optionally linked to a project |
| Contacts | Contact information management | Optionally linked to a client |
| Payments | Payment and invoice tracking | Optionally linked to a project |

Relationships help organise related records within the same local workspace. They do not synchronise records across browsers or devices.

---

## 🔄 Record Management

The application provides a collection of record-management workflows designed to support everyday organisation.

Depending on the module and supported action, users can:

1. Create and save a record.
2. View and edit existing information.
3. Duplicate records when creating similar entries.
4. Move records to the Trash or Recycle Bin.
5. Restore records when needed.
6. Permanently delete records.
7. Use supported bulk actions for multiple selected records.

The application also maintains record identifiers and timestamps and can record recent workspace activity.

---

## 🔎 Search, Filtering & Pagination

RV Workspace includes tools for navigating and organising records:

- **Search:** Debounced search across supported record fields.
- **Filtering:** Narrow results using available status, priority, and relationship filters.
- **Sorting:** Organise records by supported fields.
- **Pagination:** Browse records in manageable pages.
- **Page size:** Adjust the number of records displayed.
- **View preferences:** Retain supported interface preferences locally.

The available filters and sorting options depend on the current management module.

---

## 🧾 Import & Export

RV Workspace supports CSV workflows and JSON backup/restore workflows for supported records.

### CSV Import

Import a CSV file while the relevant management module is open. The first row should contain the field keys supported by that module.

Example for the Clients module:

```csv
name,email,phone,company,status
Acme Studio,hello@example.com,+91 9876543210,Acme,Active
```

For relationship fields, use existing record IDs where supported, such as `clientId` or `projectId`. Unsupported columns may be ignored, and invalid rows may be skipped with feedback from the importer.

### CSV Export

Export supported records from the current module to a CSV file for use in compatible spreadsheet applications or for further processing.

### JSON Backup & Restore

Use the application's JSON export to create a backup in its supported format.

The import workflow is designed to validate supported record data and relationships before writing staged records. According to the import merge behaviour, a matching record ID is replaced while records with different IDs are retained.

**Recommended workflow:**

1. Export a JSON backup before importing data.
2. Keep the backup in a safe location outside the browser.
3. Import the supported file.
4. Review the resulting records and relationships.

> **Important:** Import and restore operations can change existing local records. Keep a separate backup before proceeding.

---

## 💾 Data Storage & Relationships

RV Workspace uses browser storage APIs to keep data on the user's device.

| Storage | Purpose |
|---|---|
| IndexedDB | Persistent management records and activity data |
| LocalStorage | Saved user preferences |
| SessionStorage | Temporary view state and recoverable form drafts |
| Cache API | Cached application resources for offline access |

### Data Model

| Store | Description |
|---|---|
| `clients` | Client and organisation information |
| `projects` | Project details, optional `clientId`, budget, status, and due date |
| `tasks` | Task details, optional `projectId`, status, priority, and due date |
| `contacts` | Contact details, optional `clientId`, role, email, and phone |
| `payments` | Payment or invoice tracking, optional `projectId`, amount, status, and method |
| `activity` | Timestamped workspace activity and related record metadata |

The IndexedDB schema is versioned and supports indexes for common record fields and relationships.

Because the application uses local browser storage, its data is associated with the current browser profile and origin. It is not automatically shared between different browsers, profiles, or devices.

---

## 📡 Offline Support

RV Workspace uses a Service Worker and the Cache API to make the application shell available offline after the necessary resources have been cached.

### How it works

1. Open the application from a supported origin.
2. Allow the initial page load and Service Worker installation to complete successfully.
3. Let the Service Worker cache the configured application resources.
4. Disconnect from the network and reopen the application to test offline access.

The cached application shell can be served offline when the required resources are available in the cache. Previously saved records remain available through IndexedDB, subject to browser storage availability and application behaviour.

### Important requirements

- Serve the application through `localhost` during development or through HTTPS in deployment.
- Opening `index.html` directly with `file://` is not a reliable way to test Service Worker functionality.
- Offline access depends on the resources successfully cached by the Service Worker.
- Browser storage may be cleared by the user, browser settings, or storage-management policies.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` / `Cmd` + `K` | Focus the search field |
| `Ctrl` / `Cmd` + `N` | Open a new record form for the current module |
| `Ctrl` / `Cmd` + `Shift` + `E` | Export the current supported module view to CSV |
| `Escape` | Close the responsive sidebar when it is open |

Keyboard shortcuts are subject to the browser, operating system, and currently focused interface element.

---

## 🛡️ Data Safety & Limitations

### Local-Only Storage

Application records are stored locally in the current browser profile. There is no automatic cloud backup or cross-device synchronisation.

### No Authentication or Multi-User Access

RV Workspace does not provide a login system, server-side authorisation, or multi-user collaboration. It is intended as a frontend-only project.

### Payment Tracking Only

Payment entries are informational records. The application does not process transactions, connect to payment gateways, or transfer money.

### Browser Storage Is Not a Backup Service

Clearing browser data or losing access to the browser profile may result in data loss. Export JSON backups regularly and keep them outside the browser.

### Offline Caching Has Prerequisites

The application must load successfully and cache its required resources before offline use can be expected. Service Worker functionality requires a supported secure context, typically `localhost` or HTTPS.

### Import Requires Care

CSV relationship fields should contain the appropriate existing record IDs, not display names. Review imported data and maintain a backup before importing or restoring records.

---

## 📝 Changelog

### Reliability & Branding Updates

- Updated application branding to **RV Workspace**.
- Documented local-first data storage and frontend-only project scope.
- Included documentation for versioned IndexedDB schema and index setup.
- Documented Service Worker cache versioning and offline application-shell behaviour.
- Documented CSV export safeguards and supported import/export workflows.

---

## 🎯 Project Objectives

RV Workspace demonstrates practical frontend engineering concepts, including:

- Semantic HTML and responsive CSS.
- Modular JavaScript and DOM manipulation.
- CRUD operations and record lifecycle management.
- IndexedDB transactions, schema versioning, and indexes.
- Relationships between connected records.
- Client-side validation and user feedback.
- CSV and JSON import/export workflows.
- LocalStorage and SessionStorage management.
- Service Worker registration and offline app-shell caching.
- Theme switching, responsive navigation, and accessibility considerations.

The project highlights how native web technologies can be combined to build a structured, feature-rich management application without relying on a frontend framework or backend.

---

## 🚀 Project Status

**Project:** RV Workspace
**Category:** Frontend Web Application
**Architecture:** Browser-based, local-first
**Technologies:** HTML5, CSS3, Vanilla JavaScript
**Storage:** IndexedDB, LocalStorage, SessionStorage
**Offline Support:** Service Worker and Cache API

---

## 👨‍💻 Author

**Ravi Yadav**

Built with HTML, CSS, and JavaScript. 🌌

**RV Workspace — Your Work. One Workspace.**