export const pageCacheKey = (id: string) => `pagecache#${id}`;
export const sessionsKey = (sessionId: string) => `sessions#${sessionId}`;

// Items
export const itemsKey = (itemId: string) => `items#${itemId}`;
export const itemsByViewsKey = () => `items:views`;
export const itemsByEndingAtKey = () => `items:endingAt`;
export const itemsViewsKey = (itemId: string) => `items:views#${itemId}`;
export const bidHistoryKey = (itemId: string) => `history#${itemId}`;
export const itemsByPriceKey = () => `items:price`;
export const itemsIndexKey = () => `idx:items`;

// Users
export const usersKey = (userId: string) => `users#${userId}`;
export const userLikesKey = (userId: string) => `user:likes#${userId}`;

// Username
export const usernamesUniqueKey = () => `usernames:unique`;
export const usernameKeys = () => `usernames`;
