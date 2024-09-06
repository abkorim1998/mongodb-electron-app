"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("mongo", {
  fetchData: (collectionName) => electron.ipcRenderer.invoke("fetch-data", collectionName),
  insertData: (collectionName, data) => electron.ipcRenderer.invoke("insert-data", collectionName, data),
  deleteData: (collectionName, data) => electron.ipcRenderer.invoke("delete-data", collectionName, data),
  fetchDatabyId: (collectionName, id) => electron.ipcRenderer.invoke("fetch-databy-id", collectionName, id)
});
