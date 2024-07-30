import { setInterval } from "timers/promises"

import ic from "../grpc/interconnect_pb.js"
import ic_grpc from "../grpc/interconnect_grpc_pb.js"
import { handleBidiStreamingCall, ClientDuplexStream, Server, UntypedServiceImplementation, ServerDuplexStream, ServerCredentials, ChannelCredentials } from "@grpc/grpc-js"
import { randomUUID } from "crypto"

export class icServer implements ic_grpc.IinterconnectServer {
    constructor(
        public ccGeneralIc: handleBidiStreamingCall<ic.icGeneralPacket, ic.icGeneralPacket>
    ) {}
}

export type generalInConnections = {
    [nodename: string]: ClientDuplexStream<ic.icGeneralPacket, ic.icGeneralPacket>
}

export type clientInstance = {
    call: ClientDuplexStream<ic.icGeneralPacket, ic.icGeneralPacket>,
    newinstance: boolean
}

export type generalInResultsStateType = "yet" | "success" | "failure";
export type generalInResults = {
    [requestId: string]: {
        state: generalInResultsStateType,
        result: ic.icGeneralPacket | undefined
    }
}

export class InBasicClass {

    private port: number;
    private nodename: string;
    private counter_name: string;
    private server: Server;
    private generalConnections: generalInConnections;
    private generalResults: generalInResults;
    constructor(this_ip: string, this_port: number, that_ip: string, that_port: number) {
        this.port = this_port;
        this.nodename = this_ip + ":" + this_port.toString();
        this.counter_name = that_ip + ":" + that_port.toString();
        this.server = new Server();
        this.generalConnections = {};
        this.generalResults = {};
    }

    // SERVER
    public async startServer() {
        /* @ts-expect-error */
        this.server.addService(ic_grpc.interconnectService, this.generalServerServices());
        const creds: ServerCredentials = ServerCredentials.createInsecure();
        const port = "0.0.0.0:" + this.port;
        this.server.bindAsync(port, creds, () => { console.log(this.nodename + ": server starts"); });
    }
    private generalServerServices(): UntypedServiceImplementation {
        return { ccGeneralIc: this.generalServerResponse.bind(this) };
    }
    private generalServerResponse(call: ServerDuplexStream<ic.icGeneralPacket, ic.icGeneralPacket>) {
        call.on("data", (req: ic.icGeneralPacket) => {
            console.log(this.nodename + ": data arrived to server from " + this.counter_name + ".");
            console.log(this.nodename + ": create response.");
            const reqObj = req.toObject();
            if (reqObj.message !== "Ping") {
                console.log("Got invalid message!");
            } else {
                const response = new ic.icGeneralPacket();
                response.setId(reqObj.id);
                response.setMessage("Pong");
                console.log(this.nodename + ": response to " + this.counter_name + ".");
                call.write(response)
            }
        })
    }

    // CLIENT
    public async waitForConnectionIsOK(): Promise<void> {
        const packet = new ic.icGeneralPacket();
        packet.setMessage("Ping");
        let resolved: boolean = false;
        let count: number = 1
        while (resolved === false) {
            console.log(this.nodename + ": pingLoop" + count.toString() + " begin");
            this.setupChannel();
            const call = this.generalConnections[this.counter_name];
            packet.setId(randomUUID());
            call.write(packet, () => {
                console.log(this.nodename + ": ping")
                this.generalResults[packet.getId()] = {
                    state: "yet",
                    result: undefined
                }
            });
            call.on("error", () => {
                this.generalResults[packet.getId()] = {
                    state: "failure",
                    result: undefined
                }
            });
            console.log(this.nodename + ": pingLoop" + count.toString() + " wait");
            let timeout: number = 5;
            for await (const _ of setInterval(1000)) {
                if (this.generalResults[packet.getId()].state === "success") {
                    console.log(this.nodename + ": ping SUCCESS");
                    resolved = true;
                    break;
                } else if (this.generalResults[packet.getId()].state === "failure") {
                    console.log(this.nodename + ": ping FAILURE");
                    resolved = false;
                    break;
                }
                timeout--;
                if (timeout <= 0) {
                    console.log(this.nodename + ": ping TIMEOUT");
                    break;
                }
            }
            console.log(this.nodename + ": pingLoop" + count.toString() + " end");
            count++;
        }
    }
    private setupChannel(): void {
        if (this.generalConnections[this.counter_name] === undefined) {
            const creds: ChannelCredentials = ChannelCredentials.createInsecure();
            const newclient = new ic_grpc.interconnectClient(this.counter_name, creds);
            this.generalConnections[this.counter_name] = newclient.ccGeneralIc();
        }
        const call = this.generalConnections[this.counter_name];
        call.on("data", (req: ic.icGeneralPacket) => {
            console.log(this.nodename + ": data arrived to client from " + this.counter_name + ".")
            this.generalResults[req.getId()] = {
                state: "success",
                result: req
            }
        })
        this.generalConnections[this.counter_name] = call;
    }
}