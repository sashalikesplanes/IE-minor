import { connect, OnMessageCallback } from "mqtt";
import { bindCallback, filter, map, tap } from "rxjs";
import { ImageChunk } from "./types";
const TOPIC_CAM_0 = "unitv2-cam0";
const TOPIC_CAM_1 = "unitv2-cam1";
const BROKER_URL = "127.0.0.1";

const client = connect(BROKER_URL);

client.on("connect", () => {
	client.subscribe(TOPIC_CAM_0);
	client.subscribe(TOPIC_CAM_1);
});

const message$ = bindCallback(client.on)("message")
export const imageMessage$ = message$.pipe(
	tap(v => console.log(v)),
	map(handleMessage),
)


function handleMessage(): OnMessageCallback {
	let imageChunks: ImageChunk[] = [];
	return async (topic, message) => {
		if (topic === TOPIC_CAM_0 || topic === TOPIC_CAM_1) {
			imageChunks.push(JSON.parse(message.toString()) as ImageChunk);
			if (imageChunks.length < imageChunks[0].total_chunks) {
				return;
			}

			const imageBinaryString = imageChunks.reduce((acc, chunk) => {
				if (chunk.frame_i !== imageChunks[0].frame_i) {
					throw new Error("Frame index mismatch");
				}
				return acc + chunk.chunk;
			}, "");

			const imageBuffer = Buffer.from(imageBinaryString, "base64");
			console.log('got image buffer');

			// Now we get the buffer onto the heap
			// buffer is free to have next image loaded
			// we transform the buffer to paint the detections on it
			// for now lets just save the image which results
			imageChunks = [];
		}
	};
}

export function messageStream() {

}

