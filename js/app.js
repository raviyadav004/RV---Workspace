(() => {
    "use strict";
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    const TYPES = {
        clients: {
            label: "Clients",
            singular: "client",
            description: "Manage your client relationships",
            fields: [
                {
                    key: "name",
                    label: "Client name",
                    required: true,
                    placeholder: "e.g. Studio",
                },
                {
                    key: "email",
                    label: "Email address",
                    type: "email",
                    placeholder: "name@example.com",
                },
                { key: "phone",
                    label: "Phone number",
                    placeholder: "+91 9xxxxxxxx0"
                },
                {
                    key: "company",
                    label: "Company",
                    placeholder: "Company or organisation",
                },
                {
                    key: "status",
                    label: "Status",
                    type: "select",
                    options: ["Active", "On hold", "Completed"],
                },
                {
                    key: "notes",
                    label: "Notes",
                    type: "textarea",
                    full: true,
                    placeholder: "Useful details about this client",
                },
            ],
            columns: [
                ["name", "Client"],
                ["company", "Company"],
                ["email", "Email"],
                ["status", "Status"],
                ["updatedAt", "Last updated"],
            ],
        },
        projects: {
            label: "Projects",
            singular: "project",
            description: "Plan work and connect it to clients",
            fields: [
                {
                    key: "name",
                    label: "Project name",
                    required: true,
                    placeholder: "e.g. Website redesign",
                },
                { key: "clientId",
                    label: "Client",
                    type: "client"
                },
                {
                    key: "status",
                    label: "Status",
                    type: "select",
                    options: ["Active", "In progress", "On hold", "Completed"],
                },
                {
                    key: "budget",
                    label: "Budget (₹)",
                    type: "number",
                    placeholder: "0",
                    min: 0,
                },
                { key: "dueDate",
                    label: "Due date",
                    type: "date"
                },
                {
                    key: "notes",
                    label: "Notes",
                    type: "textarea",
                    full: true,
                    placeholder: "Project scope or next steps",
                },
            ],
            columns: [
                ["name", "Project"],
                ["clientId", "Client"],
                ["status", "Status"],
                ["budget", "Budget"],
                ["dueDate", "Due date"],
            ],
        },
        tasks: {
            label: "Tasks",
            singular: "task",
            description: "Keep the next actions moving",
            fields: [
                {
                    key: "name",
                    label: "Task name",
                    required: true,
                    placeholder: "e.g. Send project proposal",
                },
                { key: "projectId",
                    label: "Project",
                    type: "project"
                },
                {
                    key: "status",
                    label: "Status",
                    type: "select",
                    options: ["Pending", "In progress", "On hold", "Completed"],
                },
                {
                    key: "priority",
                    label: "Priority",
                    type: "select",
                    options: ["Low", "Medium", "High"],
                },
                { key: "dueDate",
                    label: "Due date",
                    type: "date"
                },
                {
                    key: "notes",
                    label: "Notes",
                    type: "textarea",
                    full: true,
                    placeholder: "Task details",
                },
            ],
            columns: [
                ["name", "Task"],
                ["projectId", "Project"],
                ["status", "Status"],
                ["priority", "Priority"],
                ["dueDate", "Due date"],
            ],
        },
        contacts: {
            label: "Contacts",
            singular: "contact",
            description: "Keep people and client contacts connected",
            fields: [
                {
                    key: "name",
                    label: "Contact name",
                    required: true,
                    placeholder: "e.g. R. Yadav",
                },
                { key: "clientId",
                    label: "Client",
                    type: "client"
                },
                {
                    key: "role",
                    label: "Role / title",
                    placeholder: "e.g. Project lead",
                },
                {
                    key: "email",
                    label: "Email address",
                    type: "email",
                    placeholder: "name@example.com",
                },
                { key: "phone",
                    label: "Phone number",
                    placeholder: "+91 9xxxxxxx2"
                },
                {
                    key: "notes",
                    label: "Notes",
                    type: "textarea",
                    full: true,
                    placeholder: "Contact details",
                },
            ],
            columns: [
                ["name", "Contact"],
                ["clientId", "Client"],
                ["role", "Role"],
                ["email", "Email"],
                ["phone", "Phone"],
            ],
        },
        payments: {
            label: "Payments",
            singular: "payment",
            description: "Track project invoices and payment status",
            fields: [
                {
                    key: "name",
                    label: "Payment / invoice reference",
                    required: true,
                    placeholder: "e.g. INV-2026-001",
                },
                { key: "projectId",
                    label: "Related project",
                    type: "project"
                },
                {
                    key: "amount",
                    label: "Amount (₹)",
                    type: "number",
                    required: true,
                    placeholder: "0.00",
                    min: 0,
                },
                {
                    key: "status",
                    label: "Payment status",
                    type: "select",
                    options: ["Pending", "Partially paid", "Paid", "Overdue"],
                },
                { key: "dueDate",
                    label: "Due date",
                    type: "date"
                },
                {
                    key: "method",
                    label: "Payment method",
                    type: "select",
                    options: [
                        "Not specified",
                        "Bank transfer",
                        "UPI",
                        "Cash",
                        "Card",
                        "Other",
                    ],
                },
                {
                    key: "notes",
                    label: "Notes",
                    type: "textarea",
                    full: true,
                    placeholder: "Invoice or payment notes",
                },
            ],
            columns: [
                ["name", "Reference"],
                ["projectId", "Project"],
                ["amount", "Amount"],
                ["status", "Status"],
                ["dueDate", "Due date"],
            ],
        },
    };

    let currentView = Storage.getSession("view", "dashboard");
    if (currentView !== "dashboard" && currentView !== "trash" && !TYPES[currentView])
        currentView = "dashboard";
    let page = 1, editingId = null, pendingConfirm = null, selected = new Set(), searchTimer = null;
    let records = { clients: [], projects: [], tasks: [], activity: [] };

    const uid = () => crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    const now = () => new Date().toISOString();
    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]);

    const dateText = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", }) : "—";
    const isValidDate = (value) => {
        const normalized = String(value || "");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized))
            return false;
        const date = new Date(`${normalized}T00:00:00.000Z`);
        return (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === normalized);
    };

    const money = (value) => "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const live = (type) => records[type].filter((item) => !item.deleted);
    const getName = (type, id) => id ? records[type].find((item) => item.id === id)?.name || "Unlinked" : "—";
    async function init() {
        applyTheme(Storage.getPreference("theme", "light"));
        try {
            await Database.open();
            for (const type of Database.stores) {
                records[type] = await Database.getAll(type);
            }
            $("#search-input").value = Storage.getSession("search", "") || "";
            $("#page-size").value = String(Storage.getPreference("pageSize", 10));
            bindEvents();
            setView(currentView);
            $("#loading-state")?.classList.add("hidden");
            $("#saved-status").textContent = "● All changes saved";
        }
        catch (error) {
            $("#loading-state")?.classList.add("hidden");
            toast("Could not start local database: " + error.message, true);
            $("#saved-status").textContent = "● Storage unavailable";
        }
    }
    
    function bindEvents() {
        $$(".nav-link").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
        $("#quick-add").addEventListener("click", () => openForm(currentView === "dashboard" || currentView === "trash" ? "clients" : currentView));
        $("#add-record").addEventListener("click", () => openForm(currentView));
        $$("[data-create]").forEach((button) => button.addEventListener("click", () => openForm(button.dataset.create)));
        $("#theme-toggle").addEventListener("click", () => applyTheme(document.body.classList.contains("dark") ? "light" : "dark"));
        $("#search-input").addEventListener("input", (event) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                Storage.setSession("search", event.target.value);
                page = 1;
                renderTable();
            }, 220);
        });

        $("#filter-status").addEventListener("change", () => {
            Storage.setPreference("filter:" + currentView, $("#filter-status").value);
            page = 1;
            renderTable();
        });
    
        $("#filter-priority").addEventListener("change", () => {
            Storage.setPreference("priority:" + currentView, $("#filter-priority").value);
            page = 1;
            renderTable();
        });

        $("#filter-related").addEventListener("change", () => {
            Storage.setPreference("related:" + currentView, $("#filter-related").value);
            page = 1;
            renderTable();
        });

        $("#sort-by").addEventListener("change", () => {
            Storage.setPreference("sort:" + currentView, $("#sort-by").value);
            page = 1;
            renderTable();
        });

        $("#page-size").addEventListener("change", (event) => {
            Storage.setPreference("pageSize", Number(event.target.value));
            page = 1;
            renderTable();
        });

        $("#prev-page").addEventListener("click", () => {
            if (page > 1) {
                page--;
                renderTable();
            }
        });

        $("#next-page").addEventListener("click", () => {
            page++;
            renderTable();
        });

        $("#close-dialog").addEventListener("click", closeForm);
        $("#cancel-dialog").addEventListener("click", closeForm);
        $("#record-form").addEventListener("submit", saveForm);
        $("#form-fields").addEventListener("input", saveFormDraft);
        $("#form-fields").addEventListener("change", saveFormDraft);
        $("#confirm-cancel").addEventListener("click", () => {
            pendingConfirm = null;
            $("#confirm-dialog").close();
        });

        $("#confirm-ok").addEventListener("click", async () => {
            const action = pendingConfirm;
            pendingConfirm = null;
            $("#confirm-ok").disabled = true;
            $("#confirm-dialog").close();
            try {
                if (action)
                    await action();
            }
            catch (error) {
                console.error("Confirmed action failed:", error);
                toast("Action failed: " + (error?.message || "Please try again."), true);
            }
            finally {
                $("#confirm-ok").disabled = false;
            }
        });

        $("#bulk-delete").addEventListener("click", () => confirmAction("Move selected records to trash?", "Selected records can be restored from the recycle bin.", bulkDelete));
        $("#bulk-archive").addEventListener("click", () => confirmAction("Archive selected records?", "Selected records will remain in your workspace and can still be edited.", bulkArchive));
        $("#clear-selection").addEventListener("click", () => {
            selected.clear();
            renderTable();
        });
        $("#export-json").addEventListener("click", exportJSON);
        $("#export-csv-button").addEventListener("click", exportCSV);
        $("#import-json").addEventListener("change", importJSON);
        $("#import-csv").addEventListener("change", importCSV);

        const sidebar = $("#sidebar");
        const menuToggle = $("#menu-toggle");
        const sidebarBackdrop = $("#sidebar-backdrop");
        const closeSidebar = () => {
            sidebar.classList.remove("open");
            sidebarBackdrop.classList.remove("visible");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open menu");
        };

        menuToggle.setAttribute("aria-controls", "sidebar");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.addEventListener("click", (event) => {

            event.stopPropagation();
            const willOpen = !sidebar.classList.contains("open");
            if (willOpen) {
                sidebar.classList.add("open");
                sidebarBackdrop.classList.add("visible");
                menuToggle.setAttribute("aria-expanded", "true");
                menuToggle.setAttribute("aria-label", "Close menu");
            }
            else {
                closeSidebar();
            }
        });

        sidebarBackdrop.addEventListener("click", closeSidebar);
        document.addEventListener("click", (event) => {
            const actionButton = event.target.closest("[data-action]");
            if (actionButton) {
                handleRowAction(actionButton.dataset.action, actionButton.dataset.id);
            }

            const check = event.target.closest("[data-select]");
            if (check) {
                check.checked ? selected.add(check.dataset.select) : selected.delete(check.dataset.select);
                updateBulkBar();
            }
            if (event.target.closest(".nav-link") && window.innerWidth <= 720) {
                closeSidebar();
            }
            if (window.innerWidth <= 720 && sidebar.classList.contains("open") && !event.target.closest("#sidebar") && !event.target.closest("#menu-toggle")) {
                closeSidebar();
            }
        });

        document.addEventListener("keydown", (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                $("#search-input")?.focus();
            }
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
                event.preventDefault();
                openForm(currentView === "dashboard" || currentView === "trash" ? "clients" : currentView);
            }
            if (event.key === "Escape") {
                closeSidebar();
            }
        });
    }

    function setView(view) {
        currentView = view;
        page = 1;
        selected.clear();
        Storage.setSession("view", view);

        $$(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
        $("#dashboard-view").classList.toggle("hidden", view !== "dashboard");
        $("#records-view").classList.toggle("hidden", view === "dashboard");

        const trash = view === "trash", config = TYPES[view];
        $("#page-title").textContent = trash ? "Recycle bin" : view === "dashboard" ? "Dashboard" : config.label;
        $("#page-eyebrow").textContent = trash ? "RECOVER DELETED RECORDS" : view === "dashboard" ? "WORKSPACE OVERVIEW" : "MANAGE YOUR WORKSPACE";
        if (view !== "dashboard") {
            $("#table-title").textContent = trash ? "Deleted records" : config.label;
            $("#table-description").textContent = trash ? "Restore records or permanently remove them" : config.description;
            $("#add-record").classList.toggle("hidden", trash);
            $("#filter-status").classList.toggle("hidden", trash);
            $("#search-input").placeholder = trash ? "Search deleted records..." : "Search " + config.label.toLowerCase() + "...";
            $("#filter-status").value = Storage.getPreference("filter:" + view, "") || "";
            $("#filter-priority").classList.toggle("hidden", view !== "tasks");

            const related = $("#filter-related");
            const relatedType = ["projects", "contacts"].includes(view) ? "clients" : ["tasks", "payments"].includes(view) ? "projects" : null;
            related.classList.toggle("hidden", !relatedType);
            related.innerHTML = '<option value="">All related records</option>' + (relatedType ? live(relatedType).map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("") : "");
            related.value = Storage.getPreference("related:" + view, "") || "";
            $("#filter-priority").value = Storage.getPreference("priority:" + view, "") || "";
            $("#sort-by").value = Storage.getPreference("sort:" + view, "updated-desc") || "updated-desc";
        }
        render();
    }

    function allRecordTypes() {
        return Object.keys(TYPES);
    }

    function allRecords() {
        return allRecordTypes().flatMap((type) => records[type] || []);
    }

    function render() {
        renderDashboard();
        renderTable();
        $("#trash-count").textContent = allRecords().filter((r) => r.deleted).length;
    }

    function renderDashboard() {
        $("#stat-clients").textContent = live("clients").length;
        $("#stat-projects").textContent = live("projects").length;
        $("#stat-tasks").textContent = live("tasks").filter((t) => t.status !== "Completed").length;
        $("#stat-payments").textContent = money((records.payments || []).filter((p) => !p.deleted && p.status === "Paid").reduce((sum, p) => sum + Number(p.amount || 0), 0));
        const contactStat = $("#stat-contacts");
        if (contactStat) {
            contactStat.textContent = live("contacts").length;
        }
        const activities = [...records.activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
        $("#activity-list").innerHTML = activities.length ? activities.map((a) => `<div class="activity-item"><span class="activity-dot"></span><div><b>${esc(a.title)}</b><p>${esc(a.detail)}</p><time>${dateText(a.createdAt)}</time></div></div>`).join("") : '<div class="empty-state"><span>◷</span><b>No activity yet</b><p>Add a client, project or task to get started.</p></div>';
    }

    function filteredRecords() {
        const type = currentView, isTrash = type === "trash";
        let list = isTrash ? allRecords().filter((r) => r.deleted) : live(type);
        const query = ($("#search-input").value || "").trim().toLowerCase();
        if (query) {
            list = list.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(query)));
        }
        if (!isTrash) {
            const status = $("#filter-status").value;
            if (status)
                list = list.filter((r) => r.status === status);
            const priority = $("#filter-priority").value;
            if (priority && type === "tasks")
                list = list.filter((r) => r.priority === priority);
            const related = $("#filter-related").value;
            if (related && ["projects", "contacts"].includes(type))
                list = list.filter((r) => r.clientId === related);
            if (related && ["tasks", "payments"].includes(type))
                list = list.filter((r) => r.projectId === related);
        }

        const sort = $("#sort-by").value;
        list.sort((a, b) => sort === "name-asc" ? String(a.name).localeCompare(String(b.name)) : sort === "created-desc" ? b.createdAt.localeCompare(a.createdAt) : sort === "created-asc" ? a.createdAt.localeCompare(b.createdAt) : b.updatedAt.localeCompare(a.updatedAt));
        return list;
    }

    function renderTable() {
        if (currentView === "dashboard")
            return;
        const isTrash = currentView === "trash", type = isTrash ? "trash" : currentView, config = isTrash ? null : TYPES[type];
        const columns = isTrash ? [
            ["name", "Record"],
            ["recordType", "Type"],
            ["deletedAt", "Deleted on"],
        ] : config.columns;

        $("#table-head").innerHTML = `<tr><th><input id="select-page" type="checkbox" aria-label="Select page"></th>${columns.map((c) => `<th>${c[1]}</th>`).join("")}<th>Actions</th></tr>`;
        const list = filteredRecords(), size = Number($("#page-size").value) || 10, pages = Math.max(1, Math.ceil(list.length / size));
        if (page > pages)
            page = pages;

        const pageItems = list.slice((page - 1) * size, page * size);
        $("#table-body").innerHTML = pageItems.length ? pageItems.map((item) => {
            const typeOf = isTrash ? item.recordType : type;
            const cells = columns.map(([key]) => {
                let value = item[key];
                if (key === "clientId")
                    value = getName("clients", value);
                if (key === "projectId")
                    value = getName("projects", value);
                if (key === "budget")
                    value = money(value);
                if (key === "updatedAt" || key === "deletedAt" || key === "dueDate")
                    value = dateText(value);
                if (key === "status")
                    return `<td><span class="status-pill ${String(value || "active").toLowerCase().replace(/\s/g, "-")}">${esc(value || "Active")}</span></td>`;
                if (key === "name")
                    return `<td><span class="record-name">${esc(value)}</span><span class="record-sub">${item.archived ? "Archived · " : ""}ID: ${esc(item.id.slice(0, 8))}</span></td>`;
                return `<td>${esc(value || "—")}</td>`;
            }).join("");

            const actions = isTrash ? `<button data-action="restore" data-id="${item.id}">Restore</button><button data-action="permanent" data-id="${item.id}">Delete forever</button>`
                : `<button data-action="edit" data-id="${item.id}" data-type="${typeOf}">Edit</button><button data-action="duplicate" data-id="${item.id}" data-type="${typeOf}">Copy</button>

            <button data-action="trash" data-id="${item.id}" data-type="${typeOf}">⋯</button>`;
            return `<tr><td><input type="checkbox" data-select="${item.id}" aria-label="Select ${esc(item.name)}" ${selected.has(item.id) ? "checked" : ""}></td>${cells}<td><div class="row-actions">${actions}</div></td></tr>`;
        }).join("")
            : `<tr><td colspan="${columns.length + 2}"><div class="empty-state"><span>${isTrash ? "♲" : "⌕"}</span><b>${isTrash ? "Your recycle bin is empty" : "No records found"}</b><p>${isTrash ? "Deleted records will appear here." : "Try changing your search or add your first record."}</p></div></td></tr>`;

            $("#select-page").checked = pageItems.length > 0 && pageItems.every((item) => selected.has(item.id));
            $("#select-page").addEventListener("change", (event) => {
            pageItems.forEach((item) => event.target.checked ? selected.add(item.id) : selected.delete(item.id));
            renderTable();
        });
        $("#result-count").textContent = `${list.length} record${list.length === 1 ? "" : "s"}`;
        $("#page-info").textContent = `Page ${page} of ${pages}`;
        $("#prev-page").disabled = page <= 1;
        $("#next-page").disabled = page >= pages;
        updateBulkBar();
    }

    function updateBulkBar() {
        $("#bulk-bar").classList.toggle("hidden", selected.size === 0 || currentView === "trash" || currentView === "dashboard");
        $("#selected-count").textContent = `${selected.size} selected`;
    }

    function openForm(type, id = null, duplicate = false) {
        if (!TYPES[type])
            type = "clients";
        editingId = id;
        const original = id ? records[type].find((r) => r.id === id) : null;
        const draftKey = `draft:${type}:${id && !duplicate ? id : "new"}`;
        const draft = !duplicate ? Storage.getSession(draftKey, null) : null;

        $("#form-title").textContent = (id ? (duplicate ? "Duplicate " : "Edit ") : "Add ") + TYPES[type].singular;
        $("#form-fields").innerHTML = TYPES[type].fields.map((field) => {
            const defaultValue = original ? (original[field.key] ?? "") : field.key === "status" ? field.options?.[0] || "Active" : field.key === "priority" ? "Medium" : "";
            const value = draft && Object.prototype.hasOwnProperty.call(draft, field.key) ? draft[field.key] : defaultValue;
            let control = "";
            if (field.type === "textarea")
                control = `<textarea id="field-${field.key}" name="${field.key}" placeholder="${esc(field.placeholder || "")}" rows="3">${esc(value)}</textarea>`;
            else if (field.type === "select")
                control = `<select id="field-${field.key}" name="${field.key}">${field.options.map((option) => `<option ${value === option ? "selected" : ""}>${esc(option)}</option>`).join("")}</select>`;
            else if (field.type === "client" || field.type === "project") {
                const linkedType = field.type === "client" ? "clients" : "projects";
                control = `<select id="field-${field.key}" name="${field.key}"><option value="">No link</option>${live(linkedType).map((r) => `<option value="${r.id}" ${value === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select>`;
            }
            else
                control = `<input id="field-${field.key}" name="${field.key}" type="${field.type || "text"}" value="${esc(value)}" placeholder="${esc(field.placeholder || "")}" ${field.min !== undefined ? `min="${field.min}"` : ""}>`;
            return `<div class="field ${field.full ? "full" : ""}" data-field="${field.key}"><label for="field-${field.key}">${esc(field.label)}${field.required ? " *" : ""}</label>${control}<span class="error" aria-live="polite"></span></div>`;
        }).join("");

        $("#record-form").dataset.type = type;
        const history = $("#record-history");
        const historyItems = original ? records.activity.filter((a) => a.recordId === original.id).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 4) : [];
        history.classList.toggle("hidden", historyItems.length === 0);
        history.innerHTML = historyItems.length ? `<h3>Recent record history</h3>${historyItems.map((a) => `<div class="history-entry"><b>${esc(a.title)}</b><span>${esc(a.detail || "")}</span><time>${dateText(a.createdAt)}</time></div>`).join("")}` : "";
        if (duplicate) {
            editingId = null;
            const nameInput = $("#field-name");
            if (nameInput) {
                const base = `Copy of ${original?.name || "record"}`;
                let candidate = base, suffix = 2;
                const existing = new Set(live(type).map((r) => String(r.name || "").toLowerCase()));
                while (existing.has(candidate.toLowerCase()))
                    candidate = `${base} (${suffix++})`;
                nameInput.value = candidate;
            }
        }
        $("#record-dialog").showModal();
    }

    function saveFormDraft() {
        const type = $("#record-form").dataset.type;
        if (!TYPES[type] || !$("#record-dialog").open)
            return;
        const key = `draft:${type}:${editingId || "new"}`;
        const draft = {};
        $("#form-fields").querySelectorAll("input,select,textarea").forEach((input) => { draft[input.name] = input.value; });
        Storage.setSession(key, draft);
    }

    function closeForm() {
        $("#record-dialog").close();
        editingId = null;
    }

    async function saveForm(event) {
        event.preventDefault();
        const form = $("#record-form"), type = form.dataset.type, config = TYPES[type], data = {};
        const draftKey = `draft:${type}:${editingId || "new"}`;

        let valid = true;
        config.fields.forEach((field) => {
            const wrapper = $(`[data-field="${field.key}"]`), input = wrapper.querySelector("input,select,textarea"), value = input.value.trim();
            wrapper.classList.remove("invalid");
            const errorNode = wrapper.querySelector(".error");
            if (errorNode)
                errorNode.textContent = "";
            input.removeAttribute("aria-invalid");
            input.removeAttribute("aria-describedby");

            if (field.required && !value) {
                valid = false;
                showFieldError(wrapper, "This field is required.");
            }

            if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                valid = false;
                showFieldError(wrapper, "Enter a valid email address.");
            }

            if (field.type === "number" && value && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
                valid = false;
                showFieldError(wrapper, "Enter a valid non-negative number.");
            }

            data[field.key] = field.type === "number" ? (value ? Number(value) : 0) : value;
            if (field.type === "date" && value && !isValidDate(value)) {
                valid = false;
                showFieldError(wrapper, "Enter a real calendar date.");
            }

            if (field.type === "select" && value && field.options && !field.options.includes(value)) {
                valid = false;
                showFieldError(wrapper, "Choose one of the available options.");
            }
        });

        if (type === "projects" && data.clientId && !live("clients").some((r) => r.id === data.clientId)) {
            valid = false;
            showFieldError($('[data-field="clientId"]'), "Choose an existing active client.");
        }

        if (type === "contacts" && data.clientId && !live("clients").some((r) => r.id === data.clientId)) {
            valid = false;
            showFieldError($('[data-field="clientId"]'), "Choose an existing active client.");
        }

        if ((type === "tasks" || type === "payments") && data.projectId && !live("projects").some((r) => r.id === data.projectId)) {
            valid = false;
            showFieldError($('[data-field="projectId"]'), "Choose an existing active project.");
        }

        if (!valid) {
            const firstInvalid = $("#form-fields .field.invalid input, #form-fields .field.invalid select, #form-fields .field.invalid textarea");
            firstInvalid?.focus();
            toast("Please correct the highlighted fields.", true);
            return;
        }

        const duplicateName = live(type).some((r) => r.name.toLowerCase() === data.name.toLowerCase() && r.id !== editingId);
        if (duplicateName) {
            const wrapper = $('[data-field="name"]');
            showFieldError(wrapper, "A record with this name already exists.");
            toast("Possible duplicate record detected.", true);
            return;
        }

        const previous = editingId ? records[type].find((r) => r.id === editingId) : null;
        const item = {
            ...(previous || {}),
            ...data,
            id: previous?.id || uid(),
            createdAt: previous?.createdAt || now(),
            updatedAt: now(),
            deleted: false,
            deletedAt: null,
            recordType: type,
        };

        try {
            await Database.put(type, item);
            if (previous)
                records[type] = records[type].map((r) => (r.id === item.id ? item : r));
            else
                records[type].push(item);
            await addActivity(`${previous ? "Updated" : "Created"} ${config.singular}`, item.name, item.id, type);
            Storage.removeSession(draftKey);
            closeForm();
            selected.clear();
            render();
            toast(`${config.singular[0].toUpperCase() + config.singular.slice(1)} ${previous ? "updated" : "created"} successfully.`);
        }
        catch (error) {
            toast("Could not save record: " + error.message, true);
        }
    }

    function showFieldError(wrapper, message) {
        wrapper.classList.add("invalid");
        const input = wrapper.querySelector("input,select,textarea");
        const error = wrapper.querySelector(".error");
        if (input) {
            input.setAttribute("aria-invalid", "true");
            if (error) {
                if (!error.id)
                    error.id = `error-${input.id}`;
                input.setAttribute("aria-describedby", error.id);
            }
        }
        if (error)
            error.textContent = message;
    }

    async function addActivity(title, detail, recordId = null, recordType = null) {
        const item = { id: uid(), title, detail, recordId, recordType, createdAt: now(), };
        try {
            await Database.put("activity", item);
            records.activity.push(item);
            records.activity.sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
            if (records.activity.length > 100) {
                const excess = records.activity.splice(0, records.activity.length - 100);
                await Database.removeMany("activity", excess.map((entry) => entry.id));
            }
        }
        catch (error) {
            console.warn("Activity history could not be saved:", error);
        }
    }

    function confirmAction(title, message, action) {
        $("#confirm-title").textContent = title;
        $("#confirm-message").textContent = message;
        pendingConfirm = action;
        $("#confirm-dialog").showModal();
    }

    async function handleRowAction(action, id) {
        let type = currentView === "trash" ? null : currentView;
        let item;
        if (action === "restore" || action === "permanent")
            item = allRecords().find((r) => r.id === id);
        else {
            type = eventTypeFromButton(id, action);
            item = records[type]?.find((r) => r.id === id);
        }
        if (!item)
            return;
        if (action === "edit")
            openForm(type, id);
        if (action === "duplicate")
            openForm(type, id, true);
        if (action === "trash")
            confirmAction("Move record to trash?", `“${item.name}” can be restored later.`, () => softDelete(type, id));
        if (action === "restore")
            await restoreRecord(item);
        if (action === "permanent")
            confirmAction("Delete permanently?", `“${item.name}” will be removed from this device. This cannot be undone.`, () => permanentDelete(item));
    }

    function eventTypeFromButton(id, action) {
        const button = $$(`[data-id="${CSS.escape(id)}"][data-action="${action}"]`)[0];
        return button?.dataset.type || currentView;
    }

    async function softDelete(type, id) {
        const item = records[type].find((r) => r.id === id);
        if (!item)
            return;
        const dependents = type === "clients" ? allRecords().filter((r) => !r.deleted && r.clientId === id) : type === "projects" ? allRecords().filter((r) => !r.deleted && r.projectId === id) : [];
        if (dependents.length) {
            toast(`Move or reassign ${dependents.length} linked record(s) before deleting this ${TYPES[type].singular}.`, true);
            return;
        }

        const updated = { ...item, deleted: true, deletedAt: now(), updatedAt: now(), };
        await Database.put(type, updated);
        records[type] = records[type].map((r) => (r.id === id ? updated : r));
        await addActivity("Moved to recycle bin", updated.name, updated.id, type);
        selected.delete(id);
        render();
        toast("Record moved to recycle bin.");
    }

    async function restoreRecord(item) {
        const type = item.recordType;
        const validParent = item.clientId ? live("clients").some((r) => r.id === item.clientId) : true;
        const validProject = item.projectId ? live("projects").some((r) => r.id === item.projectId) : true;
        if (!validParent || !validProject) {
            toast("This record has a missing or deleted parent. Restore its linked client/project first.", true);
            return;
        }

        const updated = { ...item, deleted: false, deletedAt: null, updatedAt: now(), };
        await Database.put(type, updated);
        records[type] = records[type].map((r) => r.id === updated.id ? updated : r);
        await addActivity("Restored record", updated.name, updated.id, type);
        render();
        toast("Record restored.");
    }

    async function permanentDelete(item) {
        const dependents = allRecords().filter((r) => r.id !== item.id && (r.clientId === item.id || r.projectId === item.id));
        if (dependents.length) {
            toast(`Cannot permanently delete this record while ${dependents.length} linked record(s) still reference it.`, true);
            return;
        }
        await Database.remove(item.recordType, item.id);
        records[item.recordType] = records[item.recordType].filter((r) => r.id !== item.id);
        await addActivity("Permanently deleted", item.name, item.id, item.recordType);
        render();
        toast("Record permanently deleted.");
    }

    async function bulkDelete() {
        const ids = [...selected], idSet = new Set(ids), targets = [];
        let skipped = 0;
        for (const type of Object.keys(TYPES))
            for (const id of ids) {
                const item = records[type].find((r) => r.id === id && !r.deleted);
                if (!item)
                    continue;
                const dependents = type === "clients" ? allRecords().filter((r) => !r.deleted && r.clientId === id && !idSet.has(r.id)) : type === "projects" ? allRecords().filter((r) => !r.deleted && r.projectId === id && !idSet.has(r.id)) : [];
                if (dependents.length) {
                    skipped++;
                    continue;
                }
                targets.push({ type, item });
            }

            const byType = new Map();
        for (const target of targets) {
            target.item = { ...target.item, deleted: true, deletedAt: now(), updatedAt: now(), };
            if (!byType.has(target.type))
                byType.set(target.type, []);
            byType.get(target.type).push(target.item);
        }

        for (const [type, items] of byType) {
            await Database.putMany(type, items);
            const map = new Map(items.map((item) => [item.id, item]));
            records[type] = records[type].map((item) => map.get(item.id) || item);
        }
        await addActivity("Bulk action", `Moved ${targets.length} selected record(s) to recycle bin; ${skipped} parent record(s) skipped due to linked records.`);
        selected.clear();
        render();
        toast(`Moved ${targets.length} record(s) to trash${skipped ? `; skipped ${skipped} with linked records` : ""}.`, skipped > 0);
    }

    async function bulkArchive() {
        const ids = [...selected];
        let count = 0;
        for (const type of Object.keys(TYPES)) {
            const items = [];
            for (const id of ids) {
                const item = records[type].find((r) => r.id === id && !r.deleted);
                if (!item)
                    continue;
                const updated = { ...item, archived: true, updatedAt: now() };
                const statusField = TYPES[type].fields.find((f) => f.key === "status");
                if (statusField?.options?.includes("On hold"))
                    updated.status = "On hold";
                items.push(updated);
                count++;
            }

            if (items.length) {
                await Database.putMany(type, items);
                const map = new Map(items.map((item) => [item.id, item]));
                records[type] = records[type].map((item) => map.get(item.id) || item);
            }
        }

        await addActivity("Bulk archive", `Archived ${count} selected record(s).`);
        selected.clear();
        render();
        toast(`Archived ${count} record(s).`);
    }

    function applyTheme(theme) {
        const isDark = theme === "dark";
        document.body.classList.toggle("dark", isDark);
        Storage.setPreference("theme", isDark ? "dark" : "light");
        const toggle = $("#theme-toggle");
        toggle.setAttribute("aria-pressed", String(isDark));
        toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
        toggle.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#171a2b" : "#f5f7fb");
    }

    function toast(message, error = false) {
        const node = document.createElement("div");
        node.className = "toast" + (error ? " error" : "");
        node.textContent = message;
        $("#toast-region").append(node);
        setTimeout(() => node.remove(), 3600);
    }

    function downloadFile(filename, content, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function exportJSON() {
        const data = {};
        for (const type of [...allRecordTypes(), "activity"])
            data[type] = records[type] || [];
        const payload = { app: "RV Workspace", version: 2, exportedAt: now(), data, };
        downloadFile("rv-backup-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(payload, null, 2), "application/json");
        toast("JSON backup exported.");
    }

    async function importJSON(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file)
            return;
        try {
            const parsed = JSON.parse(await file.text()), data = parsed.data || parsed;
            if (!data || !allRecordTypes().some((type) => Array.isArray(data[type])))
                throw new Error("This file does not contain supported RV record arrays.");
            const staged = {};

            let skipped = 0, total = 0;
            for (const type of [...allRecordTypes(), "activity"]) {
                if (!Array.isArray(data[type]))
                    continue;
                staged[type] = [];
                const validFields = type === "activity" ? null : new Set(TYPES[type].fields.map((f) => f.key));
                const incomingIds = new Set();
                const incomingNames = new Map();
                const existingNames = new Map(type === "activity" ? [] : live(type).map((record) => [
                    String(record.name || "").trim().toLowerCase(),
                    record.id,
                ]));

                for (const raw of data[type]) {
                    if (!raw || typeof raw !== "object" || Array.isArray(raw) || typeof raw.id !== "string" || !raw.id.trim() || incomingIds.has(raw.id.trim())) {
                        skipped++;
                        continue;
                    }
                    incomingIds.add(raw.id.trim());

                    const safe = { ...raw, id: raw.id.trim() };
                    if (type !== "activity") {
                        safe.name = String(safe.name || "").trim().slice(0, 200);
                        const normalizedName = safe.name.toLowerCase();
                        if (!safe.name || (existingNames.has(normalizedName) && existingNames.get(normalizedName) !== safe.id) || (incomingNames.has(normalizedName) && incomingNames.get(normalizedName) !== safe.id)) {
                            skipped++;
                            continue;
                        }
                        incomingNames.set(normalizedName, safe.id);

                        for (const key of Object.keys(safe))
                            if (!validFields.has(key) && !["id", "createdAt", "updatedAt", "deleted", "deletedAt", "recordType",].includes(key))
                                delete safe[key];
                        for (const field of TYPES[type].fields) {
                            let value = safe[field.key];

                            if (value === undefined && field.type === "select") {
                                value = field.key === "priority" ? "Medium" : field.options[0];
                                safe[field.key] = value;
                            }

                            if (field.required && !String(value ?? "").trim()) {
                                safe.invalid = true;
                                break;
                            }

                            if (field.type === "number") {
                                const n = Number(value || 0);
                                if (!Number.isFinite(n) || n < 0) {
                                    safe.invalid = true;
                                    break;
                                }
                                safe[field.key] = n;
                            }

                            if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                                safe.invalid = true;
                                break;
                            }

                            if (field.type === "date" && value && !isValidDate(value)) {
                                safe.invalid = true;
                                break;
                            }

                            if (field.type === "select" && value && !field.options.includes(value)) {
                                safe.invalid = true;
                                break;
                            }
                        }

                        if (safe.invalid) {
                            skipped++;
                            continue;
                        }

                        delete safe.invalid;
                        safe.recordType = type;
                        safe.deleted = Boolean(safe.deleted);
                        safe.deletedAt = safe.deleted ? safe.deletedAt || now() : null;
                        safe.createdAt = safe.createdAt || now();
                        safe.updatedAt = safe.updatedAt || now();
                    }
                    else {
                        safe.title = String(safe.title || "Imported activity").slice(0, 200);
                        safe.detail = String(safe.detail || "").slice(0, 500);
                        safe.createdAt = safe.createdAt || now();
                    }
                    staged[type].push(safe);
                    total++;
                }
            }

            if (!total)
                throw new Error("No valid records were found in this backup.");
            const clientIds = new Set([
                ...(records.clients || []).filter((r) => !r.deleted).map((r) => r.id),
                ...(staged.clients || []).filter((r) => !r.deleted).map((r) => r.id),
            ]);

            const projectIds = new Set([
                ...(records.projects || []).filter((r) => !r.deleted).map((r) => r.id),
                ...(staged.projects || []).filter((r) => !r.deleted).map((r) => r.id),
            ]);

            for (const type of ["projects", "contacts", "tasks", "payments"]) {
                if (!staged[type])
                    continue;
                staged[type] = staged[type].filter((item) => {
                    const invalid = (item.clientId && !clientIds.has(item.clientId)) || (item.projectId && !projectIds.has(item.projectId));
                    if (invalid)
                        skipped++;
                    return !invalid;
                });
            }

            total = Object.values(staged).reduce((sum, items) => sum + items.length, 0);
            if (!total)
                throw new Error("No valid records with valid relationships were found in this backup.");
            confirmAction("Restore backup?", `${total} valid record(s) will be merged by ID; matching IDs will be replaced. ${skipped} invalid record(s) will be skipped.`, async () => {
                await Database.putManyAcross(staged);
                for (const [type, values] of Object.entries(staged)) {
                    if (!values.length)
                        continue;
                    const map = new Map((records[type] || []).map((r) => [r.id, r]));
                    values.forEach((r) => map.set(r.id, r));
                    records[type] = [...map.values()];
                }

                await addActivity("Restored JSON backup", `${total} imported record(s), ${skipped} skipped`);
                render();
                toast(`Backup restored: ${total} imported, ${skipped} skipped.`);
            });
        }
        catch (error) {
            toast("Import failed: " + error.message, true);
        }
    }

    function parseCSV(text) {
        const rows = [];
        let row = [], field = "", quoted = false;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i], next = text[i + 1];
            if (quoted) {
                if (ch === '"' && next === '"') {
                    field += '"';
                    i++;
                }
                else if (ch === '"')
                    quoted = false;
                else
                    field += ch;
            }
            else if (ch === '"' && field === "")
                quoted = true;
            else if (ch === ",") {
                row.push(field);
                field = "";
            }
            else if (ch === "\n" || ch === "\r") {
                if (ch === "\r" && next === "\n")
                    i++;
                row.push(field);
                if (row.some((v) => v.trim()))
                    rows.push(row);
                row = [];
                field = "";
            }
            else
                field += ch;
        }

        if (quoted)
            throw new Error("CSV contains an unclosed quoted field.");
        row.push(field);
        if (row.some((v) => v.trim()))
            rows.push(row);
        if (rows.length < 2)
            throw new Error("CSV must include a header and at least one record.");

        const headers = rows.shift().map((h) => h.trim());
        if (headers.length)
            headers[0] = headers[0].replace(/^\uFEFF/, "");
        return rows.map((values) => Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? "").trim()])));
    }

    async function importCSV(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file)
            return;

        const type = TYPES[currentView] ? currentView : null;
        if (!type) {
            toast("Open a record module before importing CSV.", true);
            return;
        }

        try {
            const rows = parseCSV(await file.text());
            const allowed = new Set(TYPES[type].fields.map((f) => f.key));
            const prepared = [];
            const seen = new Set(live(type).map((r) => String(r.name || "").trim().toLowerCase()));
            let skipped = 0;
            for (const row of rows) {
                const clean = {};

                for (const [key, value] of Object.entries(row))
                    if (allowed.has(key))
                        clean[key] = value;
                clean.name = String(clean.name || "").trim();

                if (!clean.name || seen.has(clean.name.toLowerCase()) || TYPES[type].fields.some((f) => f.required && !String(clean[f.key] ?? "").trim())) {
                    skipped++;
                    continue;
                }

                if (["projects", "contacts"].includes(type) && clean.clientId && !live("clients").some((r) => r.id === clean.clientId)) {
                    skipped++;
                    continue;
                }

                if ((type === "tasks" || type === "payments") && clean.projectId && !live("projects").some((r) => r.id === clean.projectId)) {
                    skipped++;
                    continue;
                }

                for (const field of TYPES[type].fields) {
                    if (clean[field.key] === undefined && field.type === "select")
                        clean[field.key] =
                            field.key === "priority" ? "Medium" : field.options[0];

                        if (field.type === "number") {
                        const n = Number(clean[field.key] || 0);
                        if (!Number.isFinite(n) || n < 0) {
                            clean.invalid = true;
                            break;
                        }
                        clean[field.key] = n;
                    }

                    if (field.type === "email" && clean[field.key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean[field.key])) {
                        clean.invalid = true;
                        break;
                    }

                    if (field.type === "date" && clean[field.key] && !isValidDate(clean[field.key])) {
                        clean.invalid = true;
                        break;
                    }

                    if (field.type === "select" && clean[field.key] && !field.options.includes(clean[field.key])) {
                        clean.invalid = true;
                        break;
                    }
                }

                if (clean.invalid) {
                    skipped++;
                    continue;
                }

                clean.id = uid();
                clean.createdAt = now();
                clean.updatedAt = now();
                clean.deleted = false;
                clean.deletedAt = null;
                clean.recordType = type;
                prepared.push(clean);
                seen.add(clean.name.toLowerCase());
            }

            if (!prepared.length)
                throw new Error("No valid new records found. Check the CSV headers and values.");
            confirmAction("Import CSV records?", `${prepared.length} valid ${type} record(s) will be added. ${skipped} row(s) will be skipped.`, async () => {
                await Database.putMany(type, prepared);
                records[type].push(...prepared);
                await addActivity("Imported CSV", `${prepared.length} ${type} record(s)`);
                render();
                toast(`Imported ${prepared.length} record(s); skipped ${skipped}.`);
            });
        }
        catch (error) {
            toast("CSV import failed: " + error.message, true);
        }
    }

    function exportCSV() {
        const type = TYPES[currentView] ? currentView : null;
        if (!type) {
            toast("Open a record module to export CSV.", true);
            return;
        }
        const rows = live(type), headers = [
            ...new Set([
                ...TYPES[type].fields.map((field) => field.key),
                "id",
                "createdAt",
                "updatedAt",
                "deleted",
                "deletedAt",
                "recordType",
            ]),
        ];

        const quote = (value) => {
            let text = String(value ?? "");
            if (/^[\s]*[=+@]/.test(text) || /^[\s]*-/.test(text))
                text = "'" + text;
            return '"' + text.replace(/"/g, '""') + '"';
        };
        downloadFile(type + ".csv", [
            headers.join(","),
            ...rows.map((r) => headers.map((k) => quote(r[k])).join(",")),
        ].join("\r\n"), "text/csv;charset=utf-8;");
        toast("CSV exported.");
    }

    document.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "e") {
            event.preventDefault();
            exportCSV();
        }
    });

    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
        window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch((error) => console.warn("Offline cache registration failed:", error)));
    }
    init();
})();