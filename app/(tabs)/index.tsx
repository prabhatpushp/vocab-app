import * as React from "react";
import { View, ActivityIndicator, RefreshControl } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { WordCard } from "~/components/WordCard";
import { useWordStore } from "~/store/useWordStore";
import { getRandomWordsWithDefinitions } from "~/lib/api/wordService";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "react-native-heroicons/outline";

export default function WordsScreen() {
  const store = useWordStore();
  const { words, currentIndex, setWords, setLoading, setError, isLoading, error } = store;
  const [isFetchingNext, setIsFetchingNext] = React.useState(false);

  const currentWord = words?.[currentIndex];

  const fetchWords = React.useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        setError(null);
        const newWords = await getRandomWordsWithDefinitions(10);
        setWords(newWords);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch words");
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [setLoading, setError, setWords]
  );

  const fetchNextWords = React.useCallback(async () => {
    if (isFetchingNext) return;
    try {
      setIsFetchingNext(true);
      const newWords = await getRandomWordsWithDefinitions(10);
      setWords(newWords);
    } catch (err) {
      console.error("Failed to fetch next words:", err);
    } finally {
      setIsFetchingNext(false);
    }
  }, [setWords, isFetchingNext]);

  // Initial fetch
  React.useEffect(() => {
    if (!words?.length) {
      fetchWords(true);
    }
  }, [fetchWords, words]);

  // Prefetch next batch when near the end
  React.useEffect(() => {
    if (currentIndex >= (words?.length ?? 0) - 2 && !isLoading && !isFetchingNext) {
      fetchNextWords();
    }
  }, [currentIndex, words, isLoading, isFetchingNext, fetchNextWords]);

  const handlePrevious = React.useCallback(() => {
    if (!words?.length) return;
    useWordStore.setState((state) => ({
      currentIndex: state.currentIndex === 0 ? state.words.length - 1 : state.currentIndex - 1,
    }));
  }, [words]);

  const handleNext = React.useCallback(() => {
    if (!words?.length) return;
    useWordStore.setState((state) => ({
      currentIndex: (state.currentIndex + 1) % state.words.length,
    }));
  }, [words]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchWords(true)} />}
      >
        {error ? (
          <View className="items-center">
            <Text className="text-destructive mb-4">{error}</Text>
            <Button onPress={() => fetchWords(true)}>
              <Text>Try Again</Text>
            </Button>
          </View>
        ) : isLoading && !currentWord ? (
          <ActivityIndicator size="large" className="text-primary" />
        ) : currentWord ? (
          <>
            <WordCard word={currentWord} />

            <View className="flex-row justify-between items-center mt-6">
              <Button
                variant="outline"
                className="flex-1 mr-2 shadow shadow-foreground/5"
                onPress={handlePrevious}
                disabled={!currentWord}
              >
                <View className="flex-row items-center">
                  <ArrowLeftCircleIcon size={20} stroke="#3B82F6" />
                  <Text className="ml-2">Previous</Text>
                </View>
              </Button>

              <Button
                variant="outline"
                className="flex-1 ml-2 shadow shadow-foreground/5"
                onPress={handleNext}
                disabled={!currentWord}
              >
                <View className="flex-row items-center">
                  <Text className="mr-2">Next</Text>
                  <ArrowRightCircleIcon size={20} stroke="#3B82F6" />
                </View>
              </Button>
            </View>
          </>
        ) : null}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
