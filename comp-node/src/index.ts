import { connect } from "mqtt";
import { ImageChunk } from "./types";

const TOPIC_CAM_0 = "unitv2-cam0";
const TOPIC_CAM_1 = "unitv2-cam1";

const client = connect("172.23.4.99");

client.on("connect", () => {
	client.subscribe(TOPIC_CAM_0);
});

let imageChunks: ImageChunk[] = [];
client.on("message", (topic, message) => {
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
		imageChunks = [];
	}
});
