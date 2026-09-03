/**
 * Label/value pairs for a record's attributes. Values sit in the mono face
 * when they're data (ids, amounts, timestamps) and the sans face when they're
 * prose, which is what `mono` selects.
 *
 * items: [{ label, value, icon?, mono?, span? }]
 */
const DetailList = ({ items = [], columns = 1, className = "" }) => (
  <dl
    className={`grid gap-x-4 gap-y-3 ${className}`}
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {items
      .filter((item) => item && item.value != null && item.value !== "")
      .map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="min-w-0"
            style={item.span ? { gridColumn: `span ${item.span}` } : undefined}
          >
            <dt className="eyebrow flex items-center gap-1.5">
              {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
              {item.label}
            </dt>
            <dd
              className={`mt-1 text-sm text-ink break-words ${
                item.mono ? "tnum" : ""
              }`}
            >
              {item.value}
            </dd>
          </div>
        );
      })}
  </dl>
);

export default DetailList;
