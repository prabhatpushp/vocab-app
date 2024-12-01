import * as React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { WordCard } from "~/components/WordCard";
import { useWordStore } from "~/store/useWordStore";
import { BookmarkIcon } from "react-native-heroicons/outline";

export default function BookmarksScreen() {
  const { bookmarkedWords, toggleBookmark } = useWordStore();

  if (bookmarkedWords.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <BookmarkIcon size={48} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-semibold text-center mb-2">No Bookmarks Yet</Text>
        <Text className="text-muted-foreground text-center">Your bookmarked words will appear here</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        {bookmarkedWords.map((word) => (
          <WordCard key={word.id} word={word} isBookmarked={true} onBookmarkPress={() => toggleBookmark(word)} />
        ))}
      </ScrollView>
    </View>
  );
}
