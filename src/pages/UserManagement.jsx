// pages/UserManagment.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import useGetDocuments from "../hooks/Docs/useGetDocuments";

const UserManagment = () => {
  const navigate = useNavigate();
  const { docs, vehicles, loading } = useGetDocuments("", "approved", 1, 10);
  console.log(docs, "documents");
  // Group by driver
  // ✅ Group by driver
  const groupedDrivers = Object.values(
    docs.reduce((acc, doc) => {
      const driverId = doc.driver._id;

      if (!acc[driverId]) {
        acc[driverId] = {
          driver: doc.driver,
          documents: [],
          vehicles: vehicles.filter(
            (vehicle) => vehicle.driver._id === driverId,
          ),
        };
      }

      acc[driverId].documents.push(doc);
      return acc;
    }, {}),
  );

  const columns = [
    {
      key: "name",
      label: "Driver Name",
      render: (_, row) => row.driver.name,
    },
    {
      key: "email",
      label: "Email",
      render: (_, row) => row.driver.email,
    },
    {
      key: "phone",
      label: "Phone",
      render: (_, row) => row.driver.phone,
    },
    {
      key: "docs",
      label: "Documents",
      render: (_, row) => row.documents.length,
    },
    {
      key: "vehicles",
      label: "Vehicles",
      render: (_, row) => row.vehicles.length,
    },
    {
      key: "action",
      label: "Action",
      render: (_, row) => (
        <Button
          onClick={() =>
            navigate(`/driver/${row.driver._id}`, {
              state: row,
            })
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Driver Document Verification
      </h2>

      <Table data={groupedDrivers} columns={columns} loading={loading} />
    </div>
  );
};

export default UserManagment;
