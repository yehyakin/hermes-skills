"use client";

interface TaskEvent {
  id: number;
  task_id: string;
  timestamp: string;
  event_type: string;
  agent?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface TaskTimelineProps {
  events: TaskEvent[];
}

const eventIcons: Record<string, string> = {
  task_created: "📋",
  task_updated: "🔄",
  task_started: "▶️",
  task_completed: "✅",
  task_failed: "❌",
  task_cancelled: "🚫",
  task_retried: "🔁",
  risk_waiting_confirm: "⚠️",
  risk_confirmed: "🔓",
  agent_status_changed: "🤖",
  worker_timeout: "⏰",
  memory_written: "📝",
  // External paid API events
  external_created: "🌐",
  external_polling: "🔄",
  external_completed: "✅",
  external_failed: "❌",
  external_timeout: "⏰",
  external_recover: "🔁",
  default: "📌",
};

const eventColors: Record<string, string> = {
  task_created: "border-blue-400 bg-blue-50",
  task_completed: "border-green-400 bg-green-50",
  task_failed: "border-red-400 bg-red-50",
  risk_waiting_confirm: "border-orange-400 bg-orange-50",
  risk_confirmed: "border-green-400 bg-green-50",
  worker_timeout: "border-red-400 bg-red-50",
  // External paid API events
  external_created: "border-purple-400 bg-purple-50",
  external_polling: "border-blue-400 bg-blue-50",
  external_completed: "border-green-400 bg-green-50",
  external_failed: "border-red-400 bg-red-50",
  external_timeout: "border-yellow-400 bg-yellow-50",
  external_recover: "border-blue-400 bg-blue-50",
  default: "border-gray-400 bg-gray-50",
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export default function TaskTimeline({ events }: TaskTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-xl mb-2">📋</p>
        <p>No events recorded</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {events.map((event, index) => {
          const icon = eventIcons[event.event_type] || eventIcons.default;
          const colorClass =
            eventColors[event.event_type] || eventColors.default;

          return (
            <div key={event.id || index} className="relative flex gap-4">
              <div
                className={`relative z-10 w-12 h-12 rounded-full ${colorClass} border-2 flex items-center justify-center text-xl shrink-0`}
              >
                {icon}
              </div>

              <div className={`flex-1 rounded-lg p-4 ${colorClass}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {event.message}
                    </h4>
                    {event.agent && (
                      <p className="text-xs text-gray-500 mt-1">
                        Agent: {event.agent}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      View metadata
                    </summary>
                    <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
