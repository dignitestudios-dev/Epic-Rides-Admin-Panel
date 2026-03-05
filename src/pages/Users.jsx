import { useState, useMemo } from "react";
import { DRIVERS, RIDERS } from "../config/constants";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
const starRating = (r) =>
  "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

const exportCSV = (data, filename) => {
  const keys = Object.keys(data[0]).filter(
    (k) =>
      ![
        "transactions",
        "rideHistory",
        "feedback",
        "documents",
        "vehicle",
      ].includes(k),
  );
  const rows = [
    keys.join(","),
    ...data.map((row) => keys.map((k) => `"${row[k] ?? ""}"`).join(",")),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#39A31D",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: size * 0.36,
      flexShrink: 0,
    }}
  >
    {initials(name)}
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = {
    active: { bg: "#dcfce7", color: "#166534", label: "Active" },
    deactivated: { bg: "#fee2e2", color: "#991b1b", label: "Deactivated" },
    expired: { bg: "#fef3c7", color: "#92400e", label: "Expired" },
    pending: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
    verified: { bg: "#dcfce7", color: "#166534", label: "Verified" },
  };
  const c = cfg[status?.toLowerCase()] || cfg.deactivated;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {c.label}
    </span>
  );
};

const DocBadge = ({ status }) => <StatusBadge status={status?.toLowerCase()} />;

const BackBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "none",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: "6px 14px",
      cursor: "pointer",
      color: "#475569",
      fontWeight: 500,
      fontSize: 13,
      marginBottom: 20,
    }}
  >
    ← Back to List
  </button>
);

const SectionCard = ({ title, children }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      padding: 20,
      marginBottom: 16,
    }}
  >
    {title && (
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "#1e293b",
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {title}
      </div>
    )}
    {children}
  </div>
);

const InfoGrid = ({ items }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
      gap: 12,
    }}
  >
    {items.map(({ label, value }) => (
      <div key={label}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#1e293b",
            fontWeight: 500,
            marginTop: 2,
          }}
        >
          {value ?? "—"}
        </div>
      </div>
    ))}
  </div>
);

const StatBox = ({ label, value, accent }) => (
  <div
    style={{
      background: accent + "12",
      border: `1px solid ${accent}30`,
      borderRadius: 10,
      padding: "14px 18px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 800, color: accent }}>{value}</div>
    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{label}</div>
  </div>
);

const TxTable = ({ rows }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
    <thead>
      <tr style={{ background: "#f8fafc" }}>
        {["Date", "Description", "Type", "Amount"].map((h) => (
          <th
            key={h}
            style={{
              padding: "8px 12px",
              textAlign: "left",
              fontWeight: 600,
              color: "#64748b",
              fontSize: 12,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td
            colSpan={4}
            style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}
          >
            No transactions found
          </td>
        </tr>
      ) : (
        rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "10px 12px", color: "#475569" }}>
              {fmtDate(r.date)}
            </td>
            <td
              style={{
                padding: "10px 12px",
                color: "#1e293b",
                fontWeight: 500,
              }}
            >
              {r.desc}
            </td>
            <td style={{ padding: "10px 12px" }}>
              <span
                style={{
                  color: r.type === "credit" ? "#16a34a" : "#dc2626",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {r.type.toUpperCase()}
              </span>
            </td>
            <td
              style={{
                padding: "10px 12px",
                fontWeight: 600,
                color: r.type === "credit" ? "#16a34a" : "#dc2626",
              }}
            >
              {r.type === "credit" ? "+" : "-"}${r.amount.toFixed(2)}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const RideTable = ({ rows }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
    <thead>
      <tr style={{ background: "#f8fafc" }}>
        {["Ride ID", "Date", "From", "To", "Fare", "Status"].map((h) => (
          <th
            key={h}
            style={{
              padding: "8px 12px",
              textAlign: "left",
              fontWeight: 600,
              color: "#64748b",
              fontSize: 12,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td
            colSpan={6}
            style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}
          >
            No rides found
          </td>
        </tr>
      ) : (
        rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td
              style={{
                padding: "10px 12px",
                color: "#6366f1",
                fontWeight: 600,
              }}
            >
              {r.id}
            </td>
            <td style={{ padding: "10px 12px", color: "#475569" }}>
              {fmtDate(r.date)}
            </td>
            <td style={{ padding: "10px 12px", color: "#1e293b" }}>{r.from}</td>
            <td style={{ padding: "10px 12px", color: "#1e293b" }}>{r.to}</td>
            <td
              style={{
                padding: "10px 12px",
                fontWeight: 600,
                color: "#1e293b",
              }}
            >
              ${r.fare.toFixed(2)}
            </td>
            <td style={{ padding: "10px 12px" }}>
              <StatusBadge status={r.status} />
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

// ─── Rider Detail View ────────────────────────────────────────────────────────
const RiderDetail = ({ rider, onBack }) => (
  <div>
    <BackBtn onClick={onBack} />
    <SectionCard>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Avatar name={rider.name} size={56} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
            {rider.name}
          </div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
            {rider.email} · {rider.phone}
          </div>
          <div style={{ marginTop: 6 }}>
            <StatusBadge status={rider.status} />
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 28, color: "#f59e0b" }}>
            {starRating(rider.rating)}
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Avg. Rating: <strong>{rider.rating}</strong>/5
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
        }}
      >
        <StatBox
          label="Rides Completed"
          value={rider.ridesCompleted}
          accent="#6366f1"
        />
        <StatBox
          label="Rides Cancelled"
          value={rider.ridesCancelled}
          accent="#ef4444"
        />
        <StatBox
          label="Wallet Balance"
          value={`$${rider.walletBalance.toFixed(2)}`}
          accent="#10b981"
        />
      </div>
    </SectionCard>

    <SectionCard title="Activity Logs">
      <InfoGrid
        items={[
          { label: "Account Created", value: fmtDate(rider.registeredAt) },
          { label: "Last Login", value: fmtDate(rider.lastLogin) },
          { label: "Last Ride Taken", value: fmtDate(rider.lastRide) },
        ]}
      />
    </SectionCard>

    <SectionCard title="Ride History">
      <RideTable rows={rider.rideHistory} />
    </SectionCard>

    <SectionCard title="Transaction History">
      <TxTable rows={rider.transactions} />
    </SectionCard>
  </div>
);

// ─── Driver Detail View ───────────────────────────────────────────────────────
const DriverDetail = ({ driver, onBack }) => {
  const adminCommission = (driver.totalWithdrawals * 0.03).toFixed(2);
  return (
    <div>
      <BackBtn onClick={onBack} />
      <SectionCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <Avatar name={driver.name} size={56} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
              {driver.name}
            </div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
              {driver.email} · {driver.phone}
            </div>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={driver.status} />
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 28, color: "#f59e0b" }}>
              {starRating(driver.rating)}
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Avg. Rating: <strong>{driver.rating}</strong>/5
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
          }}
        >
          <StatBox
            label="Rides Completed"
            value={driver.ridesCompleted}
            accent="#6366f1"
          />
          <StatBox
            label="Rides Cancelled"
            value={driver.ridesCancelled}
            accent="#ef4444"
          />
          <StatBox
            label="Wallet Balance"
            value={`$${driver.walletBalance.toFixed(2)}`}
            accent="#10b981"
          />
          <StatBox
            label="Admin Commission"
            value={`$${adminCommission}`}
            accent="#f59e0b"
          />
        </div>
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SectionCard title="Vehicle Details">
          <InfoGrid
            items={[
              { label: "Make", value: driver.vehicle.make },
              { label: "Model", value: driver.vehicle.model },
              { label: "Year", value: driver.vehicle.year },
              { label: "Plate", value: driver.vehicle.plate },
              { label: "Color", value: driver.vehicle.color },
            ]}
          />
        </SectionCard>

        <SectionCard title="Approved Documents">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(driver.documents).map(([doc, status]) => (
              <div
                key={doc}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: "#1e293b",
                    textTransform: "capitalize",
                  }}
                >
                  {doc}
                </span>
                <DocBadge status={status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Subscription Status">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <StatusBadge status={driver.subscriptionStatus} />
          <span style={{ fontSize: 14, color: "#475569" }}>
            {driver.subscriptionStatus === "active"
              ? `Expires on ${fmtDate(driver.subscriptionExpiry)}`
              : `Expired on ${fmtDate(driver.subscriptionExpiry)}`}
          </span>
        </div>
      </SectionCard>

      <SectionCard title="Revenue & Admin Commission">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
          }}
        >
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16 }}>
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Total Withdrawals
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#1e293b",
                marginTop: 4,
              }}
            >
              ${driver.totalWithdrawals.toFixed(2)}
            </div>
          </div>
          <div style={{ background: "#fef9ec", borderRadius: 10, padding: 16 }}>
            <div
              style={{
                fontSize: 12,
                color: "#92400e",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Commission Rate
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#d97706",
                marginTop: 4,
              }}
            >
              3%
            </div>
          </div>
          <div style={{ background: "#ecfdf5", borderRadius: 10, padding: 16 }}>
            <div
              style={{
                fontSize: 12,
                color: "#065f46",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Admin Earned
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#10b981",
                marginTop: 4,
              }}
            >
              ${adminCommission}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
          Commission is calculated at 3% of every driver withdrawal.
        </div>
      </SectionCard>

      <SectionCard title="Rider Feedback">
        {driver.feedback.length === 0 ? (
          <div style={{ color: "#94a3b8", fontSize: 13 }}>No feedback yet.</div>
        ) : (
          driver.feedback.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "12px 0",
                borderBottom:
                  i < driver.feedback.length - 1 ? "1px solid #f1f5f9" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}
                >
                  {f.rider}
                </span>
                <span style={{ color: "#f59e0b", fontSize: 14 }}>
                  {"★".repeat(f.rating)}
                  {"☆".repeat(5 - f.rating)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                {f.comment}
              </div>
            </div>
          ))
        )}
      </SectionCard>

      <SectionCard title="Activity Logs">
        <InfoGrid
          items={[
            { label: "Account Created", value: fmtDate(driver.registeredAt) },
            { label: "Last Login", value: fmtDate(driver.lastLogin) },
          ]}
        />
      </SectionCard>

      <SectionCard title="Ride History">
        <RideTable rows={driver.rideHistory} />
      </SectionCard>

      <SectionCard title="Transaction History">
        <TxTable rows={driver.transactions} />
      </SectionCard>
    </div>
  );
};

// ─── Listing Table ────────────────────────────────────────────────────────────
const UserTable = ({ data, onView, type }) => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filtered = useMemo(() => {
    let d = data;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q),
      );
    }
    if (startDate)
      d = d.filter((u) => new Date(u.registeredAt) >= new Date(startDate));
    if (endDate)
      d = d.filter((u) => new Date(u.registeredAt) <= new Date(endDate));
    return d;
  }, [data, search, startDate, endDate]);

  const inputStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 13,
    color: "#1e293b",
    outline: "none",
    background: "#fff",
  };

  return (
    <div>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          style={{ ...inputStyle, minWidth: 220, flex: 1 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button
            onClick={() => exportCSV(filtered, `${type}_export.csv`)}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
              color: "#475569",
            }}
          >
            ⬇ CSV
          </button>
          <button
            onClick={() => exportCSV(filtered, `${type}_export.xls`)}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
              color: "#475569",
            }}
          >
            ⬇ Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Name", "Email", "Phone", "Status", "Registered", "Action"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "#64748b",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}
                >
                  No {type} found
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={u.name} size={32} />
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {u.phone}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={u.status} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {fmtDate(u.registeredAt)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => onView(u)}
                      style={{
                        background: "#39A31D",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
        Showing {filtered.length} of {data.length} records
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("riders");
  const [selectedRider, setSelectedRider] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const showDetail =
    activeTab === "riders" ? !!selectedRider : !!selectedDriver;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: 24,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}
        >
          User Management
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
          Monitor and manage all riders and drivers on the platform
        </p>
      </div>

      {/* Tabs */}
      {!showDetail && (
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#e2e8f0",
            borderRadius: 10,
            padding: 4,
            marginBottom: 20,
            width: "fit-content",
          }}
        >
          {["riders", "drivers"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRider(null);
                setSelectedDriver(null);
              }}
              style={{
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                textTransform: "capitalize",
                transition: "all 0.2s",
                background: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#39A31D" : "#64748b",
                boxShadow:
                  activeTab === tab ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {tab} ({(tab === "riders" ? RIDERS : DRIVERS).length})
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === "riders" &&
        (selectedRider ? (
          <RiderDetail
            rider={selectedRider}
            onBack={() => setSelectedRider(null)}
          />
        ) : (
          <UserTable data={RIDERS} onView={setSelectedRider} type="riders" />
        ))}
      {activeTab === "drivers" &&
        (selectedDriver ? (
          <DriverDetail
            driver={selectedDriver}
            onBack={() => setSelectedDriver(null)}
          />
        ) : (
          <UserTable data={DRIVERS} onView={setSelectedDriver} type="drivers" />
        ))}
    </div>
  );
}
