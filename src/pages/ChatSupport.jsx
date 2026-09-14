import { useState, useRef, useEffect } from "react";
import {
  Send,
  Search,
  User,
  MessageSquare,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  CheckCircle2,
  Clock,
  Inbox,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatsCard from "../components/common/StatsCard";
import { formatDateTime } from "../utils/helpers";

const AVATAR_PALETTE = [
  { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30" },
  { bg: "bg-blue-500/15", text: "text-blue-500", border: "border-blue-500/30" },
  { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30" },
  { bg: "bg-purple-500/15", text: "text-purple-500", border: "border-purple-500/30" },
  { bg: "bg-rose-500/15", text: "text-rose-500", border: "border-rose-500/30" },
  { bg: "bg-cyan-500/15", text: "text-cyan-500", border: "border-cyan-500/30" },
];

function getAvatarColors(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] || "?").slice(0, 2).toUpperCase();
}

const ChatSupport = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      avatar: null,
      status: "online",
      lastMessage: "Thank you for your help!",
      lastMessageTime: "2024-01-20T15:30:00Z",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          senderId: 1,
          senderName: "John Doe",
          message: "Hi, I need help with my account",
          timestamp: "2024-01-20T15:00:00Z",
          isAdmin: false,
        },
        {
          id: 2,
          senderId: "admin",
          senderName: "Admin",
          message:
            "Hello John! I'd be happy to help you with your account. What specific issue are you experiencing?",
          timestamp: "2024-01-20T15:02:00Z",
          isAdmin: true,
        },
        {
          id: 3,
          senderId: 1,
          senderName: "John Doe",
          message:
            "I can't access my premium features even though I upgraded yesterday",
          timestamp: "2024-01-20T15:05:00Z",
          isAdmin: false,
        },
        {
          id: 4,
          senderId: "admin",
          senderName: "Admin",
          message:
            "I see the issue. Let me refresh your account permissions. This should be resolved in a few minutes.",
          timestamp: "2024-01-20T15:10:00Z",
          isAdmin: true,
        },
        {
          id: 5,
          senderId: 1,
          senderName: "John Doe",
          message: "Perfect! It's working now. Thank you for your help!",
          timestamp: "2024-01-20T15:30:00Z",
          isAdmin: false,
        },
      ],
    },
    {
      id: 2,
      userId: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      avatar: null,
      status: "away",
      lastMessage: "Is there any update on this?",
      lastMessageTime: "2024-01-20T14:45:00Z",
      unreadCount: 2,
      messages: [
        {
          id: 1,
          senderId: 2,
          senderName: "Jane Smith",
          message: "I submitted a bug report yesterday but haven't heard back",
          timestamp: "2024-01-19T16:30:00Z",
          isAdmin: false,
        },
        {
          id: 2,
          senderId: "admin",
          senderName: "Admin",
          message:
            "Thank you for the report. Our development team is investigating the issue.",
          timestamp: "2024-01-19T17:00:00Z",
          isAdmin: true,
        },
        {
          id: 3,
          senderId: 2,
          senderName: "Jane Smith",
          message: "Is there any update on this?",
          timestamp: "2024-01-20T14:45:00Z",
          isAdmin: false,
        },
      ],
    },
    {
      id: 3,
      userId: 3,
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      avatar: null,
      status: "offline",
      lastMessage: "Thanks for the quick response!",
      lastMessageTime: "2024-01-20T12:15:00Z",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          senderId: 3,
          senderName: "Bob Johnson",
          message: "How do I cancel my subscription?",
          timestamp: "2024-01-20T12:00:00Z",
          isAdmin: false,
        },
        {
          id: 2,
          senderId: "admin",
          senderName: "Admin",
          message:
            "You can cancel your subscription from your account settings under the billing section.",
          timestamp: "2024-01-20T12:10:00Z",
          isAdmin: true,
        },
        {
          id: 3,
          senderId: 3,
          senderName: "Bob Johnson",
          message: "Thanks for the quick response!",
          timestamp: "2024-01-20T12:15:00Z",
          isAdmin: false,
        },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: selectedChat.messages.length + 1,
      senderId: "admin",
      senderName: "Admin",
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: true,
    };

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: message.trim(),
      lastMessageTime: new Date().toISOString(),
    };

    setSelectedChat(updatedChat);
    setChats((prev) =>
      prev.map((c) => (c.id === updatedChat.id ? updatedChat : c))
    );
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-emerald-500";
      case "away":
        return "bg-amber-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const totalChats = chats.length;
  const activeChats = chats.filter((chat) => chat.status === "online").length;
  const unreadMessages = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Support Inbox
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Real-time customer and driver support chat center
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Conversations"
          value={totalChats}
          icon={<MessageSquare className="w-5 h-5" />}
          colored
          index={0}
        />
        <StatsCard
          title="Active Online"
          value={activeChats}
          icon={<User className="w-5 h-5" />}
          colored
          index={1}
        />
        <StatsCard
          title="Unread Messages"
          value={unreadMessages}
          icon={<Inbox className="w-5 h-5" />}
          colored
          index={2}
        />
        <StatsCard
          title="Avg Response Time"
          value="< 2 mins"
          icon={<Clock className="w-5 h-5" />}
          colored
          index={3}
        />
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
        {/* Chat List */}
        <div className="lg:col-span-4 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-[#1f242b]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Conversations ({filteredChats.length})
            </h3>
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-[#1f242b]">
            {filteredChats.map((chat) => {
              const avatar = getAvatarColors(chat.userName);
              const isSelected = selectedChat?.id === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#61CB08]/10 dark:bg-[#61CB08]/15 border-l-4 border-[#61CB08]"
                      : "hover:bg-gray-50 dark:hover:bg-[#181d24]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${avatar.bg} ${avatar.text} ${avatar.border}`}
                      >
                        {getInitials(chat.userName)}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#13161a] ${getStatusColor(
                          chat.status
                        )}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {chat.userName}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                          {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                          <Badge variant="danger" dot className="text-[10px]">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredChats.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                No conversations found
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-8 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl flex flex-col overflow-hidden shadow-sm">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-[#1f242b] flex items-center justify-between bg-gray-50/50 dark:bg-[#181d24]/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {(() => {
                      const avatar = getAvatarColors(selectedChat.userName);
                      return (
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${avatar.bg} ${avatar.text} ${avatar.border}`}
                        >
                          {getInitials(selectedChat.userName)}
                        </div>
                      );
                    })()}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#13161a] ${getStatusColor(
                        selectedChat.status
                      )}`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedChat.userName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedChat.userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Phone className="w-3.5 h-3.5" />}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Video className="w-3.5 h-3.5" />}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<MoreVertical className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-[#0f1216]">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3.5 py-2.5 rounded-xl shadow-xs text-sm ${
                        msg.isAdmin
                          ? "bg-[#61CB08] text-black font-medium rounded-br-xs"
                          : "bg-white dark:bg-[#181d24] text-gray-900 dark:text-white border border-gray-200/80 dark:border-[#222831] rounded-bl-xs"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.message}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          msg.isAdmin
                            ? "text-black/60 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a]">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Paperclip className="w-4 h-4 text-gray-400" />}
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a response... (Press Enter to send)"
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#181d24] border border-gray-200 dark:border-[#1f242b] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#61CB08] focus:border-[#61CB08]"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    variant="primary"
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-[#181d24] flex items-center justify-center text-gray-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Select a conversation
                </h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Choose a support thread from the left sidebar to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
