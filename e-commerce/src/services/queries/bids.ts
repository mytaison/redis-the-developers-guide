import { client } from "$services/redis";
import { bidHistoryKey, itemsKey, itemsByPriceKey } from "$services/keys";
import { DateTime } from "luxon";
import { getItem } from "./items";

import type { CreateBidAttrs, Bid } from "$services/types";
import { attr } from "svelte/internal";

export const createBid = async (attrs: CreateBidAttrs) => {
  return client.executeIsolated(async (isolatedClient) => {
    await isolatedClient.watch(itemsKey(attrs.itemId));

    const item = await getItem(attrs.itemId);
    if (!item) {
      throw new Error("Item not found.");
    }
    if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
      throw new Error("Item is closed for bidding.");
    }
    if (item.price >= attrs.amount) {
      throw new Error("Bid is too low.");
    }

    const serialized = serializeHistory(
      attrs.amount,
      attrs.createdAt.toMillis()
    );
    isolatedClient
      .multi()
      .rPush(bidHistoryKey(attrs.itemId), serialized)
      .hSet(itemsKey(attrs.itemId), {
        bids: item.bids + 1,
        price: attrs.amount,
        highestBidUserId: attrs.userId,
      })
      .zAdd(itemsByPriceKey(), {
        value: attrs.itemId,
        score: attrs.amount,
      })
      .exec();
  });
};

export const getBidHistory = async (
  itemId: string,
  offset = 0,
  count = 10
): Promise<Bid[]> => {
  const startIdx = -1 * count - offset;
  const endIdx = -1 - offset;
  const range = await client.lRange(bidHistoryKey(itemId), startIdx, endIdx);
  return range.map((bid) => deserializeHistory(bid));
};

const serializeHistory = (amount: number, createdAt: number) => {
  return `${amount}:${createdAt}`;
};
const deserializeHistory = (stored: string) => {
  const [amount, createdAt] = stored.split(":");
  return {
    amount: parseFloat(amount),
    createdAt: DateTime.fromMillis(parseInt(createdAt)),
  };
};
