import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  items: {
    search: (query: string) => ipcRenderer.invoke("items:search", query),
  },
  transactions: {
    list: (params: unknown) => ipcRenderer.invoke("transactions:list", params),
    create: (data: unknown) => ipcRenderer.invoke("transactions:create", data),
    update: (id: string, data: unknown) =>
      ipcRenderer.invoke("transactions:update", id, data),
    delete: (id: string) => ipcRenderer.invoke("transactions:delete", id),
    balance: () => ipcRenderer.invoke("transactions:balance"),
  },
  wishlist: {
    get: () => ipcRenderer.invoke("wishlist:get"),
    createItem: (data: unknown) => ipcRenderer.invoke("wishlist:createItem", data),
    updateItem: (id: string, data: unknown) =>
      ipcRenderer.invoke("wishlist:updateItem", id, data),
    deleteItem: (id: string) => ipcRenderer.invoke("wishlist:deleteItem", id),
    buyItem: (id: string, data: unknown) =>
      ipcRenderer.invoke("wishlist:buyItem", id, data),
    fetchPrices: (slugs: string[]) =>
      ipcRenderer.invoke("wishlist:fetchPrices", slugs),
    createSet: (data: unknown) => ipcRenderer.invoke("wishlist:createSet", data),
    deleteSet: (id: string) => ipcRenderer.invoke("wishlist:deleteSet", id),
  },
});
