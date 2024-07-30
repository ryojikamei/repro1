process.env.GRPC_VERBOSITY="DEBUG";
process.env.GRPC_TRACE="all";


import childProcess from "child_process";

const node1 = childProcess.spawn("node", ["dist/node1.js"], { detached: true, stdio: "inherit" });
console.log("== NODE1: PID: " + node1.pid + " is starting ==");

const node2 = childProcess.spawn("node", ["dist/node2.js"], { detached: true, stdio: "inherit" });
console.log("== NODE2: PID: " + node2.pid + " is starting ==");

function cleanup(signal: NodeJS.Signals) {
    try {
        if (node2.pid !== undefined) process.kill(node2.pid, signal);
    } catch (error) {
        // no problem
    }
    try {
        if (node1.pid !== undefined) process.kill(node1.pid, signal);
    } catch (error) {
        // no problem
    }
}

process.on("SIGINT", (signal) => {cleanup(signal)});
process.on("SIGTERM", (signal) => {cleanup(signal)});
process.on("SIGQUIT", (signal) => {cleanup(signal)});
