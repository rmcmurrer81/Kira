import knowledge from './knowledge.json' with {type:'json'};
import {createWorker} from './worker.mjs';
export default createWorker(knowledge);
