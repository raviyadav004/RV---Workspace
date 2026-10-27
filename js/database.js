const DB_NAME = "rv-workspace";
const DB_VERSION = 4;

const STORE_NAMES = [
  "clients",
  "projects",
  "tasks",
  "contacts",
  "payments",
  "activity",
];

const Database = (() => {
  let connection;
  function open() {
    if (connection) return Promise.resolve(connection);
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        return reject( new Error("IndexedDB is not supported in this browser."), );
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of STORE_NAMES) {
          const store = db.objectStoreNames.contains(name) ? request.transaction.objectStore(name) : db.createObjectStore(name, { keyPath: "id" });
          const indexes = ["updatedAt", "createdAt"];
          if (name !== "activity") {
            indexes.push( "deleted", "name", "status", "priority", "clientId", "projectId", "dueDate", );
          } else {
            indexes.push("recordId", "recordType");
          }

          for (const indexName of indexes) {
            if (!store.indexNames.contains(indexName)) {
              store.createIndex(indexName, indexName, { unique: false });
            }
          }
        }
      };

      request.onsuccess = () => {
        connection = request.result;
        connection.onversionchange = () => {
          connection.close();
          connection = null;
        };
        resolve(connection);
      };

      request.onerror = () => {
        reject(request.error || new Error("Could not open local database."));
      };
    });
  }

  async function transaction(storeName, mode, operation) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      let result;
      try {
        result = operation(store);
      } catch (error) {
        try {
          tx.abort();
        } catch {

        }

        reject(error);
        return;
      }

      tx.oncomplete = () => {
        resolve( result && typeof result === "object" && "result" in result ? result.result : result, );
      };

      tx.onerror = () => {
        reject(tx.error || new Error("Database transaction failed."));
      };

      tx.onabort = () => {
        reject(tx.error || new Error("Database transaction was aborted."));
      };
    });
  }

  const getAll = (name) => transaction(name, "readonly", (store) => {
      const req = store.getAll();
      return req;
    });

  const get = (name, id) => transaction(name, "readonly", (store) => store.get(id));
  const getAllByIndex = (name, indexName, value) => transaction(name, "readonly", (store) => {
      if (!store.indexNames.contains(indexName)) {
        throw new Error( `Index "${indexName}" is not available in ${name}.`, );
      }
      return store.index(indexName).getAll(value);
    });

  const put = (name, value) => transaction(name, "readwrite", (store) => store.put(value));
  const remove = (name, id) => transaction(name, "readwrite", (store) => store.delete(id));
  const clear = (name) => transaction(name, "readwrite", (store) => store.clear());
  const putMany = (name, values) => transaction(name, "readwrite", (store) => {
      for (const value of values) {
        store.put(value);
      }
      return values.length;
    });

  const removeMany = (name, ids) => transaction(name, "readwrite", (store) => {
      for (const id of ids) {
        store.delete(id);
      }
      return ids.length;
    });

  async function putManyAcross(entries) {
    const names = Object.keys(entries).filter( (name) => STORE_NAMES.includes(name) && Array.isArray(entries[name]) && entries[name].length, );
    if (!names.length) return 0;
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(names, "readwrite");
      let count = 0;
      for (const name of names) {
        const store = tx.objectStore(name);
        for (const item of entries[name]) {
          store.put(item);
          count++;
        }
      }

      tx.oncomplete = () => resolve(count);
      tx.onerror = () => {
        reject(tx.error || new Error("Backup transaction failed."));
      };

      tx.onabort = () => {
        reject(tx.error || new Error("Backup transaction was aborted."));
      };
    });
  }

  return {
    open,
    getAll,
    getAllByIndex,
    get,
    put,
    putMany,
    putManyAcross,
    remove,
    removeMany,
    clear,
    stores: STORE_NAMES,
  };
})();