import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ActionItem } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, meetingTitle } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Invalid transcript provided' },
        { status: 400 }
      );
    }

    // Call OpenAI to extract action items
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts action items from meeting transcripts. 
          
Your task is to:
1. Identify all action items, tasks, or commitments mentioned
2. Extract who is responsible (the assignee)
3. Identify any deadlines or due dates mentioned
4. Return the results as a JSON array

Important rules:
- Only extract explicit action items (things people committed to do)
- If no assignee is mentioned, use "Unassigned"
- If no deadline is mentioned, set deadline to null
- Be concise but accurate
- Don't make assumptions about tasks that weren't explicitly mentioned

Return ONLY a valid JSON array with this structure:
[
  {
    "task": "Description of the action item",
    "assignee": "Name of person responsible",
    "deadline": "YYYY-MM-DD or null"
  }
]`,
        },
        {
          role: 'user',
          content: `Extract action items from this meeting transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let extractedItems;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      extractedItems = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    // Validate and format the action items
    const actionItems: ActionItem[] = extractedItems.map((item: any, index: number) => ({
      id: `action-${Date.now()}-${index}`,
      task: item.task || 'Untitled task',
      assignee: item.assignee || 'Unassigned',
      deadline: item.deadline || null,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      meetingTitle: meetingTitle || 'Untitled Meeting',
    }));

    return NextResponse.json({
      success: true,
      actionItems,
      count: actionItems.length,
    });

  } catch (error) {
    console.error('Error in extract-actions API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to extract action items',
        success: false 
      },
      { status: 500 }
    );
  }
}