import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, Star, MapPin, Hash, Wallet, TrendingUp, XCircle } from "lucide-react";
import useGetUserDetails from "../hooks/users/useGetUserDetails";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { formatDate } from "../utils/helpers";
import Table from "../components/ui/Table";
import StatsCard from "../components/common/StatsCard";

const RiderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { details, loading } = useGetUserDetails(id, "rider");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Rider not found</h2>
        <Button variant="ghost" onClick={() => navigate("/user-management")} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  const { 
    personalInfo, 
    rideStats, 
    rideHistory, 
    activityLogs, 
    ratingAndFeedback, 
    transactionHistory, 
    walletBalance 
  } = details;

  const historyColumns = [
    { 
      key: "createdAt", 
      label: "Date", 
      render: (val) => formatDate(val) 
    },
    { 
      key: "driver", 
      label: "Driver", 
      render: (driver) => driver?.name || "N/A" 
    },
    { 
      key: "pickupPoint", 
      label: "Pickup", 
      render: (point) => (
        <span className="text-xs max-w-[150px] block truncate" title={point?.placeName}>
          {point?.placeName || "N/A"}
        </span>
      )
    },
    { 
      key: "dropOffPointRequested", 
      label: "Drop-off", 
      render: (point) => (
        <span className="text-xs max-w-[150px] block truncate" title={point?.placeName}>
          {point?.placeName || "N/A"}
        </span>
      )
    },
    { 
      key: "rideFare", 
      label: "Fare", 
      render: (val) => `$${val || 0}` 
    },
    { 
      key: "rideStatus", 
      label: "Status", 
      render: (val) => (
        <Badge variant={val?.toLowerCase() === "completed" ? "success" : "danger"}>
          {val}
        </Badge>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/user-management")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Rider Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <Card className="lg:col-span-1">
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                {personalInfo?.profilePicture ? (
                  <img 
                    src={personalInfo.profilePicture} 
                    alt={personalInfo.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }} 
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{personalInfo?.name}</h2>
              <Badge variant={personalInfo.status === "Active" ? "success" : "danger"} className="mt-2">
                {personalInfo.status}
              </Badge>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 text-sm font-medium text-gray-700">
               <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{personalInfo.phone || personalInfo.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Account Created: {formatDate(personalInfo.createdAt)}</span>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Activity Logs</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Last Login</span>
                  <span className="text-gray-900 font-medium">{activityLogs?.lastLogin ? formatDate(activityLogs.lastLogin) : 'Never'}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Last Ride</span>
                  <span className="text-gray-900 font-medium">{activityLogs?.lastRideTaken ? formatDate(activityLogs.lastRideTaken) : 'No rides yet'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Rides"
              value={rideStats?.totalCompleted || 0}
              icon={<TrendingUp />}
              colored
              index={3}
            />
            <StatsCard
              title="Cancelled Rides"
              value={rideStats?.totalCancelled || 0}
              icon={<XCircle />}
              colored
              index={5}
            />
            <StatsCard
              title="Wallet Balance"
              value={`$${walletBalance || 0}`}
              icon={<Wallet />}
              colored
              index={3}
            />
            <StatsCard
              title="Average Rating"
              value={parseFloat(details?.personalInfo?.averageRating || 0).toFixed(1)}
              icon={<Star />}
              colored
              index={4}
            />
          </div>

          {/* Ride History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ride History</h3>
              {rideHistory && rideHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table data={rideHistory} columns={historyColumns} />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No ride history available</p>
              )}
            </div>
          </Card>

          {/* Transaction History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h3>
              {transactionHistory && transactionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table 
                    data={transactionHistory} 
                    columns={[
                      { key: "createdAt", label: "Date", render: (val, row) => formatDate(val || row.date) },
                      { key: "description", label: "Description" },
                      { 
                        key: "amount", 
                        label: "Amount", 
                        render: (val, row) => (
                          <span className={row.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {row.type === 'credit' ? '+' : '-'}${Math.abs(val)}
                          </span>
                        ) 
                      },
                    ]} 
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No transactions found</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiderDetail;
