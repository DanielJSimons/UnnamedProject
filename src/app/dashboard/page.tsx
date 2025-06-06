"use client";

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import styles from './page.module.scss';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Brush, ReferenceArea } from 'recharts';
import { FaSyncAlt, FaPalette } from 'react-icons/fa';
import { generateLineChartData } from '@/lib/mockData';
import { SentimentDistributionPanel } from '@/components/Dashboard/SentimentDistributionPanel';
import { VadAnalysisPanel } from '@/components/Dashboard/VadAnalysisPanel';
import { ContextualSnippetsPanel } from '@/components/Dashboard/ContextualSnippetsPanel';
import { WordCloudPanel } from '@/components/Dashboard/WordCloudPanel';
import { NetworkGraphPanel } from '@/components/Dashboard/NetworkGraphPanel';
import { HeatmapPanel } from '@/components/Dashboard/HeatmapPanel';
import { SortablePanel, SortablePanelProps } from '@/components/Dashboard/SortablePanel';
import { EntityManagementModal } from '@/components/Dashboard/EntityManagementModal';
import { DateRangePicker } from '@/components/Inputs/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

type PanelType = {
  id: string;
  title: string;
  component: React.FC<any>;
  span: number;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedEntities, setSelectedEntities] = useState<string[]>(['QuantumLeapAI', 'Helion Prime']);
  const [secondaryMetric, setSecondaryMetric] = useState<string>('none');
  const [newEntity, setNewEntity] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const entityColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

  const [panels, setPanels] = useState<PanelType[]>([
    { id: 'sentiment', title: 'Sentiment Distribution', component: SentimentDistributionPanel, span: 1 },
    { id: 'vad', title: 'VAD Emotional Snapshot', component: VadAnalysisPanel, span: 1 },
    { id: 'wordcloud', title: 'Word Cloud Analysis', component: WordCloudPanel, span: 1 },
    { id: 'network', title: 'Entity Network', component: NetworkGraphPanel, span: 1 },
    { id: 'heatmap', title: 'Temporal Patterns', component: HeatmapPanel, span: 1 },
    { id: 'snippets', title: 'Contextual Snippets', component: ContextualSnippetsPanel, span: 1 },
  ]);

  const [data, setData] = useState(() => generateLineChartData(selectedEntities.map(e => ({ entity: e, color: '#8884d8' })), secondaryMetric));
  const [zoomState, setZoomState] = useState({
    refAreaLeft: '',
    refAreaRight: '',
    isZooming: false,
    dataWindow: { startIndex: 0, endIndex: data.length - 1 }
  });

  const fullData = useMemo(() => {
    const newData = generateLineChartData(selectedEntities.map(e => ({ entity: e, color: '#8884d8' })), secondaryMetric);
    setData(newData);
    return newData;
  }, [selectedEntities, secondaryMetric]);
  
  const visibleData = data.slice(zoomState.dataWindow.startIndex, zoomState.dataWindow.endIndex + 1);
  const isZoomed = data.length !== visibleData.length;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPanels((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddEntity = (entity: string) => {
    if (entity && !selectedEntities.includes(entity)) {
      setSelectedEntities(prev => [...prev, entity]);
    }
  };

  const handleRemoveEntity = (entityToRemove: string) => {
    setSelectedEntities(prev => prev.filter(e => e !== entityToRemove));
  };

  const handleZoomOut = () => {
    setZoomState(s => ({
      ...s,
      dataWindow: { startIndex: 0, endIndex: data.length - 1 }
    }));
  };

  const handleMouseUp = (e: any) => {
    if (!zoomState.isZooming) return;

    let { refAreaLeft, refAreaRight } = zoomState;

    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setZoomState(s => ({
        ...s,
        refAreaLeft: '',
        refAreaRight: '',
        isZooming: false
      }));
      return;
    }

    // Ensure left is less than right
    if (refAreaLeft > refAreaRight) {
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
    }

    // Find indices
    const startIndex = data.findIndex(item => item.date === refAreaLeft);
    const endIndex = data.findIndex(item => item.date === refAreaRight);

    setZoomState(s => ({
      ...s,
      refAreaLeft: '',
      refAreaRight: '',
      isZooming: false,
      dataWindow: {
        startIndex: startIndex >= 0 ? startIndex : s.dataWindow.startIndex,
        endIndex: endIndex >= 0 ? endIndex : s.dataWindow.endIndex
      }
    }));
  };

  const getPanelComponent = (panel: PanelType) => {
    // For all other panels, pass the selected entities as queries
    const props = { 
      queries: selectedEntities.map(e => ({ entity: e })),
      dateRange: dateRange,
    };
    return <panel.component {...props} />;
  };

  const handlePanelResize = (panelId: string) => {
    setPanels(prevPanels =>
      prevPanels.map(p =>
        p.id === panelId ? { ...p, span: p.span === 1 ? 3 : 1 } : { ...p, span: 1 }
      )
    );
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>My Dashboard</h1>
        <div className={styles.headerControls}>
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <EntityManagementModal
            trackedEntities={selectedEntities}
            onAddEntity={handleAddEntity}
            onRemoveEntity={handleRemoveEntity}
          />
        </div>
      </header>

      <div className={styles.mainChartContainer}>
        {isZoomed && (
          <button onClick={handleZoomOut} className={styles.resetZoomButton}>
            <FaSyncAlt /> Reset Zoom
          </button>
        )}
        <div className={styles.chartControls}>
          <div className={styles.metricSelector}>
            <label htmlFor="secondary-metric">Secondary Axis:</label>
            <select id="secondary-metric" value={secondaryMetric} onChange={e => setSecondaryMetric(e.target.value)}>
              <option value="none">None</option>
              <option value="exp_sent">Expressive Sentiment</option>
              <option value="vad_v">Valence</option>
              <option value="vad_a">Arousal</option>
              <option value="vad_d">Dominance</option>
            </select>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={visibleData}
            onMouseDown={(e: any) => e && setZoomState(s => ({ ...s, refAreaLeft: e.activeLabel, isZooming: true }))}
            onMouseMove={(e: any) => zoomState.isZooming && e && setZoomState(s => ({ ...s, refAreaRight: e.activeLabel }))}
            onMouseUp={handleMouseUp}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={entityColors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={entityColors[0]} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={entityColors[1]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={entityColors[1]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333355" />
            <XAxis dataKey="date" stroke="#8c8ca1" />
            <YAxis yAxisId="left" stroke="#8c8ca1">
              <Label value="Mention Count" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#8c8ca1' }} />
            </YAxis>
            {secondaryMetric !== 'none' && (
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d">
                <Label value={secondaryMetric} angle={90} position="insideRight" style={{ textAnchor: 'middle', fill: '#82ca9d' }} />
              </YAxis>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                borderColor: 'rgba(107, 114, 128, 0.7)',
                borderRadius: '12px',
                color: '#F9FAFB',
              }}
            />
            <Legend />
            {selectedEntities.map((entity, index) => (
              <Line
                key={entity}
                yAxisId="left"
                type="monotone"
                dataKey={entity}
                stroke={entityColors[index % entityColors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
            {secondaryMetric !== 'none' && selectedEntities.map((entity, index) => (
              <Line
                key={`${entity}_secondary`}
                yAxisId="right"
                type="monotone"
                dataKey={`${entity}_${secondaryMetric}`}
                stroke={entityColors[index % entityColors.length]}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            ))}
            {zoomState.refAreaLeft && zoomState.refAreaRight ? (
              <ReferenceArea yAxisId="left" x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} strokeOpacity={0.3} />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
        <div className={styles.xAxisLabel}>Date</div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={panels.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className={styles.panelsGrid}>
            {panels.map((panel) => (
              <SortablePanel
                key={panel.id}
                id={panel.id}
                title={panel.title}
                isExpanded={panel.span > 1}
                onToggleExpand={() => handlePanelResize(panel.id)}
                style={{ gridColumn: `span ${panel.span}` }}
              >
                {getPanelComponent(panel)}
              </SortablePanel>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
