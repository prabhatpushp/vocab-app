import { Tabs } from 'expo-router';
import { BookmarkIcon, HomeIcon } from 'react-native-heroicons/outline';
import { ThemeToggle } from '~/components/ThemeToggle';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0EA5E9',
        headerRight: () => <ThemeToggle />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Words',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => (
            <BookmarkIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
