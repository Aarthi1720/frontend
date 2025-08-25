import { Contact } from "lucide-react";
import React from "react";

const EmergencyContactCard = ({ contact }) => {
  const hasAny =
    contact?.name || contact?.phone || contact?.role || contact?.availableHours;
  if (!hasAny) return null;

  const label = contact?.role ? contact.role : "Emergency Contact";
  const name = contact?.name || "On-duty Manager";
  const phone = contact?.phone;
  const hours = contact?.availableHours
    ? `Hours: ${contact.availableHours}`
    : null;

  return (
    <div
      style={{
        marginTop: "8px",
        padding: "12px",
        backgroundColor: "#f3f4f6",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
      }}
    >
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
        }}
      >
        <Contact style={{ width: "20px", height: "20px", color: "#0D9488" }} />
        Contact:
      </h2>

      <p
        style={{
          fontWeight: 600,
          color: "#1f2937",
          fontSize: "14px",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>

      <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.5 }}>
        <span style={{ fontWeight: 500 }}>{name}</span>
        {" · "}
        {phone ? (
          <a
            href={`tel:${phone}`}
            style={{ color: "#0D9488", textDecoration: "underline" }}
          >
            {phone}
          </a>
        ) : (
          "Front desk will provide"
        )}
        {hours && (
          <>
            {" · "}
            {hours}
          </>
        )}
      </p>
    </div>
  );
};

export default EmergencyContactCard;
