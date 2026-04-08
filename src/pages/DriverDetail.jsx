import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Star, 
  MapPin, Car, FileText, CheckCircle, XCircle, Clock,
  Navigation,
  History,
  ExternalLink,
  AlertTriangle,
  Hash,
  TrendingUp,
  Wallet,
  Eye,
} from "lucide-react";
import useGetUserDetails from "../hooks/users/useGetUserDetails";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import StatsCard from "../components/common/StatsCard";
import { formatDate } from "../utils/helpers";
import Table from "../components/ui/Table";

const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { details, loading } = useGetUserDetails(id, "driver");
  const [showAllDocsModal, setShowAllDocsModal] = useState(false);

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
        <h2 className="text-xl font-semibold text-gray-900">Driver not found</h2>
        <Button variant="ghost" onClick={() => navigate("/user-management")} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  const { 
    personalInfo, 
    rideStats, 
    vehicleDetails, 
    approvedDocuments, 
    rideHistory,
    ratingAndFeedback,
    subscriptionStatus,
    walletBalance,
    revenue,
    referralInfo
  } = details;

  const historyColumns = [
    { 
      key: "createdAt", 
      label: "Date", 
      render: (val) => formatDate(val) 
    },
    { 
      key: "user", 
      label: "Rider", 
      render: (user) => user?.name || "N/A" 
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
      label: "Earnings", 
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Driver Details</h1>
          <Badge 
            variant={subscriptionStatus === "Active" ? "success" : "danger"}
            className="text-sm px-3 py-1"
          >
            Subscription: {subscriptionStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Vehicle Info */}
        <div className="space-y-6">
          <Card>
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

              <div className="space-y-4 pt-6 border-t border-gray-100 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{personalInfo.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{personalInfo.phone || personalInfo.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Account Created: {formatDate(details?.activityLogs?.accountCreationDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Last Ride Taken: {formatDate(details?.activityLogs?.lastRideTaken)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Last Login: {formatDate(details?.activityLogs?.lastLogin)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Vehicle Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Make/Model</span>
                  <span className="font-medium text-gray-900">{vehicleDetails?.make} {vehicleDetails?.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Year</span>
                  <span className="font-medium text-gray-900">{vehicleDetails?.yearOfManufacture || vehicleDetails?.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plate Number</span>
                  <span className="font-medium text-gray-900 font-mono">{vehicleDetails?.licensePlateNumber || vehicleDetails?.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Color</span>
                  <span className="font-medium text-gray-900">{vehicleDetails?.color}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Documents
                </h3>
                <Link to={`/driver/${id}`} 
                  variant="primary" 
                  className="text-sm border rounded-md text-gray-600 px-3 p-1"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                 
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {Object.entries(approvedDocuments || {}).slice(0, 3).map(([key, doc], idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{key}</p>
                      <p className="text-xs text-gray-500">Status: {doc.status}</p>
                    </div>
                    {doc.status === "approved" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : doc.status === "rejected" ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
              {Object.entries(approvedDocuments || {}).length > 3 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  +{Object.entries(approvedDocuments || {}).length - 3} more documents
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Rides"
              value={rideStats?.totalCompleted}
              // icon={<TrendingUp />}
              colored
              index={3}
            />
            <StatsCard
              title="Cancelled Rides"
              value={rideStats?.totalCancelled }
              // icon={<XCircle />}
              colored
              index={5}
            />
            <StatsCard
              title="Wallet Balance"
              value={`$${details?.walletBalance.toFixed(2) || 0}`}
              // icon={<Wallet />}
              colored
              index={3}
            />
            <StatsCard
              title="Admin Commission (3%)"
              value={`$${revenue?.adminCommission || "0.00"}`}
              // icon={<TrendingUp />}
              colored
              index={3}
            />
          </div>

          {/* Ride History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Rides</h3>
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transaction History</h3>
              {details?.transactionHistory && details.transactionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table 
                    data={details.transactionHistory} 
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

          {/* Rating & Feedback */}
          <Card>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Latest Reviews & Feedback</h3>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-xl font-bold">{ratingAndFeedback?.rating || 0}</span>
          <span className="text-gray-500 text-sm">({ratingAndFeedback?.reviewsCount || 0} reviews)</span>
        </div>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {ratingAndFeedback?.recentReviews && ratingAndFeedback.recentReviews.length > 0 ? (
          ratingAndFeedback.recentReviews.map((review, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-gray-900">{review.reviewerType === 'User' ? 'Rider' : 'Driver'}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold">{review.stars}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{review.description}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No reviews yet</p>
        )}
      </div>
    </div>
          </Card>

          {/* Referral Information */}
          <Card>
            <div className="p-6 text-[#1A1C21]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Recent Referrals</h3>
                <Badge variant="primary" className="text-sm px-3 py-1">
                  Total Referrals: {referralInfo?.totalReferrals || 0}
                </Badge>
              </div>
              
              {referralInfo?.referrals && referralInfo.referrals.length > 0 ? (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <Table 
                    data={referralInfo.referrals} 
                    columns={[
                      { 
                        key: "name", 
                        label: "Referred Driver",
                        render: (val) => <span className="font-medium text-gray-900">{val}</span>
                      },
                      // { 
                      //   key: "date", 
                      //   label: "Date", 
                      //   render: (val) => <span className="text-gray-500">{formatDate(val)}</span> 
                      // },
                      { 
                        key: "id", 
                        label: "Action", 
                        render: (val) => (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                            onClick={() => navigate(`/user-management/driver/${val}`)}
                          >
                            View Profile
                          </Button>
                        ) 
                      },
                    ]} 
                  />
                </div>
              ) : (
                <div className="text-center py-12  rounded-2xl  ">
                  <p className="text-gray-500 font-medium ">No referral activities recorded yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* View All Documents Modal */}
      <Modal
        isOpen={showAllDocsModal}
        onClose={() => setShowAllDocsModal(false)}
        title="All Driver Documents"
        size="lg"
      >
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
          {Object.entries(approvedDocuments || {}).length > 0 ? (
            Object.entries(approvedDocuments || {}).map(([key, doc], idx) => (
              <div 
                key={idx} 
                className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h4 className="text-sm font-semibold text-gray-900 capitalize">{key.replace(/_/g, " ")}</h4>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 ml-8">
                      <p><span className="font-medium">Status:</span> <span className="capitalize">{doc.status}</span></p>
                      {doc.expiryDate && (
                        <p><span className="font-medium">Expiry:</span> {formatDate(doc.expiryDate)}</p>
                      )}
                      {doc.verificationDate && (
                        <p><span className="font-medium">Verified:</span> {formatDate(doc.verificationDate)}</p>
                      )}
                      {doc.url && (
                        <p>
                          <span className="font-medium">Document:</span>{" "}
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {doc.status === "approved" ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-xs font-medium text-green-600">Approved</span>
                      </div>
                    ) : doc.status === "rejected" ? (
                      <div className="flex flex-col items-center gap-1">
                        <XCircle className="w-6 h-6 text-red-500" />
                        <span className="text-xs font-medium text-red-600">Rejected</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Clock className="w-6 h-6 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-600">Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No documents found</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DriverDetail;
