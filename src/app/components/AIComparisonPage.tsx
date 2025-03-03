"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

type AIResponse = {
  openai: string | null;
  claude: string | null;
};

export default function AIComparisonPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponses, setAIResponses] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim()) {
      setPromptError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setPromptError("Prompt is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const responseData = (await response.json()) as AIResponse;
      setAIResponses(responseData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Model Comparison</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="prompt">Enter your prompt</label>
          <textarea
            id="prompt"
            rows={5}
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter your prompt here..."
          />
          {promptError && <p className="text-red">{promptError}</p>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Responses"}
        </button>
      </form>

      {error && (
        <div className="response-card">
          <p className="text-red">{error}</p>
        </div>
      )}

      {aiResponses && (
        <div className="response-container">
          <div className="response-card">
            <h2>OpenAI (GPT-4)</h2>
            <div>
              {aiResponses.openai ? (
                <p>{aiResponses.openai}</p>
              ) : (
                <p className="italic">No response from OpenAI</p>
              )}
            </div>
          </div>

          <div className="response-card">
            <h2>Claude</h2>
            <div>
              {aiResponses.claude ? (
                <p>{aiResponses.claude}</p>
              ) : (
                <p className="italic">No response from Claude</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
