import * as stockStore from "../src/db/stockStore.ts";

const url = Deno.env.get("DATABASE_URL")?.trim();
if (!url) {
  console.error("DATABASE_URL is not set");
  Deno.exit(1);
}

const list = await stockStore.listStocksPaged(1, 5);
console.log("list total:", list.total);
console.log(JSON.stringify(list.items, null, 2));

if (list.items[0]) {
  const one = await stockStore.getStockById(list.items[0].id);
  console.log("getById:", JSON.stringify(one, null, 2));
}

Deno.exit(0);
