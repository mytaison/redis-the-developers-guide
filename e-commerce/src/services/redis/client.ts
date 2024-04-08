import type { RedisCommandArguments } from "@node-redis/client/dist/lib/commands";
import { createClient, defineScript } from "redis";
import { itemsKey, itemsViewsKey, itemsByViewsKey } from "$services/keys";

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PW,
  scripts: {
    addOneAndStore: defineScript({
      NUMBER_OF_KEYS: 1,
      SCRIPT: `
				local storeAtKey = KEYS[1]
				local addOneTo = ARGV[1]
				return redis.call( 'SET', storeAtKey, 1 + tonumber(addOneTo) )
			`,
      transformArguments: function (
        key: string,
        value: number
      ): RedisCommandArguments {
        return [key, value.toString()];
        // ['books:count', '5']
        // EVALSHA <SHAID> NUMBER_OF_KEYS key value
      },
      transformReply: function (reply: any) {
        return reply;
      },
    }),
    incrementView: defineScript({
      NUMBER_OF_KEYS: 3,
      SCRIPT: `
			local itemsViewsKey = KEYS[1]
			local itemsKey = KEYS[2]
			local itemsByViewsKey = KEYS[3]

			local itemId = ARGV[1]
			local userId = ARGV[2]

			local inserted = redis.call('PFADD', itemsViewsKey, userId)
			if inserted then 
				redis.call('HINCRBY', itemsKey, 'views', 1)
				redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)

			end
		`,
      transformArguments(itemId: string, userId: string) {
        return [
          itemsViewsKey(itemId),
          itemsKey(itemId),
          itemsByViewsKey(),
          itemId,
          userId,
        ];
      },
    }),
  },
});

client.on("error", (err) => console.error(err));
client.connect();

export { client };
