import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Users, QrCode } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DataTable from "../components/common/DataTable";
import { formatDate } from "../utils/helpers";
import useCampaignDetail from "../hooks/campaigns/useCampaignDetail";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");

  const {
    loadingStats,
    stats,
    fetchStats,
    loadingRedemptions,
    redemptions,
    redemptionsTotal,
    fetchRedemptions,
    loadingCodes,
    codes,
    codesTotal,
    fetchCodes,
  } = useCampaignDetail(id);

  // Pagination states
  const [redemptionsPage, setRedemptionsPage] = useState(1);
  const [redemptionsLimit, setRedemptionsLimit] = useState(10);
  
  const [codesPage, setCodesPage] = useState(1);
  const [codesLimit, setCodesLimit] = useState(10);

  useEffect(() => {
    if (activeTab === "stats") fetchStats();
  }, [activeTab, fetchStats]);

  useEffect(() => {
    if (activeTab === "redemptions") fetchRedemptions(redemptionsPage, redemptionsLimit, "");
  }, [activeTab, redemptionsPage, redemptionsLimit, fetchRedemptions]);

  useEffect(() => {
    if (activeTab === "codes") fetchCodes(codesPage, codesLimit);
  }, [activeTab, codesPage, codesLimit, fetchCodes]);

  const tabs = [
    { id: "stats", label: "Stats & Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "redemptions", label: "Redemptions", icon: <Users className="w-4 h-4" /> },
    { id: "codes", label: "Generated Codes", icon: <QrCode className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/campaigns")} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Details</h1>
          <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingStats ? (
              <p>Loading stats...</p>
            ) : stats ? (
              <>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Redemptions</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRedemptions || 0}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Generated Codes</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalGeneratedCodes || 0}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Unique Users Redeemed</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.uniqueUsers || 0}</p>
                </Card>
              </>
            ) : (
              <p>No stats available.</p>
            )}
          </div>
        )}

        {activeTab === "redemptions" && (
          <Card className="overflow-hidden">
            <DataTable
              title="Redemptions"
              data={redemptions}
              columns={[
                { key: "user", label: "User", render: (_, r) => r.userId?.email || r.userId || "—" },
                { key: "code", label: "Code Used", render: (_, r) => <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{r.code}</span> },
                { key: "date", label: "Redeemed At", render: (_, r) => formatDate(r.createdAt) },
              ]}
              loading={loadingRedemptions}
              totalData={redemptionsTotal}
              totalPages={Math.ceil(redemptionsTotal / redemptionsLimit)}
              currentPage={redemptionsPage}
              pageSize={redemptionsLimit}
              onPageChange={setRedemptionsPage}
              onPageSizeChange={(s) => { setRedemptionsLimit(s); setRedemptionsPage(1); }}
              addButton={false}
            />
          </Card>
        )}

        {activeTab === "codes" && (
          <Card className="overflow-hidden">
            <DataTable
              title="Generated Codes"
              data={codes}
              columns={[
                { key: "code", label: "Code", render: (val) => <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{val}</span> },
                { key: "user", label: "Assigned To", render: (_, r) => r.userId?.email || r.userId || "—" },
                { key: "usedCount", label: "Times Used", render: (val) => val || 0 },
                { key: "created", label: "Generated At", render: (_, r) => formatDate(r.createdAt) },
              ]}
              loading={loadingCodes}
              totalData={codesTotal}
              totalPages={Math.ceil(codesTotal / codesLimit)}
              currentPage={codesPage}
              pageSize={codesLimit}
              onPageChange={setCodesPage}
              onPageSizeChange={(s) => { setCodesLimit(s); setCodesPage(1); }}
              addButton={false}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;
