import {keywordMatcher} from "./keywordMatcher.js";
import {regexMatcher} from "./regexMatcher.js";
import {semanticMatcher} from "./semanticMatcher.js";
import {llmMatcher} from "./llmMatcher.js";

const pipeline=[keywordMatcher,regexMatcher,semanticMatcher,llmMatcher];

export function matchField(field:any){
  for(const matcher of pipeline){
    const result=matcher.match(field);
    if(result) return result;
  }
  return null;
}
