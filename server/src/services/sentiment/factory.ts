import { env } from "../../config/env";
import { ISentimentAnalyzer } from "./types";
import { NullSentimentAnalyzer } from "./NullSentimentAnalyzer";

export function createSentimentAnalyzer(): ISentimentAnalyzer {
  if (!env.aiProvider) {
    return new NullSentimentAnalyzer();
  }
  return new NullSentimentAnalyzer();
}

export const sentimentAnalyzer = createSentimentAnalyzer();
