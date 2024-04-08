import { client } from "$services/redis";
import { itemsKey, itemsByViewsKey, itemsViewsKey } from "$services/keys";

export const incrementView = async (itemId: string, userId: string) => {
  return client.incrementView(itemId, userId);
};
