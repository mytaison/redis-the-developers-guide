import "dotenv/config";
import { client } from "../src/services/redis";

const run = async () => {
  await client.hSet("car#1", {
    company: "Toyota",
    model: "Corolla X",
    color: "Red",
    price: 3500,
    // engine: {
    //   cylinders: 8,
    // },
    // HSET issue, it will cause error, null.toString() will fail
    // owner: null || "",
    // service: undefined || "",
  });
  await client.hSet("car#2", {
    company: "Honda",
    model: "Civic",
    color: "Black",
    price: 3500,
  });
  await client.hSet("car#3", {
    company: "Nissan",
    model: "Sunny",
    color: "Silver",
    price: 3000,
  });

  //   const car = await client.hGetAll("car#1");
  //   console.log(car);
  //   const delCar = await client.del("car#1");
  //   console.log(delCar);

  const results = await Promise.all([
    client.hGetAll("car#1"),
    client.hGetAll("car#2"),
    client.hGetAll("car#3"),
  ]);
  console.log("Results: ", results);

  await client.del("car#1");
  await client.del("car#2");
  await client.del("car#3");

  // HGET issue, for invalid resources it will return empty object instead of null / undefined
  console.log(await client.hGetAll("car#234"));

  // Pipelining
};
run();
