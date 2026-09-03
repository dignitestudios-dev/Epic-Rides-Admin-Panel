// Fixture data for the design preview harness. Shapes mirror the real admin
// API responses so pages render exactly as they do in production.

export const dashboardStats = {
  userMetrics: {
    totalActiveRiders: 18432,
    totalActiveDrivers: 1284,
    newRiderRegistrations: { last7Days: 412, last30Days: 1655 },
    newDriverRegistrations: { last7Days: 38, last30Days: 147 },
  },
  rideMetrics: {
    totalRidesCompleted: { today: 486, thisWeek: 3241, thisMonth: 13890 },
    totalRidesCancelled: { today: 37, thisWeek: 259, thisMonth: 1104 },
  },
  revenueMetrics: {
    subscriptionRevenueUSD: 84210,
    withdrawalCommissionRevenueUSD: 6142.38,
  },
  pendingActions: {
    pendingDriverRequests: 47,
    pendingReports: 12,
  },
};

export const rideAnalytics = {
  overview: {
    totalRides: 14994,
    completedRides: 13890,
    cancelledRides: 1104,
    completedPercentage: 92.64,
    cancelledPercentage: 7.36,
  },
  rideDistribution: [
    { type: "economy", count: 9146, percentage: 61.0 },
    { type: "luxury", count: 3748, percentage: 25.0 },
    { type: "carpool", count: 2100, percentage: 14.0 },
  ],
};

const FIRST = [
  "Alice", "Brian", "Clara", "David", "Ethan", "Fiona", "George", "Hana",
  "Isaac", "Julia", "Kevin", "Lena", "Marcus", "Nina", "Omar", "Priya",
  "Quentin", "Rosa", "Samuel", "Tara",
];
const LAST = [
  "Morgan", "Lee", "Diaz", "Kim", "Brown", "Walsh", "Tan", "Okafor",
  "Nguyen", "Rivera", "Parker", "Ahmed", "Silva", "Kowalski", "Haddad",
  "Sharma", "Dubois", "Castillo", "Bennett", "Osei",
];
const CITIES = ["Miami", "Orlando", "Tampa", "Jacksonville", "Naples", "Sarasota"];
const STATUSES = ["active", "active", "active", "inactive", "suspended", "pending"];

const makeUser = (index, type) => {
  const first = FIRST[index % FIRST.length];
  const last = LAST[(index * 7) % LAST.length];
  const created = new Date(2025, 0, 1);
  created.setDate(created.getDate() + ((index * 13) % 600));

  return {
    _id: `${type}_${1000 + index}`,
    id: `${type}_${1000 + index}`,
    firstName: first,
    lastName: last,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phoneNumber: `+1 555-0${(100 + index).toString().padStart(3, "0")}`,
    status: STATUSES[index % STATUSES.length],
    isActive: index % 6 !== 3,
    city: CITIES[index % CITIES.length],
    rating: Number((3.4 + ((index * 37) % 16) / 10).toFixed(1)),
    totalRides: ((index * 91) % 340) + 4,
    walletBalance: Number((((index * 137) % 4200) / 10).toFixed(2)),
    profilePicture: null,
    createdAt: created.toISOString(),
    updatedAt: created.toISOString(),
    ...(type === "driver" && {
      vehicle: {
        make: ["Toyota", "Honda", "Ford", "Tesla"][index % 4],
        model: ["Camry", "Civic", "Focus", "Model 3"][index % 4],
        year: `${2018 + (index % 7)}`,
        plate: `EPC-${2000 + index}`,
        color: ["Silver", "White", "Black", "Blue"][index % 4],
      },
      subscriptionStatus: index % 5 === 0 ? "expired" : "active",
      totalEarnings: Number((((index * 331) % 90000) / 10).toFixed(2)),
    }),
  };
};

export const makeUsers = (type = "rider", count = 20, page = 1) =>
  Array.from({ length: count }, (_, i) => makeUser((page - 1) * count + i, type));

export const notifications = Array.from({ length: 6 }, (_, i) => ({
  _id: `notif_${i}`,
  isRead: i > 1,
  createdAt: new Date(Date.now() - i * 5400000).toISOString(),
  notificationContent: {
    title: [
      "New driver application",
      "Ride report filed",
      "Withdrawal requested",
      "Document expired",
      "Peak window activated",
      "Campaign ended",
    ][i],
    description: [
      "Marcus Silva submitted documents for review.",
      "A rider flagged ride #48210 for unsafe driving.",
      "Fiona Walsh requested a $240.00 withdrawal.",
      "George Tan's insurance certificate expired today.",
      "Friday evening surge is now live in Miami.",
      "The SUMMER25 campaign reached its redemption cap.",
    ][i],
    metaData: i === 0 ? { id: "driver_1003" } : {},
  },
}));

export const requestsCount = { pendingDriverRequests: 47, count: 47 };

const place = (name) => ({ placeName: name });

const makeRides = (count, peerKey) =>
  Array.from({ length: count }, (_, i) => ({
    _id: `ride_${i}`,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    [peerKey]: {
      firstName: FIRST[(i * 3) % FIRST.length],
      lastName: LAST[(i * 5) % LAST.length],
    },
    pickupPoint: place(["Miami Intl Airport", "Brickell City Centre", "Wynwood Walls"][i % 3]),
    dropOffPointRequested: place(["South Beach", "Coral Gables", "Downtown Miami"][i % 3]),
    startingPoint: place(["Orlando Intl Airport", "Disney Springs", "Lake Eola"][i % 3]),
    destination: place(["Kissimmee", "Winter Park", "Celebration"][i % 3]),
    rideFare: Number((8 + ((i * 37) % 45)).toFixed(2)),
    fareCharged: Number((6 + ((i * 23) % 30)).toFixed(2)),
    rideStatus: i % 5 === 4 ? "cancelled" : "completed",
    status: i % 6 === 5 ? "cancelled" : "completed",
  }));

const makeTransactions = (count) =>
  Array.from({ length: count }, (_, i) => ({
    _id: `txn_${i}`,
    createdAt: new Date(Date.now() - i * 172800000).toISOString(),
    description: ["Ride payment", "Wallet top-up", "Withdrawal", "Subscription renewal"][i % 4],
    status: i % 7 === 6 ? "failed" : "success",
    type: i % 2 === 0 ? "debit" : "credit",
    amount: Number((5 + ((i * 53) % 180)).toFixed(2)),
  }));

export const riderDetail = {
  personalInfo: {
    firstName: "Alice",
    lastName: "Morgan",
    email: "alice.morgan@example.com",
    phone: "+1 555-0100",
    status: "Active",
    profilePicture: null,
    address: "1200 Brickell Ave, Miami, FL 33131",
  },
  fullDetails: {
    firstName: "Alice",
    lastName: "Morgan",
    email: "alice.morgan@example.com",
    createdAt: "2025-02-14T10:22:00.000Z",
    address: "1200 Brickell Ave, Miami, FL 33131",
  },
  rideStats: { totalCompleted: 128, totalCancelled: 9 },
  averageRating: 4.72,
  walletBalance: 84.5,
  rewardedBalance: 12.25,
  activityLogs: {
    lastLogin: "2026-09-01T08:14:00.000Z",
    lastRideTaken: "2026-08-31T19:42:00.000Z",
    accountCreationDate: "2025-02-14T10:22:00.000Z",
  },
  rideHistory: makeRides(9, "driver"),
  carpoolHistory: makeRides(5, "driver"),
  transactionHistory: makeTransactions(8),
};

export const driverDetail = {
  personalInfo: {
    firstName: "Marcus",
    lastName: "Silva",
    email: "marcus.silva@example.com",
    phoneNumber: "5550142",
    status: "Active",
    profilePicture: null,
    address: "480 NW 2nd St, Orlando, FL 32801",
  },
  fullDetails: {
    firstName: "Marcus",
    lastName: "Silva",
    email: "marcus.silva@example.com",
    subscriptionStatus: "active",
    createdAt: "2024-11-03T09:00:00.000Z",
  },
  subscriptionStatus: "Active",
  rideStats: { totalCompleted: 1042, totalCancelled: 37 },
  walletBalance: 312.75,
  rewardedBalance: 40,
  revenue: { adminCommission: 284.6 },
  vehicleDetails: {
    make: "Toyota",
    model: "Camry",
    yearOfManufacture: "2022",
    licensePlateNumber: "EPC-4821",
    color: "Silver",
    vehicleType: "economy",
  },
  approvedDocuments: {
    driving_license: { status: "approved" },
    vehicle_registration: { status: "approved" },
    insurance_certificate: { status: "pending" },
    background_check: { status: "approved" },
    vehicle_inspection: { status: "rejected" },
  },
  activityLogs: {
    lastLogin: "2026-09-02T21:03:00.000Z",
    lastRideTaken: "2026-09-02T20:11:00.000Z",
    accountCreationDate: "2024-11-03T09:00:00.000Z",
  },
  ratingAndFeedback: {
    rating: 4.8,
    reviewsCount: 316,
    recentReviews: [
      { reviewerType: "User", stars: 5, description: "Punctual and friendly, spotless car.", createdAt: "2026-09-01T12:00:00.000Z" },
      { reviewerType: "User", stars: 4, description: "Good ride, took a slight detour.", createdAt: "2026-08-29T17:30:00.000Z" },
      { reviewerType: "User", stars: 5, description: "Helped with my luggage without being asked.", createdAt: "2026-08-27T08:05:00.000Z" },
    ],
  },
  referralInfo: {
    totalReferrals: 3,
    referrals: [
      { id: "driver_1007", firstName: "Priya", lastName: "Sharma" },
      { id: "driver_1011", firstName: "Omar", lastName: "Haddad" },
      { id: "driver_1014", firstName: "Rosa", lastName: "Castillo" },
    ],
  },
  rideHistory: makeRides(9, "user"),
  carpoolHistory: makeRides(4, "driver"),
  transactionHistory: makeTransactions(7),
};

export const driverTransactions = {
  transactions: Array.from({ length: 6 }, (_, i) => ({
    _id: `sub_${i}`,
    createdAt: new Date(Date.now() - i * 2592000000).toISOString(),
    amount: 49.99,
    purpose: i === 5 ? "subscription_activation" : "subscription_renewal",
    status: i === 3 ? "failed" : "success",
    isActivationTransaction: i === 5,
  })),
  pagination: { totalPages: 2 },
  totalTransactions: 11,
};

export const adminUser = {
  _id: "admin_1",
  name: "Kamil Raza",
  email: "muhammadkamil.raza@dexnive.com",
  role: "super_admin",
  profilePicture: null,
};
