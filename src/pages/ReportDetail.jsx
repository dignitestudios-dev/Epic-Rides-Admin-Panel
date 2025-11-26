import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { User } from "lucide-react";

const ReportDetail = ({ onStatusChange }) => {
  const { id } = useParams();
  const { state } = useLocation();
  const { ticket } = state || {};

  const [replyInputVisible, setReplyInputVisible] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [responses, setResponses] = useState(ticket?.responses || []);

  if (!ticket) return <p>Ticket not found</p>;

  const handleReplySubmit = () => {
    if (!replyMessage.trim()) return;

    const newReply = {
      author: "Admin",
      message: replyMessage,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };

    setResponses([...responses, newReply]);
    setReplyMessage("");
    setReplyInputVisible(false);
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl shadow-md flex items-center justify-between">
        {/* Left Section */}
        <div className="space-y-1">
          {/* Category */}
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full shadow-sm uppercase tracking-wide">
            {ticket.category}
          </span>

          {/* Report ID */}
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{ticket.id}</h2>

          {/* Date */}
          <p className="text-gray-600 text-sm">
            Submitted on {new Date(ticket.datetime).toLocaleString()}
          </p>
        </div>

        {/* Status Badge */}
        <div>
          <Badge variant="info" className="text-sm px-4 py-2 shadow-sm">
            {ticket.status}
          </Badge>
        </div>
      </div>

      {/* Submitted By */}
      <div className="p-5 bg-white border rounded-lg shadow">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          Submitted By
        </h3>
        <p className="font-medium text-gray-900">{ticket.submittedBy.name}</p>
        <p className="text-gray-500">{ticket.submittedBy.contact}</p>
        <p className="text-xs text-gray-600 uppercase">
          {ticket.submittedBy.type}
        </p>
      </div>

      {/* Reported Against */}
      <div className="p-5 bg-white border rounded-lg shadow">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          Reported Against
        </h3>
        {ticket.reportedAgainst ? (
          <>
            <p className="font-medium text-gray-900">
              {ticket.reportedAgainst.name}
            </p>
            <p className="text-gray-500 uppercase">
              {ticket.reportedAgainst.type}
            </p>
          </>
        ) : (
          <p className="text-gray-400">N/A</p>
        )}
      </div>
      <div className="p-5 bg-white border rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Attachments</h3>

        {ticket.attachments?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {ticket.attachments.map((img, idx) => (
              <img
                key={idx}
                src={"https://placehold.co/600x400"}
                alt=""
                className="w-full h-40 object-cover rounded-lg border shadow-sm"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No attachments uploaded</p>
        )}
      </div>
      {/* Description + Reply Button */}
      <div className="p-5 bg-white border rounded-lg shadow space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">
            Description
          </h3>
          <Button
            size="sm"
            onClick={() => setReplyInputVisible(!replyInputVisible)}
          >
            Reply
          </Button>
        </div>

        <p className="text-gray-700">{ticket.description}</p>

        {/* Reply Input Box */}
        {replyInputVisible && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Write your reply..."
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              rows="3"
            />
            <Button onClick={handleReplySubmit} className="w-full">
              Submit Reply
            </Button>
          </div>
        )}
      </div>

      {/* Attachments */}

      {/* Responses (with Admin Green UI) */}
      {responses.length > 0 && (
        <div className="p-5 bg-white border rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-lg">Responses</h3>

          {responses.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border shadow-sm ${
                r.isAdmin ? "bg-green-50 border-green-300" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    r.isAdmin ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold">
                    {r.author} {r.isAdmin && "(Admin)"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-800">{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status Update */}
    </div>
  );
};

export default ReportDetail;
