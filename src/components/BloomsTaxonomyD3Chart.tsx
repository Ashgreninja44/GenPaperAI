import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Question, BloomTaxonomyLevel } from '../types';
import { Brain, BarChart2, PieChart, Sparkles, Info } from 'lucide-react';

interface BloomsTaxonomyD3ChartProps {
  questions: Question[];
  totalMarks?: number;
  className?: string;
}

interface BloomDataPoint {
  level: BloomTaxonomyLevel;
  label: string;
  count: number;
  marks: number;
  percentage: number;
  marksPercentage: number;
  color: string;
  description: string;
  tier: 'LOTS' | 'HOTS'; // Lower-order vs Higher-order thinking skills
  questionIndices: number[];
}

const BLOOM_CONFIG: {
  level: BloomTaxonomyLevel;
  label: string;
  color: string;
  description: string;
  tier: 'LOTS' | 'HOTS';
}[] = [
  {
    level: 'Remember',
    label: 'Remembering',
    color: '#059669', // Emerald
    description: 'Recall facts, terms & basic concepts',
    tier: 'LOTS'
  },
  {
    level: 'Understand',
    label: 'Understanding',
    color: '#2563eb', // Royal Blue
    description: 'Explain ideas, summarize & classify',
    tier: 'LOTS'
  },
  {
    level: 'Apply',
    label: 'Applying',
    color: '#7c3aed', // Purple
    description: 'Use knowledge in concrete scenarios',
    tier: 'HOTS'
  },
  {
    level: 'Analyze',
    label: 'Analyzing',
    color: '#d97706', // Amber / Orange
    description: 'Distinguish, connect & examine logic',
    tier: 'HOTS'
  },
  {
    level: 'Evaluate',
    label: 'Evaluating',
    color: '#ea580c', // Orange-Red
    description: 'Justify a stance, critique & verify',
    tier: 'HOTS'
  },
  {
    level: 'Create',
    label: 'Creating',
    color: '#e11d48', // Rose / Crimson
    description: 'Formulate, design & produce novel solutions',
    tier: 'HOTS'
  }
];

export const normalizeBloomLevel = (q: Question): BloomTaxonomyLevel => {
  if (q.bloom_level && ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].includes(q.bloom_level)) {
    return q.bloom_level;
  }
  const text = (q.question_text || '').toLowerCase();
  if (/\b(design|create|formulate|construct|compose|propose|devise)\b/.test(text)) return 'Create';
  if (/\b(evaluate|justify|critique|judge|assess|argue|rate|validate)\b/.test(text)) return 'Evaluate';
  if (/\b(analyze|examine|compare|contrast|distinguish|differentiate|infer|deconstruct)\b/.test(text)) return 'Analyze';
  if (/\b(apply|calculate|solve|demonstrate|show|illustrate|compute|implement)\b/.test(text)) return 'Apply';
  if (/\b(explain|describe|summarize|interpret|discuss|classify|translate)\b/.test(text)) return 'Understand';
  if (/\b(define|state|list|name|identify|what is|who|when|which)\b/.test(text)) return 'Remember';
  
  if (q.marks >= 5 || q.difficulty >= 5) return 'Create';
  if (q.marks === 4 || q.difficulty === 4) return 'Evaluate';
  if (q.marks === 3 || q.difficulty === 3) return 'Analyze';
  if (q.marks === 2 || q.difficulty === 2) return 'Apply';
  if (q.answer_type === 'Short') return 'Understand';
  return 'Remember';
};

export const BloomsTaxonomyD3Chart: React.FC<BloomsTaxonomyD3ChartProps> = ({
  questions,
  totalMarks = 0,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartMode, setChartMode] = useState<'bar' | 'donut'>('bar');
  const [hoveredLevel, setHoveredLevel] = useState<BloomDataPoint | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<BloomDataPoint | null>(null);

  // Compute distribution
  const data = useMemo<BloomDataPoint[]>(() => {
    const totalQ = Math.max(questions.length, 1);
    const calculatedTotalMarks = totalMarks > 0 
      ? totalMarks 
      : questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const counts: Record<BloomTaxonomyLevel, { count: number; marks: number; indices: number[] }> = {
      Remember: { count: 0, marks: 0, indices: [] },
      Understand: { count: 0, marks: 0, indices: [] },
      Apply: { count: 0, marks: 0, indices: [] },
      Analyze: { count: 0, marks: 0, indices: [] },
      Evaluate: { count: 0, marks: 0, indices: [] },
      Create: { count: 0, marks: 0, indices: [] }
    };

    questions.forEach((q, idx) => {
      const level = normalizeBloomLevel(q);
      counts[level].count += 1;
      counts[level].marks += q.marks || 1;
      counts[level].indices.push(idx + 1);
    });

    return BLOOM_CONFIG.map(cfg => {
      const stat = counts[cfg.level];
      return {
        level: cfg.level,
        label: cfg.label,
        count: stat.count,
        marks: stat.marks,
        percentage: Math.round((stat.count / totalQ) * 100),
        marksPercentage: Math.round((stat.marks / Math.max(calculatedTotalMarks, 1)) * 100),
        color: cfg.color,
        description: cfg.description,
        tier: cfg.tier,
        questionIndices: stat.indices
      };
    });
  }, [questions, totalMarks]);

  // Overall LOTS vs HOTS calculations
  const cognitiveSummary = useMemo(() => {
    const lotsCount = data.filter(d => d.tier === 'LOTS').reduce((s, d) => s + d.count, 0);
    const hotsCount = data.filter(d => d.tier === 'HOTS').reduce((s, d) => s + d.count, 0);
    const total = Math.max(questions.length, 1);
    const lotsPct = Math.round((lotsCount / total) * 100);
    const hotsPct = Math.round((hotsCount / total) * 100);
    return { lotsCount, hotsCount, lotsPct, hotsPct };
  }, [data, questions.length]);

  // D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (chartMode === 'bar') {
      renderHorizontalBarChart(svg, data);
    } else {
      renderDonutChart(svg, data);
    }
  }, [data, chartMode]);

  // D3 Horizontal Bar Chart
  const renderHorizontalBarChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    dataPoints: BloomDataPoint[]
  ) => {
    const width = 560;
    const height = 230;
    const margin = { top: 12, right: 90, bottom: 25, left: 110 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxCount = d3.max(dataPoints, d => d.count) || 1;
    const xMax = Math.max(maxCount + 1, 4);

    const yScale = d3
      .scaleBand<string>()
      .domain(dataPoints.map(d => d.label))
      .range([0, innerHeight])
      .padding(0.24);

    const xScale = d3
      .scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      )
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis =>
        gAxis
          .selectAll('line')
          .attr('stroke', '#e2e8f0')
          .attr('stroke-dasharray', '2,2')
          .attr('opacity', 0.6)
      );

    // Y Axis (Labels)
    const yAxisG = g
      .append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .call(gAxis => gAxis.select('.domain').remove());

    yAxisG
      .selectAll('text')
      .attr('fill', '#334155')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('dx', '-8px');

    // X Axis (Bottom numbers)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(Math.min(xMax, 6))
          .tickFormat(d => `${d} Qs`)
      )
      .call(gAxis => gAxis.select('.domain').attr('stroke', '#cbd5e1'))
      .call(gAxis =>
        gAxis
          .selectAll('text')
          .attr('fill', '#64748b')
          .attr('font-size', '9.5px')
          .attr('font-weight', '600')
      );

    // Bars
    const barGroups = g
      .selectAll('.bar-group')
      .data(dataPoints)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(0, ${yScale(d.label) || 0})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredLevel(d);
        d3.select(event.currentTarget as SVGGElement)
          .select('rect')
          .transition()
          .duration(150)
          .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))')
          .attr('opacity', 1);
      })
      .on('mouseleave', (event) => {
        setHoveredLevel(null);
        d3.select(event.currentTarget as SVGGElement)
          .select('rect')
          .transition()
          .duration(150)
          .attr('filter', null)
          .attr('opacity', 0.9);
      })
      .on('click', (_, d) => {
        setSelectedLevel(prev => (prev?.level === d.level ? null : d));
      });

    // Bar Background Track
    barGroups
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#f1f5f9')
      .attr('rx', 4);

    // Animated Bar Value
    barGroups
      .append('rect')
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.color)
      .attr('rx', 4)
      .attr('opacity', 0.9)
      .transition()
      .duration(700)
      .delay((_, i) => i * 65)
      .ease(d3.easeCubicOut)
      .attr('width', d => Math.max(xScale(d.count), d.count > 0 ? 6 : 0));

    // Value Labels on Right
    barGroups
      .append('text')
      .attr('x', d => Math.max(xScale(d.count), 0) + 8)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '10.5px')
      .attr('font-weight', '700')
      .attr('fill', '#0f172a')
      .text(d => (d.count > 0 ? `${d.count} (${d.percentage}%)` : '0%'))
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 65 + 200)
      .attr('opacity', 1);
  };

  // D3 Donut Chart
  const renderDonutChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    dataPoints: BloomDataPoint[]
  ) => {
    const width = 560;
    const height = 230;
    const radius = Math.min(width / 2, height) / 2 - 12;
    const centerX = 160;
    const centerY = height / 2;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Filter out zero count for donut arcs, but keep if all are 0
    const nonZeroData = dataPoints.filter(d => d.count > 0);
    const displayData = nonZeroData.length > 0 ? nonZeroData : dataPoints;

    const pie = d3
      .pie<BloomDataPoint>()
      .value(d => (d.count > 0 ? d.count : 1))
      .sort(null)
      .padAngle(0.03);

    const arc = d3
      .arc<d3.PieArcDatum<BloomDataPoint>>()
      .innerRadius(radius * 0.58)
      .outerRadius(radius);

    const arcHover = d3
      .arc<d3.PieArcDatum<BloomDataPoint>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius * 1.08);

    const arcs = g
      .selectAll('.arc')
      .data(pie(displayData))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredLevel(d.data);
        d3.select(event.currentTarget as SVGGElement)
          .select('path')
          .transition()
          .duration(150)
          .attr('d', arcHover as any)
          .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))');
      })
      .on('mouseleave', (event) => {
        setHoveredLevel(null);
        d3.select(event.currentTarget as SVGGElement)
          .select('path')
          .transition()
          .duration(150)
          .attr('d', arc as any)
          .attr('filter', null);
      })
      .on('click', (_, d) => {
        setSelectedLevel(prev => (prev?.level === d.data.level ? null : d.data));
      });

    // Donut Slices with Entrance Animation
    arcs
      .append('path')
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.92)
      .transition()
      .duration(750)
      .attrTween('d', (d) => {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t)) || '';
      });

    // Center Summary Text in Donut Hole
    const centerG = g.append('g').attr('text-anchor', 'middle');
    centerG
      .append('text')
      .attr('dy', '-0.2em')
      .attr('font-size', '20px')
      .attr('font-weight', '900')
      .attr('fill', '#0f172a')
      .text(questions.length);

    centerG
      .append('text')
      .attr('dy', '1.2em')
      .attr('font-size', '9.5px')
      .attr('font-weight', '700')
      .attr('fill', '#64748b')
      .text('QUESTIONS');

    // Right-hand Legend in SVG
    const legendG = svg
      .append('g')
      .attr('transform', `translate(320, 25)`);

    displayData.forEach((d, idx) => {
      const row = legendG
        .append('g')
        .attr('transform', `translate(0, ${idx * 32})`)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredLevel(d))
        .on('mouseleave', () => setHoveredLevel(null))
        .on('click', () => setSelectedLevel(prev => (prev?.level === d.level ? null : d)));

      row
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 3)
        .attr('fill', d.color);

      row
        .append('text')
        .attr('x', 20)
        .attr('y', 10)
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', '#1e293b')
        .text(d.label);

      row
        .append('text')
        .attr('x', 140)
        .attr('y', 10)
        .attr('text-anchor', 'end')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', '#475569')
        .text(`${d.count} (${d.percentage}%)`);
    });
  };

  const activeInspect = selectedLevel || hoveredLevel;

  return (
    <div ref={containerRef} className={`bg-slate-50 dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs ${className}`}>
      
      {/* Header with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-[#3C128D] dark:text-purple-300">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              Bloom's Taxonomy Cognitive Distribution
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-[#3C128D] dark:bg-purple-900 dark:text-purple-200">
                D3 Visualizer
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cognitive rigor analysis mapped across standard educational taxonomy levels
            </p>
          </div>
        </div>

        {/* Bar vs Donut View Toggle */}
        <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setChartMode('bar')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              chartMode === 'bar'
                ? 'bg-[#3C128D] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Horizontal Bar View"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('donut')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              chartMode === 'donut'
                ? 'bg-[#3C128D] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Donut Distribution View"
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-auto max-h-[240px] select-none"
          style={{ minHeight: '210px' }}
        />

        {/* Hover / Active Callout Floating Overlay */}
        {activeInspect && (
          <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-xs max-w-xs animate-fade-in pointer-events-none">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-black flex items-center gap-1.5" style={{ color: activeInspect.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeInspect.color }} />
                {activeInspect.label}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {activeInspect.tier} Tier
              </span>
            </div>
            <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug mb-2">
              {activeInspect.description}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[10px]">
              <div>
                <span className="text-slate-400">Questions:</span>{' '}
                <strong className="text-slate-800 dark:text-slate-200">{activeInspect.count} ({activeInspect.percentage}%)</strong>
              </div>
              <div>
                <span className="text-slate-400">Total Marks:</span>{' '}
                <strong className="text-slate-800 dark:text-slate-200">{activeInspect.marks}M ({activeInspect.marksPercentage}%)</strong>
              </div>
            </div>
            {activeInspect.questionIndices.length > 0 && (
              <div className="mt-1.5 text-[9.5px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Questions: </span>
                {activeInspect.questionIndices.slice(0, 8).map(n => `Q${n}`).join(', ')}
                {activeInspect.questionIndices.length > 8 ? ` +${activeInspect.questionIndices.length - 8} more` : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Educational Rigor Ratio Bar (LOTS vs HOTS) */}
      <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            LOTS (Remember & Understand): <span className="text-blue-600 dark:text-blue-400">{cognitiveSummary.lotsCount} Qs ({cognitiveSummary.lotsPct}%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            HOTS (Apply, Analyze, Evaluate, Create): <span className="text-purple-600 dark:text-purple-400">{cognitiveSummary.hotsCount} Qs ({cognitiveSummary.hotsPct}%)</span>
          </span>
        </div>

        {/* Stacked Ratio Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
            style={{ width: `${cognitiveSummary.lotsPct}%` }}
            title={`LOTS: ${cognitiveSummary.lotsPct}%`}
          />
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-500"
            style={{ width: `${cognitiveSummary.hotsPct}%` }}
            title={`HOTS: ${cognitiveSummary.hotsPct}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {cognitiveSummary.hotsPct >= 40 && cognitiveSummary.hotsPct <= 65
              ? 'Balanced Exam Standard: Optimal mix of foundational recall and critical thinking.'
              : cognitiveSummary.hotsPct > 65
              ? 'Challenging / Olympiad Profile: Heavy emphasis on higher-order evaluation and synthesis.'
              : 'Foundational Mastery Profile: Strong coverage of definitions and conceptual explanations.'}
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {cognitiveSummary.lotsPct}% / {cognitiveSummary.hotsPct}% Ratio
          </span>
        </div>
      </div>
    </div>
  );
};

export default BloomsTaxonomyD3Chart;
