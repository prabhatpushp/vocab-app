import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProcessedWord } from '~/lib/api/wordService';

interface WordStore {
  words: ProcessedWord[];
  currentIndex: number;
  bookmarkedWords: ProcessedWord[];
  isLoading: boolean;
  error: string | null;
  setWords: (words: ProcessedWord[]) => void;
  toggleBookmark: (word: ProcessedWord) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWordStore = create<WordStore>()(
  persist(
    (set) => ({
      words: [],
      currentIndex: 0,
      bookmarkedWords: [],
      isLoading: false,
      error: null,
      setWords: (newWords) => 
        set((state) => ({
          words: newWords,
          currentIndex: state.currentIndex >= newWords.length ? 0 : state.currentIndex,
        })),
      toggleBookmark: (word) =>
        set((state) => {
          const isBookmarked = state.bookmarkedWords.some((w) => w.id === word.id);
          if (isBookmarked) {
            return {
              bookmarkedWords: state.bookmarkedWords.filter((w) => w.id !== word.id),
            };
          }
          return {
            bookmarkedWords: [...state.bookmarkedWords, word],
          };
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'word-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Ensure words array is initialized
        if (!state?.words) {
          state.words = [];
        }
        if (!state?.bookmarkedWords) {
          state.bookmarkedWords = [];
        }
      },
    }
  )
);
