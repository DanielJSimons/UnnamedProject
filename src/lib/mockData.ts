export const futuristicEntities = [
  'QuantumLeap AI', 'Project Chimera', 'Neuro-Synth', 'Helion Prime',
  'Bio-Forge', 'Aether-Dynamics', 'Cryo-Statix', 'Zero-Point Energy',
  'Galactic Transit', 'Stellar-Mesh'
];

export const generateLineChartData = (queries: { entity: string, color: string }[], secondaryMetric: string) => {
  const data = [];
  const today = new Date();
  for (let i = 120 - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dataPoint: any = {
      date: date.toISOString().split('T')[0],
    };

    queries.forEach(q => {
      dataPoint[q.entity] = 10 + Math.random() * (150 / (Math.sqrt(i + 1)));
      if (secondaryMetric !== 'none') {
        dataPoint[`${q.entity}_${secondaryMetric}`] = Math.random();
      }
    });

    data.push(dataPoint);
  }
  return data;
};

export const generateTopEntitiesData = (count = 10) => {
  return futuristicEntities.slice(0, count).map((entity, index) => ({
    entity,
    count: 150 - (index * 10) + Math.round(Math.random() * 20),
  })).sort((a,b) => b.count - a.count);
};

export const generateSentimentDistributionData = (): { name: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative'; value: number }[] => {
  return [
    { name: 'Very Positive', value: 400 + Math.round(Math.random() * 50) },
    { name: 'Positive', value: 300 + Math.round(Math.random() * 50) },
    { name: 'Neutral', value: 500 + Math.round(Math.random() * 50) },
    { name: 'Negative', value: 200 + Math.round(Math.random() * 50) },
    { name: 'Very Negative', value: 100 + Math.round(Math.random() * 50) },
  ];
};

export const generateVadAnalysisData = () => {
  return [
    { name: 'Valence', value: Math.random() },
    { name: 'Arousal', value: Math.random() },
    { name: 'Dominance', value: Math.random() },
  ];
};

export const generateContextualSnippetsData = (count = 5, entity: string | null = null) => {
  const snippets = [];
  const targetEntity = entity || futuristicEntities[Math.floor(Math.random() * futuristicEntities.length)];
  for (let i = 0; i < count; i++) {
    snippets.push({
      sentence: `A breaking report on ${targetEntity} reveals significant new developments in hyperspace travel.`,
      sentiment: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'][Math.floor(Math.random() * 5)],
      start: Math.random() * 300,
      videoId: 'dQw4w9WgXcQ',
      videoTitle: `Futuristic News Report ${i + 1}`
    });
  }
  return snippets;
}; 