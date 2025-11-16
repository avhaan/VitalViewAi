import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error('ElevenLabs API key is missing from environment variables');
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    console.log('🎤 ElevenLabs TTS request:', {
      textLength: text.length,
      textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
    });

    // Clean text: remove emojis and special characters that break ElevenLabs
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous Symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Extended Symbols
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[*_~`#]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('🧹 Cleaned text:', {
      original: text.substring(0, 50),
      cleaned: cleanText.substring(0, 50),
      removedChars: text.length - cleanText.length
    });

    // Validate cleaned text
    if (!cleanText || cleanText.length < 3) {
      console.error('❌ Text too short after cleaning:', cleanText);
      return NextResponse.json(
        { error: 'Text contains only special characters or is too short' },
        { status: 400 }
      );
    }

    // Using Rachel voice (friendly, warm female voice - perfect for Dr. Chick)
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

    const requestBody = {
      text: cleanText,
      model_id: 'eleven_turbo_v2_5', // FREE TIER COMPATIBLE - fast and reliable
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true
      }
    };

    console.log('📤 Sending to ElevenLabs API:', {
      voiceId,
      model: requestBody.model_id,
      textLength: cleanText.length,
      text: cleanText
    });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      console.error('ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json(
        { 
          error: 'Failed to generate speech', 
          details: errorData,
          status: response.status 
        },
        { status: response.status }
      );
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    console.log('✅ Audio generated successfully:', {
      size: audioBuffer.byteLength,
      sizeKB: (audioBuffer.byteLength / 1024).toFixed(2) + 'KB'
    });

    // Validate audio buffer
    if (audioBuffer.byteLength === 0) {
      console.error('❌ Received empty audio buffer from ElevenLabs');
      return NextResponse.json(
        { error: 'Received empty audio from ElevenLabs' },
        { status: 500 }
      );
    }

    // Return the audio file
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error in elevenlabs-tts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
