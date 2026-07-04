import type {Matcher} from "./types.js";
export const llmMatcher:Matcher={
 name:"llm",
 match(_field){
   // future OpenAI fallback for ambiguous fields
   return null;
 }
}
