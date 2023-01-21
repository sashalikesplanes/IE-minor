// Here we want to recieve a stream of detections
// apply them to our state machine
// and make the state machine output the requeired actions

import { createMachine } from "xstate";

export type DetectionEvent = {
  type: "detection";
  nodeIndex: number;
};

const mikeMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AtgS1mAdMmAHYTbFQDEASgKIDKA8gDIBqtA2gAwC6iK6WNgAu2dMX4gAHogCMAVnn4ATAE4AbAA4A7PIA0IAJ6JNylfIC+Fg2iy4CRUuSp0AUrQDCAFW58kIZEERMQl-GQQFJTUtXQNjCIAWAGZzKxsMHDxCEjIKSnoAQXoACQLfSUChUXFJcKTtfC5tVVV5dS55BJj9I0QAWm0zZVkk4fVZBPlNJJnZK2sQYnQIOAqM+wqg6tDQcL7ZLnxVZS4uZNVJpNllHvj99qP1UdlxyenZtID1rMdcqE2qiFaogEso4iZVPgXuoYbC4eptJ9bJkCKg4OgADYAN0gAOCNTCiGUmiUmgRsh0txMsnwlgWyPs+DRACswABjYS4-yVfE7aREkn4MnaCmxXqJMx09J2LKwACGsAAFnK8dtgQhlNoGpomqctEl5Kp6lSEAMUl1nq8pjMrvMLEA */
  createMachine({
    schema: {
      context: {} as { recentDetections: DetectionEvent[] },
    },
    id: "mike",
    initial: "noone",
    states: {
      noone: {},
      single: {},
      multiple: {},
    },
  });
