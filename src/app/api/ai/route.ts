import { NextResponse } from "next/server";
import axios, { type AxiosError } from "axios";

// Define request body type
interface GenerateRequestBody {
  prompt: string;
}

// Define API response types
interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

// Define proper Claude API response interface
interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  model: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Define error response interfaces
interface OpenAIErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

interface AnthropicErrorResponse {
  error?: {
    message?: string;
    type?: string;
  };
}

// Function to call OpenAI API
const fetchOpenAIResponse = async (
  prompt: string
): Promise<{ text: string | null; error?: string }> => {
  try {
    console.log("Calling OpenAI API...");
    const response = await axios.post<OpenAIResponse>(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("OpenAI API response status:", response.status);
    const result = response.data?.choices?.[0]?.message?.content ?? null;
    console.log(
      "OpenAI response result:",
      result ? "Content received" : "No content"
    );
    console.log("OpenAI API Response:", JSON.stringify(response.data, null, 2));
    return { text: result };
  } catch (error) {
    const errorDetails = handleAPIError<OpenAIErrorResponse>(error, "OpenAI");
    return { text: null, error: errorDetails };
  }
};

// Function to call Anthropic (Claude) API - updated to use Claude 3 API
const fetchClaudeResponse = async (
  prompt: string
): Promise<{ text: string | null; error?: string }> => {
  try {
    console.log("Calling Claude API...");
    const response = await axios.post<ClaudeResponse>(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Claude API response status:", response.status);
    console.log(
      "Claude API response data structure:",
      JSON.stringify(Object.keys(response.data))
    );

    // Improved debugging for Claude response content
    console.log("Claude content array:", JSON.stringify(response.data.content));

    // Access content as per the properly typed interface
    let result = null;

    // Check if content array exists and has items
    if (
      response.data?.content &&
      Array.isArray(response.data.content) &&
      response.data.content.length > 0
    ) {
      // Find the first text content block
      const textContent = response.data.content.find(
        (item) => item.type === "text"
      );

      if (textContent?.text) {
        result = textContent.text;
      } else {
        // Fallback: try to extract text directly if the find method didn't work
        const firstContent = response.data.content[0];
        if (firstContent?.text) {
          result = firstContent.text;
        }
      }
    }

    console.log(
      "Claude response result:",
      result ? "Content received" : "No content"
    );

    // If still no content, return a specific error
    if (!result) {
      return {
        text: null,
        error:
          "Failed to extract text from Claude response. Response structure: " +
          JSON.stringify(response.data),
      };
    }

    console.log("Claude API Response:", JSON.stringify(response.data, null, 2));
    return { text: result };
  } catch (error) {
    const errorDetails = handleAPIError<AnthropicErrorResponse>(
      error,
      "Claude"
    );
    return { text: null, error: errorDetails };
  }
};

// Function to handle API errors safely and return error details
// Now with proper generic typing for the error response
function handleAPIError<T>(error: unknown, service: string): string {
  let errorMessage = `${service} API error: Unknown error occurred`;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<T>;
    console.error(`${service} API error status:`, axiosError.response?.status);
    console.error(`${service} API error data:`, axiosError.response?.data);

    // Safely access error properties with optional chaining and type checking
    const errorData = axiosError.response?.data;
    let errorDetail = "Unknown error";

    if (errorData && typeof errorData === "object") {
      if ("error" in errorData) {
        const errorObj = errorData.error;
        if (errorObj && typeof errorObj === "object" && "message" in errorObj) {
          errorDetail = String(errorObj.message);
        } else if (errorObj && typeof errorObj === "string") {
          errorDetail = errorObj;
        }
      }
    }

    errorMessage = `${service} API error: ${
      axiosError.response?.status ?? "unknown status"
    } - ${errorDetail || axiosError.message || "Unknown error"}`;
  } else if (error instanceof Error) {
    console.error(`${service} API error:`, error.message);
    errorMessage = `${service} API error: ${error.message}`;
  }

  console.error(errorMessage);
  return errorMessage;
}

// App Router API POST handler
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const { prompt } = body;

    if (typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt type" },
        { status: 400 }
      );
    }

    console.log("Processing prompt:", prompt.substring(0, 50) + "...");

    // Execute API calls and collect results with error information
    const [openaiResult, claudeResult] = await Promise.all([
      fetchOpenAIResponse(prompt),
      fetchClaudeResponse(prompt),
    ]);

    // Include both responses and error information
    return NextResponse.json({
      openai: openaiResult.text,
      claude: claudeResult.text,
      debug: {
        openaiError: openaiResult.error,
        claudeError: claudeResult.error,
      },
    });
  } catch (error: unknown) {
    console.error(
      "Unexpected error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
