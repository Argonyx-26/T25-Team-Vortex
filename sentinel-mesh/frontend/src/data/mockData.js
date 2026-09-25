// Re-export or fallback data from schemas/examples.json
import rawExamples from '../../../schemas/examples.json';

export const exampleEvents = rawExamples.example_events;
export const exampleIncident = rawExamples.example_incident;

export default rawExamples;
