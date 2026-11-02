import { Sentiment } from "../../types";

export interface ISentimentAnalyzer {
  analyze(text: string): Promise<Sentiment | null>;
}
