import axios from 'axios';

const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/word';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export interface WordDefinition {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
  sourceUrls?: string[];
  origin?: string;
}

export interface ProcessedWord {
  id: string;
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: Array<{
    partOfSpeech: string;
    definition: string;
    example?: string;
    synonyms: string[];
    antonyms: string[];
  }>;
  origin?: string;
}

export const getRandomWords = async (count: number = 10): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(`${RANDOM_WORD_API}?number=${count}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random words:', error);
    throw new Error('Failed to fetch random words');
  }
};

export const getWordDefinition = async (word: string): Promise<WordDefinition> => {
  try {
    const response = await axios.get<WordDefinition[]>(`${DICTIONARY_API}/${word}`);
    return response.data[0];
  } catch (error) {
    console.error('Error fetching word definition:', error);
    throw new Error('Failed to fetch word definition');
  }
};

const processWordDefinition = (word: string, definition: WordDefinition): ProcessedWord => {
  const audioUrl = definition.phonetics?.find(p => p.audio)?.audio;
  
  return {
    id: word,
    word: definition.word,
    phonetic: definition.phonetic || definition.phonetics?.[0]?.text,
    audioUrl,
    meanings: definition.meanings.map(meaning => ({
      partOfSpeech: meaning.partOfSpeech,
      definition: meaning.definitions[0].definition,
      example: meaning.definitions[0].example,
      synonyms: meaning.definitions[0].synonyms || [],
      antonyms: meaning.definitions[0].antonyms || [],
    })),
    origin: definition.origin,
  };
};

export const getRandomWordsWithDefinitions = async (count: number = 10): Promise<ProcessedWord[]> => {
  try {
    const words = await getRandomWords(count);
    const processedWords: ProcessedWord[] = [];

    for (const word of words) {
      try {
        const definition = await getWordDefinition(word);
        processedWords.push(processWordDefinition(word, definition));
      } catch (error) {
        console.log(`Skipping word "${word}" due to missing definition`);
        continue;
      }
    }

    if (processedWords.length === 0) {
      throw new Error('Could not find any words with definitions');
    }

    return processedWords;
  } catch (error) {
    console.error('Error in getRandomWordsWithDefinitions:', error);
    throw new Error('Failed to get words with definitions');
  }
};
