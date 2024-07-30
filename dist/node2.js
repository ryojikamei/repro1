import { InBasicClass } from "./core.js";
const node2 = new InBasicClass("127.0.0.1", 7022, "127.0.0.1", 7021);
await node2.startServer();
await node2.waitForConnectionIsOK();
console.log("node2 done");
