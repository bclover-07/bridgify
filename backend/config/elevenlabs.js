import axios from 'axios';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

function getHeaders() {
  return {
    'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
    'Content-Type': 'application/json',
  };
}

/**
 * Text-to-speech using ElevenLabs.
 * Returns audio buffer or null if API key is missing (graceful degradation).
 */
export async function textToSpeech(text, voiceId = null) {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured, returning null (text-only fallback)');
    return null;
  }

  const voice = voiceId || process.env.ELEVENLABS_VOICE_INTERVIEWER || 'pNInz6obpgDQGcFmaJgB';

  try {
    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voice}`,
      {
        text: text.substring(0, 5000),
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: getHeaders(),
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    return {
      audio: Buffer.from(response.data),
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('ElevenLabs TTS failed:', error.message);
    return null;
  }
}

/**
 * Generate speech for the interviewer character.
 */
export async function interviewerSpeak(text) {
  return textToSpeech(text, process.env.ELEVENLABS_VOICE_INTERVIEWER);
}

/**
 * Generate speech for the debate opponent character.
 */
export async function debateOpponentSpeak(text) {
  return textToSpeech(text, process.env.ELEVENLABS_VOICE_DEBATE_OPPONENT);
}

export default { textToSpeech, interviewerSpeak, debateOpponentSpeak };
