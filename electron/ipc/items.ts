import { ipcMain } from "electron";

/** Structure of shortened item data from warframe.market. */
type WarframeMarketItemShort = {
  slug: string;
  i18n: { en: { name: string } };
};

/** Structure of response from api.warframe.market/v2/items */
type WarframeMarketItemResponse = {
  data: WarframeMarketItemShort[];
};

export function registerItemsIpc() {
  // Returns items from warframe.market with an English name containing the given query string.
  ipcMain.handle("items:search", async (_event, query: string) => {
    const response = await fetch("https://api.warframe.market/v2/items");
    if (!response.ok) {
      throw new Error(`Warframe Market API returned ${response.status}`);
    }

    const data: WarframeMarketItemResponse = await response.json();
    return data.data
      .filter((item) =>
        item.i18n.en.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((item) => ({ slug: item.slug, name: item.i18n.en.name }));
  });
}
