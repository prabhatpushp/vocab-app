import { Audio } from 'expo-av';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { BookmarkIcon, PlayCircleIcon } from 'react-native-heroicons/outline';
import { BookmarkIcon as BookmarkSolidIcon } from 'react-native-heroicons/solid';
import { ProcessedWord } from '~/lib/api/wordService';
import { useWordStore } from '~/store/useWordStore';

interface WordCardProps {
  word: ProcessedWord;
}

export function WordCard({ word }: WordCardProps) {
  const [sound, setSound] = React.useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const bookmarkedWords = useWordStore((state) => state.bookmarkedWords);
  const toggleBookmark = useWordStore((state) => state.toggleBookmark);

  const isBookmarked = bookmarkedWords.some((w) => w.id === word.id);

  async function playSound() {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      if (!word.audioUrl) return;
      
      if (sound) {
        await sound.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: word.audioUrl }
        );
        setSound(newSound);
        await newSound.playAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    } finally {
      setIsPlaying(false);
    }
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleBookmarkPress = useCallback(() => {
    toggleBookmark(word);
  }, [toggleBookmark, word]);

  if (!word) return null;

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 }}>{word.word}</Text>
          {word.phonetic && (
            <Text style={{ fontSize: 14, color: '#666' }}>{word.phonetic}</Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {word.audioUrl && (
            <Pressable
              onPress={playSound}
              style={{ padding: 8 }}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <ActivityIndicator size="small" color="#0EA5E9" />
              ) : (
                <PlayCircleIcon size={24} color="#0EA5E9" />
              )}
            </Pressable>
          )}
          <Pressable
            onPress={handleBookmarkPress}
            style={{ padding: 8 }}
          >
            {isBookmarked ? (
              <BookmarkSolidIcon size={24} color="#0EA5E9" />
            ) : (
              <BookmarkIcon size={24} color="#0EA5E9" />
            )}
          </Pressable>
        </View>
      </View>

      {word.meanings?.map((meaning, index) => (
        <View key={index} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#0EA5E9', marginBottom: 8 }}>
            {meaning.partOfSpeech}
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#000' }}>
              {meaning.definition}
            </Text>
            {meaning.example && (
              <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                Example: "{meaning.example}"
              </Text>
            )}
          </View>
          {meaning.synonyms?.length > 0 && (
            <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Synonyms: {meaning.synonyms.join(', ')}
            </Text>
          )}
          {meaning.antonyms?.length > 0 && (
            <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Antonyms: {meaning.antonyms.join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
