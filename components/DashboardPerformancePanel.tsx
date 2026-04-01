"use client";

import { useMemo, useState } from "react";

type DashboardPerformancePanelProps = {
  userName: string;
};

type DimensionScore = {
  label: string;
  score: number;
};

type WeeklyScore = {
  day: string;
  score: number;
};

const dimensions: DimensionScore[] = [
  { label: "Clarity", score: 84 },
  { label: "Confidence", score: 88 },
  { label: "Structure", score: 79 },
  { label: "Specificity", score: 73 },
  { label: "Impact", score: 81 },
];

const weeklyScores: WeeklyScore[] = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 71 },
  { day: "Wed", score: 77 },
  { day: "Thu", score: 83 },
  { day: "Fri", score: 86 },
];

const RADAR_SIZE = 280;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RADIUS = 96;
const RADAR_START_ANGLE = -Math.PI / 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const angleForIndex = (index: number, total: number) =>
  RADAR_START_ANGLE + (index * Math.PI * 2) / total;

const polarToCartesian = (radius: number, angle: number) => ({
  x: RADAR_CENTER + radius * Math.cos(angle),
  y: RADAR_CENTER + radius * Math.sin(angle),
});

const toRadarPoint = (score: number, index: number, total: number) => {
  const radius = (clamp(score, 0, 100) / 100) * RADAR_RADIUS;
  return polarToCartesian(radius, angleForIndex(index, total));
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
};

const drawCanvasRadar = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  values: DimensionScore[]
) => {
  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  const total = values.length;

  ctx.save();
  ctx.translate(centerX, centerY);

  ctx.strokeStyle = "rgba(206, 197, 191, 0.18)";
  ctx.lineWidth = 1;

  rings.forEach((ring) => {
    const ringRadius = radius * ring;
    ctx.beginPath();

    for (let i = 0; i < total; i += 1) {
      const angle = RADAR_START_ANGLE + (i * Math.PI * 2) / total;
      const x = ringRadius * Math.cos(angle);
      const y = ringRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();
  });

  for (let i = 0; i < total; i += 1) {
    const angle = RADAR_START_ANGLE + (i * Math.PI * 2) / total;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  ctx.beginPath();
  values.forEach((item, index) => {
    const valueRadius = (item.score / 100) * radius;
    const angle = RADAR_START_ANGLE + (index * Math.PI * 2) / total;
    const x = valueRadius * Math.cos(angle);
    const y = valueRadius * Math.sin(angle);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();
  ctx.fillStyle = "rgba(78, 222, 163, 0.28)";
  ctx.strokeStyle = "rgba(78, 222, 163, 0.9)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  values.forEach((item, index) => {
    const valueRadius = (item.score / 100) * radius;
    const angle = RADAR_START_ANGLE + (index * Math.PI * 2) / total;
    const x = valueRadius * Math.cos(angle);
    const y = valueRadius * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#4edea3";
    ctx.fill();
  });

  ctx.restore();
};

export default function DashboardPerformancePanel({ userName }: DashboardPerformancePanelProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const overallScore = useMemo(() => {
    const total = dimensions.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / dimensions.length);
  }, []);

  const radarGridPolygons = useMemo(() => {
    const rings = [0.2, 0.4, 0.6, 0.8, 1];

    return rings.map((ring) => {
      const points = dimensions
        .map((_, index) => {
          const angle = angleForIndex(index, dimensions.length);
          const point = polarToCartesian(RADAR_RADIUS * ring, angle);
          return `${point.x},${point.y}`;
        })
        .join(" ");

      return points;
    });
  }, []);

  const radarPoints = useMemo(
    () =>
      dimensions
        .map((item, index) => {
          const point = toRadarPoint(item.score, index, dimensions.length);
          return `${point.x},${point.y}`;
        })
        .join(" "),
    []
  );

  const downloadScorecardPng = async () => {
    if (typeof window === "undefined") {
      return;
    }

    setIsDownloading(true);

    try {
      const width = 1200;
      const height = 760;
      const scale = 2;

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context unavailable");
      }

      ctx.scale(scale, scale);

      const background = ctx.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "#121212");
      background.addColorStop(1, "#181f1b");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      drawRoundedRect(ctx, 48, 40, width - 96, height - 80, 24);
      ctx.fillStyle = "rgba(32, 31, 31, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(64, 73, 69, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#4edea3";
      ctx.font = "700 18px Manrope, sans-serif";
      ctx.fillText("ClearCue Scorecard", 86, 96);

      ctx.fillStyle = "#e5e2e1";
      ctx.font = "800 42px Epilogue, sans-serif";
      ctx.fillText(`${userName} Performance Summary`, 86, 146);

      ctx.fillStyle = "#cec5bf";
      ctx.font = "500 18px Manrope, sans-serif";
      ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 86, 178);

      drawRoundedRect(ctx, 86, 218, 488, 264, 18);
      ctx.fillStyle = "rgba(28, 27, 27, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(64, 73, 69, 0.6)";
      ctx.stroke();

      ctx.fillStyle = "#8a938f";
      ctx.font = "700 14px Manrope, sans-serif";
      ctx.fillText("WEEKLY TREND", 112, 254);

      const chartLeft = 118;
      const chartBottom = 452;
      const chartHeight = 160;
      const barWidth = 64;
      const barGap = 20;

      weeklyScores.forEach((item, index) => {
        const x = chartLeft + index * (barWidth + barGap);
        const barHeight = (item.score / 100) * chartHeight;

        drawRoundedRect(ctx, x, chartBottom - barHeight, barWidth, barHeight, 10);
        const barGradient = ctx.createLinearGradient(x, chartBottom - barHeight, x, chartBottom);
        barGradient.addColorStop(0, "#4edea3");
        barGradient.addColorStop(1, "#0f5d41");
        ctx.fillStyle = barGradient;
        ctx.fill();

        ctx.fillStyle = "#e5e2e1";
        ctx.font = "700 14px Manrope, sans-serif";
        ctx.fillText(String(item.score), x + 18, chartBottom - barHeight - 8);

        ctx.fillStyle = "#8a938f";
        ctx.font = "600 13px Manrope, sans-serif";
        ctx.fillText(item.day, x + 18, chartBottom + 20);
      });

      drawRoundedRect(ctx, 610, 218, 502, 264, 18);
      ctx.fillStyle = "rgba(28, 27, 27, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(64, 73, 69, 0.6)";
      ctx.stroke();

      ctx.fillStyle = "#8a938f";
      ctx.font = "700 14px Manrope, sans-serif";
      ctx.fillText("5D PERFORMANCE GRAPH", 636, 254);

      drawCanvasRadar(ctx, 865, 354, 96, dimensions);

      drawRoundedRect(ctx, 86, 516, width - 172, 140, 18);
      ctx.fillStyle = "rgba(28, 27, 27, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(64, 73, 69, 0.6)";
      ctx.stroke();

      ctx.fillStyle = "#4edea3";
      ctx.font = "800 54px Epilogue, sans-serif";
      ctx.fillText(`${overallScore}/100`, 116, 600);

      ctx.fillStyle = "#e5e2e1";
      ctx.font = "700 24px Manrope, sans-serif";
      ctx.fillText("Overall Interview Readiness", 320, 575);

      ctx.fillStyle = "#cec5bf";
      ctx.font = "500 16px Manrope, sans-serif";
      ctx.fillText(
        "Balanced growth across confidence, clarity, structure, specificity, and measurable impact.",
        320,
        608
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((file) => resolve(file), "image/png");
      });

      if (!blob) {
        throw new Error("Failed to build PNG file");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clearcue-scorecard-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Unable to download scorecard PNG right now. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#4edea3]">Performance Analytics</p>
          <h2 className="mt-2 text-3xl font-bold">Bar Chart + 5D Graph Scorecard</h2>
          <p className="mt-2 text-sm text-[#cec5bf]">
            A weekly trend bar chart plus a 5-dimensional radar model for stronger performance representation.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadScorecardPng}
          disabled={isDownloading}
          className="auteur-gradient rounded-lg px-5 py-3 text-sm font-bold text-[#003824] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isDownloading ? "Preparing PNG..." : "Download Scorecard PNG"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-xl border border-[#404945]/30 bg-[#201f1f] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Weekly Bar Chart</p>
          <div className="mt-4 grid h-64 grid-cols-5 items-end gap-3">
            {weeklyScores.map((item) => (
              <div key={item.day} className="flex h-full flex-col items-center justify-end gap-2">
                <p className="text-xs font-semibold text-[#e5e2e1]">{item.score}</p>
                <div className="relative flex h-44 w-full items-end rounded-lg bg-[#131313] p-1.5">
                  <div
                    className="auteur-gradient w-full rounded-md"
                    style={{ height: `${Math.max(item.score, 8)}%` }}
                  />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a938f]">{item.day}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[#404945]/30 bg-[#201f1f] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">5D Graph (Radar)</p>

          <div className="mt-3 flex justify-center">
            <svg
              viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
              className="h-[280px] w-full max-w-[320px]"
              role="img"
              aria-label="Five-dimension performance radar graph"
            >
              {radarGridPolygons.map((points) => (
                <polygon
                  key={points}
                  points={points}
                  fill="none"
                  stroke="rgba(206,197,191,0.2)"
                  strokeWidth="1"
                />
              ))}

              {dimensions.map((item, index) => {
                const outer = polarToCartesian(RADAR_RADIUS, angleForIndex(index, dimensions.length));
                return (
                  <line
                    key={`${item.label}-axis`}
                    x1={RADAR_CENTER}
                    y1={RADAR_CENTER}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="rgba(206,197,191,0.2)"
                    strokeWidth="1"
                  />
                );
              })}

              <polygon
                points={radarPoints}
                fill="rgba(78,222,163,0.26)"
                stroke="rgba(78,222,163,0.92)"
                strokeWidth="2"
              />

              {dimensions.map((item, index) => {
                const point = toRadarPoint(item.score, index, dimensions.length);
                const labelPoint = polarToCartesian(
                  RADAR_RADIUS + 22,
                  angleForIndex(index, dimensions.length)
                );

                return (
                  <g key={item.label}>
                    <circle cx={point.x} cy={point.y} r="3.5" fill="#4edea3" />
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#cec5bf"
                      fontSize="11"
                      fontWeight="700"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#cec5bf]">
            {dimensions.map((item) => (
              <p key={item.label} className="rounded-md bg-[#131313] px-3 py-2">
                <span className="font-semibold text-[#e5e2e1]">{item.label}</span>: {item.score}
              </p>
            ))}
          </div>
        </article>
      </div>

      <article className="mt-4 rounded-xl border border-[#404945]/30 bg-gradient-to-br from-[#201f1f] to-[#1b1b1b] p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Scorecard Snapshot</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-extrabold text-[#4edea3]">{overallScore}/100</p>
            <p className="mt-1 text-sm text-[#cec5bf]">Overall interview readiness for {userName}.</p>
          </div>
          <p className="text-xs text-[#8a938f]">Best day this week: Fri ({weeklyScores[4]?.score})</p>
        </div>
      </article>
    </section>
  );
}
