import { Audio } from "expo-av";
import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { BookmarkIcon, SpeakerWaveIcon } from "react-native-heroicons/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "react-native-heroicons/solid";
import { ProcessedWord } from "~/lib/api/wordService";
import { useWordStore } from "~/store/useWordStore";

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
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: word.audioUrl });
        setSound(newSound);
        await newSound.playAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
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
    <View className="bg-card rounded-lg p-6 shadow-lg">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-card-foreground">{word.word}</Text>
          {word.phonetic && <Text className="text-sm text-muted-foreground">{word.phonetic}</Text>}
        </View>
        <View className="flex-row space-x-4">
          {word.audioUrl && (
            <Pressable onPress={playSound} disabled={isPlaying} className="p-2">
              {isPlaying ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <SpeakerWaveIcon size={24} stroke="#3B82F6" />
              )}
            </Pressable>
          )}
          <Pressable onPress={handleBookmarkPress} className="p-2">
            {isBookmarked ? <BookmarkSolidIcon size={24} fill="#3B82F6" /> : <BookmarkIcon size={24} stroke="#666" />}
          </Pressable>
        </View>
      </View>

      {word.meanings?.map((meaning, index) => (
        <View key={index} className="mt-6">
          <Text className="text-sm font-medium text-primary mb-2">{meaning.partOfSpeech}</Text>
          <Text className="text-card-foreground">{meaning.definition}</Text>
          {meaning.example && <Text className="text-muted-foreground mt-2 italic">"{meaning.example}"</Text>}
          {meaning.synonyms?.length > 0 && (
            <Text className="text-muted-foreground mt-2">Synonyms: {meaning.synonyms.join(", ")}</Text>
          )}
          {meaning.antonyms?.length > 0 && (
            <Text className="text-muted-foreground mt-2">Antonyms: {meaning.antonyms.join(", ")}</Text>
          )}
        </View>
      ))}
    </View>
  );
}
