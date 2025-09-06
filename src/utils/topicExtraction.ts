export const extractTopics = (content: string): string[] => {
  if (!content || typeof content !== 'string') return [];

  const topics: string[] = [];
  const words = content.toLowerCase().split(/\s+/);
  
  // Common topics and keywords
  const topicKeywords: { [key: string]: string[] } = {
    technology: ['tech', 'computer', 'phone', 'app', 'software', 'code', 'programming', 'ai', 'machine learning'],
    music: ['song', 'music', 'band', 'artist', 'concert', 'album', 'playlist', 'spotify'],
    travel: ['travel', 'vacation', 'trip', 'destination', 'hotel', 'flight', 'beach', 'mountains'],
    sports: ['sports', 'game', 'team', 'player', 'score', 'win', 'lose', 'basketball', 'football', 'soccer'],
    food: ['food', 'restaurant', 'cook', 'recipe', 'meal', 'dinner', 'lunch', 'breakfast', 'cuisine'],
    movies: ['movie', 'film', 'actor', 'director', 'cinema', 'netflix', 'watch', 'series'],
    books: ['book', 'read', 'author', 'novel', 'story', 'page', 'chapter'],
    health: ['health', 'exercise', 'gym', 'workout', 'diet', 'fitness', 'yoga', 'meditation'],
    work: ['work', 'job', 'career', 'office', 'meeting', 'project', 'deadline'],
    family: ['family', 'parent', 'child', 'sibling', 'relative', 'mom', 'dad']
  };

  // Check for topic keywords
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
      if (!topics.includes(topic)) {
        topics.push(topic);
      }
    }
  });

  // Extract potential named entities (simple version)
  const capitalizedWords = words.filter(word => word.length > 2 && word[0] === word[0].toUpperCase());
  topics.push(...capitalizedWords.slice(0, 2));

  return topics.slice(0, 3); // Return top 3 topics
};