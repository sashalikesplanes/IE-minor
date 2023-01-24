"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseMessage = exports.getLinkedMessagesDurationInMs = exports.setPaceForADuration = exports.getMessageDurationInMs = exports.linkEvents = void 0;
function linkEvents(events) {
    events.reduce((prev, curr) => {
        prev.next = curr;
        return curr;
    });
    return events[0];
}
exports.linkEvents = linkEvents;
function getMessageDurationInMs(message) {
    return (((Math.abs(message.end_idx - message.start_idx) +
        1 +
        message.message_width / 2) /
        message.pace) *
        1000);
}
exports.getMessageDurationInMs = getMessageDurationInMs;
function setPaceForADuration(message, duration) {
    return Object.assign(Object.assign({}, message), { pace: (Math.abs(message.end_idx - message.start_idx) +
            1 +
            message.message_width / 2) /
            (duration / 1000) });
}
exports.setPaceForADuration = setPaceForADuration;
function getLinkedMessagesDurationInMs(message) {
    let duration = 0;
    while (message) {
        duration += getMessageDurationInMs(message);
        message = message.next;
    }
    return duration;
}
exports.getLinkedMessagesDurationInMs = getLinkedMessagesDurationInMs;
function reverseMessage(message) {
    return Object.assign(Object.assign({}, message), { start_idx: message.end_idx, end_idx: message.start_idx, next: null });
}
exports.reverseMessage = reverseMessage;
