import { itemsIndexKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

export const searchItems = async (term: string, size: number = 5) => {
  const cleaned = term
    .replaceAll(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(" ")
    .map((word) => (word ? `%${word}%` : ""))
    .join(" ");

  // Look at cleaned and make sure it is valid
  if (cleaned === "") {
    return [];
  }

  // Use the client to do actual search
  const query = `(@name:(${cleaned}) => { $weight: 5.0 }) | (@description:(${cleaned}))`;
  const results = await client.ft.search(itemsIndexKey(), query, {
    LIMIT: { from: 0, size: size },
  });

  // Deserialize and return the search results
  console.log(results);
  return results.documents.map(({ id, value }) =>
    deserialize(id, value as any)
  );
};
