/**
 * The instrument panel: headline numbers in one bordered strip, divided by
 * hairlines rather than split into separate floating cards. Reading across a
 * continuous row is what makes them comparable.
 *
 * These are stat tiles, not charts — the number is the visualization, so there
 * is no plot, no axis and no legend.
 *
 * metrics: [{ label, value, context, tone? }]
 *   tone: "default" | "positive" | "negative" — colors the context line only,
 *   never the value, so magnitude stays in ink and meaning sits beside it.
 */
const TONES = {
  default: "text-ink-subtle",
  positive: "text-success",
  negative: "text-danger",
};

const MetricStrip = ({ metrics = [], loading = false, columns }) => {
  const cols = columns ?? Math.min(metrics.length || 1, 4);

  return (
    <div
      className="grid bg-surface border border-line rounded-lg overflow-hidden"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={[
            "px-4 py-3.5 min-w-0",
            // Hairlines between cells, wrapping correctly at each row start.
            index % cols !== 0 ? "border-l border-line" : "",
            index >= cols ? "border-t border-line" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <p className="eyebrow truncate">{metric.label}</p>

          {loading ? (
            <div className="skeleton h-7 w-24 mt-1.5" />
          ) : (
            <p className="tnum mt-1 text-metric font-semibold text-ink tabular-nums truncate">
              {metric.value}
            </p>
          )}

          {metric.context &&
            (loading ? (
              <div className="skeleton h-3 w-20 mt-2" />
            ) : (
              <p
                className={`mt-1 text-caption truncate ${
                  TONES[metric.tone] ?? TONES.default
                }`}
              >
                {metric.context}
              </p>
            ))}
        </div>
      ))}
    </div>
  );
};

export default MetricStrip;
