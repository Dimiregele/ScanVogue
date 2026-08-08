"use client";

import { useTransition } from "react";
import { updateComplaintStatus } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  new: "Nouă",
  read: "Citită",
  resolved: "Rezolvată",
};

const STATUS_COLOR: Record<string, string> = {
  new: "#E0A88C",
  read: "#C6A15B",
  resolved: "#8FD3A0",
};

export default function ComplaintStatusButton({
  complaintId,
  status,
}: {
  complaintId: string;
  status: "new" | "read" | "resolved";
}) {
  const [isPending, startTransition] = useTransition();

  const nextStatus: "new" | "read" | "resolved" =
    status === "new" ? "read" : status === "read" ? "resolved" : "new";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => updateComplaintStatus(complaintId, nextStatus))}
      style={{
        fontSize: 11,
        padding: "5px 10px",
        borderRadius: 999,
        border: "1px solid",
        background: "transparent",
        cursor: isPending ? "default" : "pointer",
        opacity: isPending ? 0.6 : 1,
        color: STATUS_COLOR[status],
        borderColor: STATUS_COLOR[status] + "59",
        whiteSpace: "nowrap",
      }}
      title={`Apasă ca să marchezi drept „${STATUS_LABEL[nextStatus]}”`}
    >
      {isPending ? "..." : STATUS_LABEL[status]}
    </button>
  );
}
