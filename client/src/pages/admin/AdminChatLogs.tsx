import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, AlertTriangle, Clock, Search, Filter } from "lucide-react";

export default function AdminChatLogs() {
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const { data: logs = [], isLoading } = trpc.chat.logs.useQuery({ escalatedOnly });

  // Group logs by sessionId
  const sessions = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    if (!acc[log.sessionId]) acc[log.sessionId] = [];
    acc[log.sessionId].push(log);
    return acc;
  }, {});

  const sessionList = Object.entries(sessions)
    .map(([sessionId, messages]) => ({
      sessionId,
      messages,
      personaName: messages[0]?.personaName ?? "Unknown",
      firstMessage: messages[0]?.userMessage ?? "",
      lastActivity: messages[messages.length - 1]?.createdAt,
      hasEscalation: messages.some(m => m.escalated),
      isBusinessHours: messages[0]?.isBusinessHours ?? true,
      visitorEmail: messages.find(m => m.visitorEmail)?.visitorEmail,
      messageCount: messages.length,
    }))
    .filter(s =>
      !search ||
      s.firstMessage.toLowerCase().includes(search.toLowerCase()) ||
      s.sessionId.toLowerCase().includes(search.toLowerCase()) ||
      (s.visitorEmail?.toLowerCase().includes(search.toLowerCase()) ?? false)
    )
    .sort((a, b) => {
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return bTime - aTime;
    });

  const totalEscalations = Object.values(sessions).filter(msgs => msgs.some(m => m.escalated)).length;
  const totalSessions = Object.keys(sessions).length;
  const outOfHoursSessions = Object.values(sessions).filter(msgs => !msgs[0]?.isBusinessHours).length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">Chat Conversations</h1>
          <p className="text-sm text-stone-500 mt-1">All visitor conversations with the Reni assistant</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-500 uppercase tracking-wide">Total Sessions</span>
            </div>
            <p className="text-2xl font-semibold text-stone-900">{totalSessions}</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-stone-500 uppercase tracking-wide">Escalations</span>
            </div>
            <p className="text-2xl font-semibold text-amber-600">{totalEscalations}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-500 uppercase tracking-wide">Out of Hours</span>
            </div>
            <p className="text-2xl font-semibold text-stone-900">{outOfHoursSessions}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Button
            variant={escalatedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setEscalatedOnly(!escalatedOnly)}
            className="gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            {escalatedOnly ? "All sessions" : "Escalations only"}
          </Button>
        </div>

        {/* Session list */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-400">Loading conversations...</div>
        ) : sessionList.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessionList.map(session => (
              <div key={session.sessionId} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                {/* Session header */}
                <button
                  className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedSession(
                    expandedSession === session.sessionId ? null : session.sessionId
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Persona avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ background: "#6B7A3E" }}
                      >
                        {session.personaName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stone-800">{session.personaName}</span>
                          {session.hasEscalation && (
                            <Badge variant="destructive" className="text-xs py-0">Escalated</Badge>
                          )}
                          {!session.isBusinessHours && (
                            <Badge variant="outline" className="text-xs py-0 text-stone-500">Out of hours</Badge>
                          )}
                          {session.visitorEmail && (
                            <Badge variant="outline" className="text-xs py-0 text-blue-600 border-blue-200">{session.visitorEmail}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 truncate max-w-md">
                          {session.firstMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400 flex-shrink-0">
                      <span>{session.messageCount} msg{session.messageCount !== 1 ? "s" : ""}</span>
                      <span>
                        {session.lastActivity
                          ? new Date(session.lastActivity).toLocaleString("en-AU", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded conversation */}
                {expandedSession === session.sessionId && (
                  <div className="border-t border-stone-100 bg-stone-50 px-4 py-3 space-y-3">
                    {session.messages.map((msg, i) => (
                      <div key={i} className="space-y-1.5">
                        {/* User message */}
                        <div className="flex justify-end">
                          <div className="bg-stone-800 text-white text-sm rounded-xl rounded-tr-sm px-3 py-2 max-w-md">
                            {msg.userMessage}
                          </div>
                        </div>
                        {/* Assistant reply */}
                        <div className="flex justify-start items-start gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5"
                            style={{ background: "#6B7A3E" }}
                          >
                            {msg.personaName[0]}
                          </div>
                          <div className={`text-sm rounded-xl rounded-tl-sm px-3 py-2 max-w-md ${msg.escalated ? "bg-amber-50 border border-amber-200" : "bg-white border border-stone-200"}`}>
                            {msg.escalated && (
                              <div className="flex items-center gap-1 text-amber-600 text-xs mb-1 font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                Escalated to team
                              </div>
                            )}
                            {msg.assistantReply}
                          </div>
                        </div>
                        {/* Timestamp */}
                        <div className="text-right">
                          <span className="text-xs text-stone-400">
                            {new Date(msg.createdAt).toLocaleTimeString("en-AU", {
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
