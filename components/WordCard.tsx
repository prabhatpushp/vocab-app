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
    <View className="bg-card rounded-lg p-6 border border-border shadow-sm dark:shadow-primary/5">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-card-foreground">{word.word}</Text>
          {word.phonetic && <Text className="text-sm text-muted-foreground mt-1">{word.phonetic}</Text>}
        </View>
        <View className="flex-row space-x-4">
          {word.audioUrl && (
            <Pressable 
              onPress={playSound} 
              disabled={isPlaying} 
              className="p-2 rounded-full hover:bg-muted active:bg-muted/80"
            >
              {isPlaying ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <SpeakerWaveIcon size={24} stroke="#3B82F6" />
              )}
            </Pressable>
          )}
          <Pressable 
            onPress={handleBookmarkPress} 
            className="p-2 rounded-full hover:bg-muted active:bg-muted/80"
          >
            {isBookmarked ? <BookmarkSolidIcon size={24} fill="#3B82F6" /> : <BookmarkIcon size={24} stroke="#666" />}
          </Pressable>
        </View>
      </View>

      <View className="h-px bg-border my-4" />

      {word.meanings?.map((meaning, index) => (
        <View key={index} className="mt-4 first:mt-0">
          <Text className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
            {meaning.partOfSpeech}
          </Text>
          <Text className="text-card-foreground text-base leading-relaxed">
            {meaning.definition}
          </Text>
          {meaning.example && (
            <Text className="text-muted-foreground mt-3 italic text-sm leading-relaxed">
              "{meaning.example}"
            </Text>
          )}
          {meaning.synonyms?.length > 0 && (
            <Text className="text-muted-foreground mt-3 text-sm">
              <Text className="font-medium">Synonyms:</Text> {meaning.synonyms.join(", ")}
            </Text>
          )}
          {meaning.antonyms?.length > 0 && (
            <Text className="text-muted-foreground mt-2 text-sm">
              <Text className="font-medium">Antonyms:</Text> {meaning.antonyms.join(", ")}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
