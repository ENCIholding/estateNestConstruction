import React from "react";

type ManagementBudgetItemFormProps = {
  open?: boolean;
  onClose?: () => void;
  onSaved?: () => void;
  item?: any;
  budgetItem?: any;
  projectId?: string;
  [key: string]: any;
};

export default function ManagementBudgetItemForm(
  props: ManagementBudgetItemFormProps
) {
  const { open = false, onClose, onSaved } = props;

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "12px" }}>
          Budget Item Form
        </h2>

        <p style={{ marginBottom: "20px", color: "#555" }}>
          Temporary placeholder form added to restore build. Final budget form
          logic still needs to be rebuilt.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onSaved?.();
              onClose?.();
            }}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
