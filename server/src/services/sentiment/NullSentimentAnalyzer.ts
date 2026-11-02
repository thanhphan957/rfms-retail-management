import { Sentiment } from "../../types";
import { ISentimentAnalyzer } from "./types";

export class NullSentimentAnalyzer implements ISentimentAnalyzer {
  async analyze(_text: string): Promise<Sentiment | null> {
    return null;
  }
}
