import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  Download,
  Search,
  UserCheck,
  Users as UsersIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Tabs from "../components/ui/Tabs";
import Avatar from "../components/ui/Avatar";
import Switch from "../components/ui/Switch";
import DataTable from "../components/common/DataTable";
import PageHeader from "../components/common/PageHeader";
import { PAGINATION_CONFIG } from "../config/constants";
import useGetUsers from "../hooks/users/useGetUsers";
import useUserActions from "../hooks/users/useUserActions";
import useDebounce from "../hooks/global/useDebounce";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/services";

const nf = new Intl.NumberFormat("en-US");

const EXPORT_FIELDS = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone number" },
  { key: "status", label: "Status" },
];

/* ── Export dialog ────────────────────────────────────────────────────── */
const ExportDialog = ({ isOpen, onClose, type }) => {
  const [fields, setFields] = useState(["firstName", "lastName", "email"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleField = (key) =>
    setFields((prev) =>
      prev.includes(key) ? prev.filter((field) => field !== key) : [...prev, key]
    );

  const handleExport = async () => {
    if (!fields.length) {
      toast.error("Pick at least one field to export.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.exportUsers(type, {
        startDate: startDate || null,
        endDate: endDate || null,
        fields,
      });

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}s_export_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Export downloaded");
      onClose();
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export ${type === "rider" ? "riders" : "drivers"}`}
      description="Downloads a CSV of every matching record, not just this page."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button icon={<Download />} onClick={handleExport} loading={loading}>
            Export CSV
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <fieldset>
          <legend className="eyebrow mb-2">Columns</legend>
          <div className="grid grid-cols-2 gap-1.5">
            {EXPORT_FIELDS.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 h-7 px-1.5 -mx-1.5 rounded cursor-pointer select-none hover:bg-surface-hover transition-colors"
              >
                <input
                  type="checkbox"
                  checked={fields.includes(key)}
                  onChange={() => toggleField(key)}
                  className="w-3.5 h-3.5 rounded-sm border-line-strong text-interactive focus:ring-2 focus:ring-interactive/25"
                />
                <span className="text-sm text-ink">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-2">Date range (optional)</legend>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              label="From"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <Input
              type="date"
              label="To"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </fieldset>
      </div>
    </Modal>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────── */
const Users = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = usePersistentState("users_activeTab", "rider");
  const [currentPage, setCurrentPage] = usePersistentState("users_currentPage", 1);
  const [pageSize, setPageSize] = usePersistentState(
    "users_pageSize",
    PAGINATION_CONFIG.defaultPageSize
  );
  const [search, setSearch] = usePersistentState("users_search", "");
  const [startDate, setStartDate] = usePersistentState("users_startDate", "");
  const [endDate, setEndDate] = usePersistentState("users_endDate", "");
  const [exportOpen, setExportOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const { users, loading, totalPages, totalData, refresh } = useGetUsers(
    activeTab,
    currentPage,
    pageSize,
    debouncedSearch,
    startDate,
    endDate
  );

  const { loading: loadingAction, updateStatus } = useUserActions();

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleStatusToggle = async (user) => {
    const nextStatus =
      user.status?.toLowerCase() === "active" ? "deactivated" : "active";
    const success = await updateStatus(user.id, activeTab, nextStatus);
    if (success) refresh();
  };

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  const hasFilters = Boolean(search || startDate || endDate);
  const isDriver = activeTab === "driver";

  const columns = [
    {
      key: "firstName",
      label: "Name",
      render: (_, row) => {
        const name =
          [row.firstName, row.lastName].filter(Boolean).join(" ") || "—";
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={name} src={row.profilePicture} size="md" />
            <span className="font-medium text-ink truncate">{name}</span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (value) => (
        <span className="text-ink-muted truncate">{value || "—"}</span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value) => (
        <span className="tnum text-ink-muted">{value || "—"}</span>
      ),
    },
    ...(isDriver
      ? [
          {
            key: "subscriptionStatus",
            label: "Subscription",
            render: (value) => {
              const paid = value?.toLowerCase() === "active";
              return (
                <Badge variant={paid ? "success" : "danger"}>
                  {paid ? "Paid" : "Unpaid"}
                </Badge>
              );
            },
          },
        ]
      : []),
    {
      key: "status",
      label: "Access",
      render: (value, row) => {
        const active = value?.toLowerCase() === "active";
        const name =
          [row.firstName, row.lastName].filter(Boolean).join(" ") || "this user";
        return (
          <div className="flex items-center gap-2.5">
            <Badge variant={active ? "success" : "neutral"}>
              {active ? "Active" : "Disabled"}
            </Badge>
            <Switch
              checked={active}
              disabled={loadingAction || !hasPermission("manageUsers")}
              onChange={() => handleStatusToggle(row)}
              aria-label={`${active ? "Disable" : "Enable"} access for ${name}`}
            />
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      width: "1%",
      align: "right",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          iconRight={<ChevronRight />}
          onClick={() => navigate(`/user-management/${activeTab}/${row.id}`)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Riders & drivers"
        summary={
          loading
            ? "Loading accounts…"
            : `${nf.format(totalData)} ${isDriver ? "drivers" : "riders"}${
                hasFilters ? " matching your filters" : " on the platform"
              }`
        }
        actions={
          hasPermission("downloadExcel") && (
            <Button icon={<Download />} onClick={() => setExportOpen(true)}>
              Export CSV
            </Button>
          )
        }
      />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        tabs={[
          { value: "rider", label: "Riders", icon: UsersIcon },
          { value: "driver", label: "Drivers", icon: UserCheck },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search name, email or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leftIcon={<Search />}
            rightIcon={
              search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="pointer-events-auto text-ink-faint hover:text-ink transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null
            }
          />
        </div>

        <Input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          leftIcon={<Calendar />}
          aria-label="Registered from"
          containerClassName="w-[168px]"
        />
        <Input
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => setEndDate(event.target.value)}
          leftIcon={<Calendar />}
          aria-label="Registered until"
          containerClassName="w-[168px]"
        />

        {hasFilters && (
          <Button variant="ghost" icon={<X />} onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          totalPages={totalPages}
          totalData={totalData}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onRowClick={(row) =>
            navigate(`/user-management/${activeTab}/${row.id}`)
          }
          addButton={false}
          emptyMessage={
            hasFilters ? "No matching accounts" : "No accounts yet"
          }
          emptyHint={
            hasFilters
              ? "Try a different search term or widen the date range."
              : `${isDriver ? "Drivers" : "Riders"} will appear here once they sign up.`
          }
        />
      </Card>

      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        type={activeTab}
      />
    </div>
  );
};

export default Users;
