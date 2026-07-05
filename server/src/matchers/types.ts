export interface MatchResult{
  profilePath:string;
  confidence:number;
  strategy:string;
  reason:string;
}

export interface Matcher{
  name:string;
  match(field:any):MatchResult|null;
}
