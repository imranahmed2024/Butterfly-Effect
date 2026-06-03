import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { historicalContext, divergence } = body;

    if (!historicalContext || !divergence) {
      return NextResponse.json(
        { error: 'Missing required fields: historicalContext and divergence' },
        { status: 400 }
      );
    }

    // Get OpenAPI endpoint from environment variables
    const openApiEndpoint = process.env.OPENAPI_ENDPOINT;
    const openApiKey = process.env.OPENAPI_KEY;
    const modelName = process.env.OPENAPI_MODEL || 'gpt-3.5-turbo';

    // If no endpoint is configured, return a demo response
    if (!openApiEndpoint) {
      console.warn('OPENAPI_ENDPOINT not configured. Returning demo response.');
      
      const demoResponse = generateDemoResponse(divergence);
      return new NextResponse(demoResponse, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Prepare the prompt for the AI
    const systemPrompt = `You are the Counterfactual Engine, a historical simulation AI. Your task is to create alternate history timelines based on divergence points provided by users.

RULES:
1. Start your timeline from the exact year of the divergence event
2. Output using Markdown headers for each significant year (e.g., ### 48 BC, ### 100 AD, ### 1776)
3. Focus on massive butterfly effects: technology, borders, famous figures, cultural shifts
4. Be specific and logical - each change should cascade naturally from the previous ones
5. Continue the timeline to modern day (2024)
6. Make it fascinating and educational

FORMAT:
Use ### Year headers followed by descriptive paragraphs about what changed in that era.`;

    const userPrompt = `Divergence Event: ${divergence}

Factual Historical Context:
${historicalContext}

Generate a detailed alternate history timeline starting from the divergence point and continuing to 2024. Show how this single change creates a butterfly effect that transforms the world.`;

    // Call the OpenAPI-compatible endpoint
    const response = await fetch(`${openApiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(openApiKey && { 'Authorization': `Bearer ${openApiKey}` }),
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        stream: false, // Simplified for now - can add streaming later
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAPI error:', errorData);
      throw new Error(`AI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const alternateHistory = data.choices?.[0]?.message?.content || 'Failed to generate alternate history.';

    return new NextResponse(alternateHistory, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate alternate history' },
      { status: 500 }
    );
  }
}

// Demo response generator for when no API is configured
function generateDemoResponse(divergence: string): string {
  const lowerQuery = divergence.toLowerCase();
  
  if (lowerQuery.includes('library') && lowerQuery.includes('alexandria')) {
    return `### 48 BC
The Roman guards under Julius Caesar's command successfully extinguish the fire before it reaches the Great Library. Scholars celebrate as countless scrolls are preserved.

### 100 AD
With the Library intact, Alexandria becomes the undisputed intellectual capital of the world. The steam engine described by Hero of Alexandria is refined and implemented across the Roman Empire, sparking an industrial revolution 1700 years early.

### 500 AD
The fall of Rome never happens. With advanced technology and preserved knowledge, the Roman Empire evolves into a constitutional federation. Latin becomes the global lingua franca, but Greek science dominates technology.

### 1000 AD
Steam-powered ships cross the Atlantic. Contact with the Americas establishes trade routes centuries before Columbus. Smallpox never devastates native populations due to earlier immunity development through controlled exposure.

### 1492
The "Discovery" is actually a diplomatic summit between the Roman Federation and the Aztec Empire. Technology exchange accelerates global development.

### 1776
No American Revolution occurs. The concept of nation-states is obsolete in a world dominated by the technologically advanced Roman Federation. Democracy exists at the city-state level.

### 1900
Humanity establishes its first lunar colony. Medical advances have extended average lifespan to 120 years. The printing press was invented in 200 AD, leading to universal literacy by 800 AD.

### 2024
Mars is terraformed and home to 50 million people. The internet was developed in the 1800s using mechanical computing. Climate change was solved in the 1800s with clean steam technology. War has been obsolete for centuries.`;
  }
  
  if (lowerQuery.includes('turing')) {
    return `### 1954
Alan Turing does not die. Instead, he continues his work at Manchester University, focusing on artificial intelligence and biological computing.

### 1960
Turing publishes "Computing Machinery and Intelligence II," introducing the concept of neural networks decades ahead of schedule. Early AI research receives massive funding.

### 1970
The first practical AI assistant is developed in Cambridge. Personal computers emerge 10 years early, with AI-powered interfaces from the start.

### 1980
The internet launches with built-in AI moderation and search capabilities. Misinformation is caught before it spreads. Social media develops differently, focused on collaboration rather than engagement.

### 1990
AI-driven climate modeling predicts global warming accurately. International action begins immediately. Fusion power is achieved in 1995.

### 2000
Cancer is effectively cured through AI-designed treatments. Turing, now 88, witnesses the singularity he predicted. He becomes the first human to upload his consciousness.

### 2024
AI governance manages global resources optimally. Poverty is eliminated. Space exploration is fully automated. Turing's digital consciousness serves as an advisor to world leaders. The "Turing Test" was passed in 1985.`;
  }

  // Generic fallback
  return `### Year of Divergence
The event unfolds differently. Instead of the historical outcome, your scenario plays out. Key figures make different decisions, and the ripple effects begin immediately.

### +10 Years
The initial changes compound. Technologies that were delayed are now accelerated. Political boundaries shift as power dynamics change. Cultural attitudes evolve along new paths.

### +50 Years
An entire generation grows up knowing only this altered reality. Innovations that took centuries in our timeline emerge within decades. The butterfly effect reshapes continents.

### +100 Years
The world is barely recognizable compared to original history. Languages, borders, technologies, and social structures have all evolved along radically different lines.

### +500 Years
Civilization has reached heights unimaginable in the original timeline. Perhaps humanity has spread to the stars, or maybe different challenges emerged. The possibilities are infinite.

### 2024
In this alternate present, you exist in a world shaped by that single changed moment. Every news headline, every technological marvel, every political reality traces back to your "what if" question.`;
}
