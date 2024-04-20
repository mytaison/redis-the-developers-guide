import { itemsIndexKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

interface QueryOpts {
  page: number;
  perPage: number;
  sortBy: string;
  direction: string;
}

export const itemsByUser = async (userId: string, opts: QueryOpts) => {
  const query = `@ownerId:{${userId}}`;
  const sortCriteria = opts.sortBy &&
    opts.direction && {
      BY: opts.sortBy,
      DIRECTION: opts.direction,
    };
  const searchOptions = {
    ON: "HASH",
    SORTBY: sortCriteria,
    LIMIT: {
      from: opts.page * opts.perPage,
      size: opts.perPage,
    },
  } as any;
  const { total, documents } = await client.ft.search(
    itemsIndexKey(),
    query,
    searchOptions
  );
  console.log("key:", itemsIndexKey());
  console.log("query:", query);
  console.log("total:", total);
  console.log("documents:", documents);
  return {
    totalPages: Math.ceil(total / opts.perPage),
    items: documents.map(({ id, value }) => {
      return deserialize(id.replace("items#", ""), value as any);
    }),
  };
};
