import type { CreateUserAttrs } from "$services/types";
import { genId } from "$services/utils";
import { client } from "$services/redis";
import { usersKey, usernamesUniqueKey, usernameKeys } from "$services/keys";

export const getUserByUsername = async (username: string) => {
  // First check username arg is member of usernames sorted set, if yes get id
  const id = await client.zScore(usernameKeys(), username);
  if (!id) {
    throw new Error("User doesn't exists");
  }
  // Convert id to Hexadecimal
  const hexId = id.toString(16);
  // GetAll data of the user from users hash
  const user = await client.hGetAll(usersKey(hexId));
  return deserialize(hexId, user);
};

export const getUserById = async (id: string) => {
  const user = await client.hGetAll(usersKey(id));
  return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
  const id = genId();
  // check if username is already exists, if exists throw error
  const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username);
  if (exists) {
    throw new Error("Username is taken.");
  }

  await client.hSet(usersKey(id), serialize(attrs));
  await client.sAdd(usernamesUniqueKey(), attrs.username);
  await client.zAdd(usernameKeys(), {
    value: attrs.username,
    score: parseInt(id, 16),
  });
  return id;
};

const serialize = (user: CreateUserAttrs) => {
  return {
    username: user.username,
    password: user.password,
  };
};

const deserialize = (id: string, user: { [key: string]: string }) => {
  return {
    id: id,
    username: user.username,
    password: user.password,
  };
};
