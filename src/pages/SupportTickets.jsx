import { useState } from "react";
import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import { useNavigate } from "react-router-dom";
import { formatPhoneNumber } from "../utils/helpers";
import { ArrowRight } from "lucide-react";

const AVATAR_PALETTE = [
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
];

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarStyle = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const SupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([
    {
      id: "REP-001",
      submittedBy: {
        id: 101,
        type: "user",
        name: "John Doe",
        contact: "john@example.com",
      },
      reportedAgainst: {
        id: 501,
        type: "driver",
        name: "Driver Zack",
      },
      datetime: "2024-01-20T10:30:00Z",
      rideReference: "RIDE-88421",
      description:
        "Driver arrived late and vehicle was not clean. Please check.",
      attachments: [
        "/uploads/ride_screenshot_1.png",
        "/uploads/ride_screenshot_2.png",
      ],
      status: "open",
      priority: "medium",
      category: "Safety Concern",
      responses: [],
    },
    {
      id: "REP-002",
      submittedBy: {
        id: 203,
        type: "driver",
        name: "Driver Ahmed",
        contact: "+923112223344",
      },
      reportedAgainst: {
        id: 301,
        type: "rider",
        name: "Ausitin",
      },
      datetime: "2024-01-21T14:10:00Z",
      rideReference: null,
      description: "Rider was rude and refused to pay cash.",
      attachments: [],
      status: "in_progress",
      priority: "high",
      category: "Payment / Transaction Issue",
      responses: [
        {
          id: 1,
          author: "Admin",
          isAdmin: true,
          message: "We are reviewing this case.",
          createdAt: "2024-01-21T15:00:00Z",
        },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState("rider");

  const columns = [
    {
      key: "id",
      label: "Report ID",
      render: (value) => <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{value}</span>,
    },
    {
      key: "submittedBy",
      label: "Submitted By",
      render: (submittedBy) => {
        const initials = getInitials(submittedBy?.name);
        const avatarStyle = getAvatarStyle(submittedBy?.name);
        return (
          <div className="flex items-center gap-3 min-w-0" title={submittedBy?.name}>
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarStyle}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                {submittedBy?.name}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 font-normal truncate">
                {submittedBy?.type?.toUpperCase()} — {submittedBy?.contact ? (!submittedBy.contact.includes("@") ? formatPhoneNumber(submittedBy.contact) : submittedBy.contact) : "—"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "reportedAgainst",
      label: "Reported Against",
      render: (reportedAgainst) =>
        reportedAgainst ? (
          <div className="min-w-0">
            <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
              {reportedAgainst.name}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">
              {reportedAgainst.type?.toUpperCase()}
            </p>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">N/A</span>
        ),
    },
    {
      key: "rideReference",
      label: "Ride Ref",
      render: (value) => <span className="text-xs font-mono text-gray-600 dark:text-slate-400">{value || "—"}</span>,
    },
    {
      key: "datetime",
      label: "Submitted",
      render: (value) => (
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(value).toLocaleDateString()}</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <p className="truncate max-w-xs text-xs text-gray-700 dark:text-slate-300">{value}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const variant = value === "resolved" || value === "closed" ? "success" : value === "in_progress" ? "warning" : "info";
        return (
          <Badge variant={variant} dot className="capitalize">
            {value?.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (value) => (
        <Badge variant="default" className="text-xs">
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, ticket) => (
        <button
          onClick={() =>
            navigate(`/reports-detail/${ticket.id}`, { state: { ticket } })
          }
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
          title="View Details"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const riderCount = tickets.filter((t) => t.submittedBy.type === "user").length;
  const driverCount = tickets.filter((t) => t.submittedBy.type === "driver").length;

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "driver") {
      return t.submittedBy.type === "driver";
    }
    if (activeTab === "rider" || activeTab === "user") {
      return t.submittedBy.type === "user";
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Support Tickets &amp; Reports
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
              Support Ops
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Manage user support inquiries, grievance reports, and safety escalations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "rider", label: "Rider Reports", count: riderCount },
          { key: "driver", label: "Driver Reports", count: driverCount },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tickets Table */}
      <DataTable
        title="Reports Management"
        subtitle="Chronological list of customer and driver submitted reports"
        data={filteredTickets}
        columns={columns}
        searchable={false}
        filterable={false}
        exportable={true}
        addButton={false}
      />
    </div>
  );
};

export default SupportTickets;
