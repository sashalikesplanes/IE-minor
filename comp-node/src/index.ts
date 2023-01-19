import { map, take } from "rxjs";
import { detection$Factory } from "./freenect";

const SAVE_RESULTS = true;

const detection$ = detection$Factory(SAVE_RESULTS);
detection$.subscribe(console.log);
// .pipe(map(detectionToNodeActivation), nodeActivationsToEvents)
// .subscribe(eventsToBehaviours);
