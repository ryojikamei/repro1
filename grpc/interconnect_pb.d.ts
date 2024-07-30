// package: 
// file: interconnect.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class icGeneralPacket extends jspb.Message { 
    getId(): string;
    setId(value: string): icGeneralPacket;
    getMessage(): string;
    setMessage(value: string): icGeneralPacket;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): icGeneralPacket.AsObject;
    static toObject(includeInstance: boolean, msg: icGeneralPacket): icGeneralPacket.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: icGeneralPacket, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): icGeneralPacket;
    static deserializeBinaryFromReader(message: icGeneralPacket, reader: jspb.BinaryReader): icGeneralPacket;
}

export namespace icGeneralPacket {
    export type AsObject = {
        id: string,
        message: string,
    }
}
