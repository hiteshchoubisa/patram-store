import Link from "next/link";
import { useCallback } from "react";
import { FaWhatsapp } from "react-icons/fa";

const SUPPORT_PHONE_E164 = "+918107514654"; // +91-8107514654

export default function WhatsAppSupportBadge() {
  const href = useCallback(
    () => `https://wa.me/${SUPPORT_PHONE_E164.replace("+", "")}?text=${encodeURIComponent("Hi, I need help with my order.")}`,
    []
  );

  return (
    <div
      aria-label="WhatsApp support"
      className="fixed right-4 bottom-6 z-50"
    >
      <Link
        href={href()}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 bg-green-500 text-white px-2 py-2 rounded-full shadow-lg hover:bg-green-600 transition"
      >
        <FaWhatsapp className="text-xl" aria-hidden="true" />
        
      </Link>
    </div>
  );
}