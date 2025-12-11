import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  CalendarRange,
  Download,
} from "lucide-react";

const ACCENT_INDIGO = "#6366F1";
const ACCENT_PURPLE = "#8B5CF6";
const GREEN = "#22C55E";
const YELLOW = "#F59E0B";
const RED = "#EF4444";
const SLATE = "#94A3B8";

const ranges = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "3m", label: "Last 3 months" },
  { key: "custom", label: "Custom" },
];

const categories = [
  "Work",
  "Personal",
  "Shopping",
  "Health",
  "Study",
  "Finance",
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const genMockData = (days) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const created = rand(3, 12);
    const completed = rand(2, 15);
    const overdue = Math.max(0, rand(0, 3) - rand(0, 2));
    const inProgress = Math.max(0, created - completed - overdue);
    const pending = Math.max(0, created - completed - inProgress - overdue);
    const prHigh = rand(1, Math.min(5, completed));
    const prMed = rand(1, Math.min(6, completed));
    const prLow = Math.max(0, completed - prHigh - prMed);
    const catCounts = Object.fromEntries(
      categories.map((c) => [c, rand(0, 6)])
    );
    data.push({
      date: date.toISOString().slice(0, 10),
      created,
      completed,
      overdue,
      inProgress,
      pending,
      priorities: { high: prHigh, medium: prMed, low: prLow },
      categories: catCounts,
    });
  }
  return data;
};

const formatDay = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short" });
};

const percent = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

export default function Analytics() {
  const [range, setRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(genMockData(90));
      setLoading(false);
    }, 800);
  }, []);

  const filtered = useMemo(() => {
    if (!data.length) return [];
    let from = new Date();
    let to = new Date();
    if (range === "7d") from.setDate(to.getDate() - 6);
    else if (range === "30d") from.setDate(to.getDate() - 29);
    else if (range === "3m") from.setMonth(to.getMonth() - 3);
    else if (range === "custom" && customFrom && customTo) {
      from = new Date(customFrom);
      to = new Date(customTo);
    } else if (range === "custom") {
      return [];
    }
    const fromISO = from.toISOString().slice(0, 10);
    const toISO = to.toISOString().slice(0, 10);
    return data.filter((d) => d.date >= fromISO && d.date <= toISO);
  }, [data, range, customFrom, customTo]);

  const last7 = useMemo(() => data.slice(-7), [data]);
  const prev7 = useMemo(() => data.slice(-14, -7), [data]);

  const totalCompleted = useMemo(
    () => filtered.reduce((s, d) => s + d.completed, 0),
    [filtered]
  );
  const totalCreated = useMemo(
    () => filtered.reduce((s, d) => s + d.created, 0),
    [filtered]
  );
  const completionRate = useMemo(
    () => percent(totalCompleted, totalCreated),
    [totalCompleted, totalCreated]
  );
  const inProgressCount = useMemo(
    () => filtered.reduce((s, d) => s + d.inProgress, 0),
    [filtered]
  );
  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = filtered.length - 1; i >= 0; i--) {
      if (filtered[i].completed > 0) streak++;
      else break;
    }
    return streak;
  }, [filtered]);

  const weekCompleted = last7.reduce((s, d) => s + d.completed, 0);
  const prevWeekCompleted = prev7.reduce((s, d) => s + d.completed, 0);
  const weekDeltaPct =
    prevWeekCompleted === 0
      ? 100
      : Math.round(
          ((weekCompleted - prevWeekCompleted) / prevWeekCompleted) * 100
        );
  const trendUp = weekCompleted >= prevWeekCompleted;

  const weeklyChart = useMemo(
    () =>
      last7.map((d) => ({
        day: formatDay(d.date),
        created: d.created,
        completed: d.completed,
      })),
    [last7]
  );

  const priorityData = useMemo(() => {
    const agg = { high: 0, medium: 0, low: 0 };
    filtered.forEach((d) => {
      agg.high += d.priorities.high;
      agg.medium += d.priorities.medium;
      agg.low += d.priorities.low;
    });
    const total = agg.high + agg.medium + agg.low || 1;
    return [
      {
        name: "High",
        value: agg.high,
        pct: percent(agg.high, total),
        color: RED,
      },
      {
        name: "Medium",
        value: agg.medium,
        pct: percent(agg.medium, total),
        color: YELLOW,
      },
      {
        name: "Low",
        value: agg.low,
        pct: percent(agg.low, total),
        color: GREEN,
      },
    ];
  }, [filtered]);

  const statusData = useMemo(() => {
    const agg = { Completed: 0, "In Progress": 0, Pending: 0, Overdue: 0 };
    filtered.forEach((d) => {
      agg.Completed += d.completed;
      agg["In Progress"] += d.inProgress;
      agg.Pending += d.pending;
      agg.Overdue += d.overdue;
    });
    return Object.entries(agg).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const last30 = useMemo(() => data.slice(-30), [data]);
  const heatMax = useMemo(
    () => Math.max(...last30.map((d) => d.completed), 1),
    [last30]
  );

  const categoryData = useMemo(() => {
    const agg = Object.fromEntries(categories.map((c) => [c, 0]));
    filtered.forEach((d) => {
      categories.forEach((c) => (agg[c] += d.categories[c] || 0));
    });
    return categories.map((c) => ({ name: c, value: agg[c] }));
  }, [filtered]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const rows = [
      [
        "Date",
        "Created",
        "Completed",
        "InProgress",
        "Pending",
        "Overdue",
        "High",
        "Medium",
        "Low",
      ],
      ...filtered.map((d) => [
        d.date,
        d.created,
        d.completed,
        d.inProgress,
        d.pending,
        d.overdue,
        d.priorities.high,
        d.priorities.medium,
        d.priorities.low,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "taskzen-analytics.csv";
    a.click();
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("TaskZen Analytics", 14, 20);
    doc.setFontSize(11);
    doc.text(
      `Range: ${ranges.find((r) => r.key === range)?.label || "Custom"}`,
      14,
      30
    );
    doc.text(`Total Completed: ${totalCompleted}`, 14, 40);
    doc.text(`Completion Rate: ${completionRate}%`, 14, 48);
    doc.text(`In Progress: ${inProgressCount}`, 14, 56);
    doc.text(`Streak: ${streakDays} days`, 14, 64);
    doc.save("taskzen-analytics.pdf");
  };

  const insight = trendUp
    ? `You're ${Math.abs(weekDeltaPct)}% more productive than last week! 🎉`
    : `Productivity down ${Math.abs(
        weekDeltaPct
      )}% vs last week — you've got this!`;

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ backgroundColor: "#1a1f2e" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-indigo-200">
            <CalendarRange size={16} />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-md bg-indigo-900/40 px-2 py-1 text-xs text-indigo-100"
            >
              {ranges.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
            {range === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-md bg-indigo-900/40 px-2 py-1 text-xs text-indigo-100"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-md bg-indigo-900/40 px-2 py-1 text-xs text-indigo-100"
                />
                <Button
                  type="button"
                  onClick={() => setRange("custom")}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportCSV}
              className="text-xs bg-indigo-500 hover:bg-indigo-400"
            >
              <Download size={16} className="mr-1" />
              Export CSV
            </Button>
            <Button
              onClick={exportPDF}
              className="text-xs bg-purple-600 hover:bg-purple-500"
            >
              <Download size={16} className="mr-1" />
              Export PDF
            </Button>
          </div>
        </div>

        {loading && (
          <div className="grid gap-3 md:grid-cols-4">
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
          </div>
        )}

        {!loading && (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-indigo-900/30 p-4 text-indigo-100 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span>Total Tasks Completed</span>
                  <span
                    className={`inline-flex items-center ${
                      trendUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {trendUp ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span className="ml-1">{Math.abs(weekDeltaPct)}%</span>
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {weekCompleted}
                </div>
              </div>
              <div className="rounded-xl bg-indigo-900/30 p-4 text-indigo-100 shadow-sm">
                <div className="text-xs">Tasks In Progress</div>
                <div className="mt-2 text-2xl font-semibold">
                  {inProgressCount}
                </div>
              </div>
              <div className="rounded-xl bg-indigo-900/30 p-4 text-indigo-100 shadow-sm">
                <div className="text-xs">Completion Rate</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1F2937"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                        fill="none"
                        stroke={ACCENT_INDIGO}
                        strokeWidth="3"
                        strokeDasharray={`${completionRate}, 100`}
                      />
                    </svg>
                  </div>
                  <div className="text-2xl font-semibold">
                    {completionRate}%
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-indigo-900/30 p-4 text-indigo-100 shadow-sm">
                <div className="text-xs">Current Streak</div>
                <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                  <Flame className="text-amber-400" />
                  <span>{streakDays} days</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl bg-gray-900/40 p-4 shadow-sm lg:col-span-2">
                <div className="mb-2 text-sm font-semibold text-indigo-100">
                  Weekly Productivity
                </div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart
                      data={weeklyChart}
                      margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="day" stroke="#c7d2fe" />
                      <YAxis stroke="#c7d2fe" />
                      <RTooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          color: "#e0e7ff",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke={GREEN}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive
                      />
                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke={ACCENT_INDIGO}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl bg-gray-900/40 p-4 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-indigo-100">
                  Priority Distribution
                </div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        isAnimationActive
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <RTooltip
                        formatter={(v, n, p) => [`${v} (${p.payload.pct}%)`, n]}
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          color: "#e0e7ff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl bg-gray-900/40 p-4 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-indigo-100">
                  Task Status Overview
                </div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart
                      data={statusData}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#c7d2fe" />
                      <YAxis type="category" dataKey="name" stroke="#c7d2fe" />
                      <RTooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          color: "#e0e7ff",
                        }}
                      />
                      <Bar dataKey="value">
                        {statusData.map((s, i) => (
                          <Cell
                            key={s.name}
                            fill={[GREEN, ACCENT_INDIGO, SLATE, RED][i]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl bg-gray-900/40 p-4 shadow-sm lg:col-span-2">
                <div className="mb-2 text-sm font-semibold text-indigo-100">
                  Monthly Productivity Heatmap
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {last30.map((d, idx) => {
                    const intensity = d.completed / heatMax;
                    const bg = `rgba(99,102,241,${0.2 + intensity * 0.8})`;
                    return (
                      <div
                        key={d.date}
                        title={`${new Date(d.date).toLocaleDateString()}: ${
                          d.completed
                        }`}
                        className="flex h-10 items-center justify-center rounded"
                        style={{ background: bg, color: "#e0e7ff" }}
                      >
                        {new Date(d.date).getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-gray-900/40 p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-indigo-100">
                Category Performance
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={categoryData}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#c7d2fe" />
                    <YAxis stroke="#c7d2fe" />
                    <RTooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        color: "#e0e7ff",
                      }}
                    />
                    <Bar dataKey="value" fill={ACCENT_PURPLE} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-indigo-900/30 p-4 text-indigo-100 shadow-sm">
              <div className="text-sm font-medium">Insights</div>
              <div className="mt-1 text-xs">{insight}</div>
              {streakDays >= 7 && (
                <div className="mt-1 text-xs">
                  You've maintained a {streakDays}-day streak!
                </div>
              )}
            </div>

            {!filtered.length && (
              <div className="mt-4 rounded-xl bg-gray-900/40 p-4 text-indigo-100 shadow-sm">
                <div className="text-sm font-semibold">No data</div>
                <div className="text-xs">
                  Try adjusting the date range or add more tasks.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
