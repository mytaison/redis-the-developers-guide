import type { RedisCommandArguments } from "@node-redis/client/dist/lib/commands";
import { createClient, defineScript } from "redis";

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
  },
});
client.on("connect", async () => {
  await client.addOneAndStore("books:count", 10);
  const result = await client.get("books:count");
  console.log("books:count", result);
});
client.on("error", (err) => console.error(err));
client.connect();

export { client };
