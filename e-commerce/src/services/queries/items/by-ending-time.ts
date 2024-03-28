import { client } from "$services/redis";
import { itemsKey, itemsByEndingAtKey } from "$services/keys";
import { deserialize } from "./deserialize";

export const itemsByEndingTime = async (
  order: "DESC" | "ASC" = "DESC",
  offset = 0,
  count = 10
) => {
  // Find the item ids which are ending soon
  const ids = await client.zRange(itemsByEndingAtKey(), Date.now(), "+inf", {
    BY: "SCORE",
    LIMIT: {
      offset: offset,
      count: count,
    },
  });
  // Fetch the item details for each item id and deserialize them
  const items = await Promise.all(
    ids.map((id) => {
      return client.hGetAll(itemsKey(id));
    })
  );

  return items.map((item, index) => deserialize(ids[index], item));
};
