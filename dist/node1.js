import { InBasicClass } from "./core.js";
const node1 = new InBasicClass("127.0.0.1", 7021, "127.0.0.1", 7022);
await node1.startServer();
await node1.waitForConnectionIsOK();
console.log("node1 done");
