'use client';

import { useEffect, useRef } from 'react';
import { OHLCCandle, MomentumPoint } from '@/types';

interface CandlestickChartProps {
  candles: OHLCCandle[];
  momentum: MomentumPoint[];
  teamColor?: string;
}

const WIN_COLOR   = '#4ade80';
const WIN_BORDER  = '#22c55e';
const LOSS_COLOR  = '#f87171';
const LOSS_BORDER = '#ef4444';
const GRID_COLOR  = '#1e2320';
const TEXT_COLOR  = '#5a6360';
const CROSS_COLOR = '#3a4240';

export default function CandlestickChart({ candles, momentum }: CandlestickChartProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    let cleanupTooltip: (() => void) | null = null;
    let ro: ResizeObserver | null = null;

    import('lightweight-charts').then((lc) => {
      if (!containerRef.current) return;

      const chart = lc.createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        layout: {
          backgroundColor: 'transparent',
          textColor: TEXT_COLOR,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: GRID_COLOR, style: 1 },
          horzLines: { color: GRID_COLOR, style: 1 },
        },
        crosshair: {
          mode: lc.CrosshairMode.Normal,
          vertLine: { color: CROSS_COLOR, width: 1, style: 2 },
          horzLine: { color: CROSS_COLOR, width: 1, style: 2 },
        },
        rightPriceScale: { borderColor: '#1e2320' },
        timeScale: {
          borderColor: '#1e2320',
          fixLeftEdge: true,
          fixRightEdge: true,
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale:  { mouseWheel: true, pinch: true },
      });

      chartRef.current = chart;

      const candleSeries = chart.addCandlestickSeries({
        upColor:         WIN_COLOR,
        downColor:       LOSS_COLOR,
        borderUpColor:   WIN_BORDER,
        borderDownColor: LOSS_BORDER,
        wickUpColor:     WIN_BORDER,
        wickDownColor:   LOSS_BORDER,
      });

      candleSeries.setData(
        candles.map((c) => ({
          time:  c.time as lc.Time,
          open:  c.open,
          high:  c.high,
          low:   c.low,
          close: c.close,
        }))
      );

      const lineSeries = chart.addLineSeries({
        color:            'rgba(96, 165, 250, 0.55)',
        lineWidth:        1,
        lineStyle:        lc.LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
        scaleMargins:     { top: 0.1, bottom: 0.1 },
      });

      const prices     = candles.flatMap((c) => [c.high, c.low]);
      const priceMin   = Math.min(...prices);
      const priceRange = Math.max(...prices) - priceMin;

      lineSeries.setData(
        momentum.map((m) => ({
          time:  m.date as lc.Time,
          value: priceMin + (m.value / 100) * priceRange,
        }))
      );

      chart.timeScale().fitContent();

      const toolTip = document.createElement('div');
      toolTip.style.cssText = `
        position:absolute; display:none; padding:8px 10px;
        background:#111413; border:1px solid #2d3330; border-radius:4px;
        font-family:'IBM Plex Mono',monospace; font-size:10px;
        color:#e8e4d9; pointer-events:none; z-index:10; white-space:nowrap;
      `;
      containerRef.current.appendChild(toolTip);

      chart.subscribeCrosshairMove((param) => {
        if (!param.point || !param.time) { toolTip.style.display = 'none'; return; }
        const idx = candles.findIndex((c) => c.time === param.time);
        if (idx === -1) { toolTip.style.display = 'none'; return; }
        const c   = candles[idx];
        const mom = momentum[idx];
        const col = c.win ? WIN_COLOR : LOSS_COLOR;
        const containerW = containerRef.current?.clientWidth ?? 400;
        toolTip.style.display = 'block';
        toolTip.style.left = Math.min(param.point.x + 16, containerW - 190) + 'px';
        toolTip.style.top  = Math.max(param.point.y - 80, 8) + 'px';
        toolTip.innerHTML = `
          <div style="color:${col};font-weight:600;margin-bottom:4px;">
            ${c.win ? '▲ WIN' : '▼ LOSS'} vs ${c.opponent}${c.homeGame ? '' : ' (Away)'}
          </div>
          <div style="color:#5a6360;font-size:9px;">${c.time}</div>
          <div style="margin-top:5px;display:grid;grid-template-columns:1fr 1fr;gap:3px 12px;font-size:9px;">
            <span style="color:#3a4240">PTS</span><span style="color:${col}">${c.close}</span>
            <span style="color:#3a4240">OPP</span><span>${c.open}</span>
            <span style="color:#3a4240">MGN</span><span style="color:${col}">${c.margin > 0 ? '+' : ''}${c.margin}</span>
            <span style="color:#3a4240">MOM</span><span style="color:#60a5fa">${mom?.value ?? '--'}</span>
          </div>
        `;
      });

      cleanupTooltip = () => { if (toolTip.parentNode) toolTip.remove(); };

      ro = new ResizeObserver(() => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.resize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight,
          );
        }
      });
      ro.observe(containerRef.current);
    });

    return () => {
      cleanupTooltip?.();
      ro?.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, momentum]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}