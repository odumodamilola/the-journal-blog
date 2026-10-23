import { categoryDetails } from "@/lib/editorial";

/** Original vector artwork. No third-party image or invented article content. */
export function CategoryArtwork({
  category,
  className = "",
}: {
  category: string;
  className?: string;
}) {
  const motif = categoryDetails[category]?.motif || "notes";
  return (
    <div
      className={`category-art category-art-${motif} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 300" fill="none" focusable="false">
        <path
          d="M0 75H400M0 150H400M0 225H400M100 0V300M200 0V300M300 0V300"
          stroke="currentColor"
          opacity=".12"
        />
        {motif === "technology" ? (
          <>
            <rect
              x="120"
              y="70"
              width="160"
              height="160"
              rx="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="145"
              y="95"
              width="110"
              height="110"
              rx="4"
              fill="currentColor"
              opacity=".2"
            />
            <path
              d="M165 35V70M200 35V70M235 35V70M165 230V265M200 230V265M235 230V265M85 115H120M85 150H120M85 185H120M280 115H315M280 150H315M280 185H315"
              stroke="currentColor"
              strokeWidth="3"
            />
            <circle cx="200" cy="150" r="30" stroke="currentColor" />
          </>
        ) : motif === "engineering" ? (
          <>
            <path
              d="M145 95L90 150L145 205M255 95L310 150L255 205M220 65L180 235"
              stroke="currentColor"
              strokeWidth="6"
            />
            <rect
              x="55"
              y="35"
              width="290"
              height="230"
              rx="10"
              stroke="currentColor"
              opacity=".3"
            />
          </>
        ) : motif === "tutorials" ? (
          <>
            <rect
              x="85"
              y="70"
              width="145"
              height="160"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="170"
              y="100"
              width="145"
              height="160"
              rx="4"
              fill="currentColor"
              opacity=".2"
            />
            <path
              d="M115 105H195M115 130H180M205 145H280M205 170H270M205 195H250"
              stroke="currentColor"
              strokeWidth="3"
            />
            <circle cx="290" cy="65" r="18" stroke="currentColor" />
          </>
        ) : motif === "career" ? (
          <>
            <path
              d="M80 235H145V185H210V130H275V70H330"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M300 40L330 70L300 100"
              stroke="currentColor"
              strokeWidth="3"
            />
            <circle cx="110" cy="105" r="35" fill="currentColor" opacity=".2" />
            <circle cx="190" cy="65" r="18" stroke="currentColor" />
          </>
        ) : motif === "world" ? (
          <>
            <circle
              cx="200"
              cy="150"
              r="100"
              stroke="currentColor"
              strokeWidth="2"
            />
            <ellipse cx="200" cy="150" rx="50" ry="100" stroke="currentColor" />
            <path
              d="M100 150H300M115 100H285M115 200H285M200 50V250"
              stroke="currentColor"
            />
            <circle cx="260" cy="110" r="10" fill="currentColor" />
          </>
        ) : (
          <>
            <path
              d="M200 90C160 70 120 70 80 85V230C120 215 160 215 200 235C240 215 280 215 320 230V85C280 70 240 70 200 90Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M200 90V235M110 120L170 125M110 150L170 155M230 125L290 120M230 155L290 150"
              stroke="currentColor"
            />
            <circle cx="300" cy="45" r="18" fill="currentColor" opacity=".25" />
          </>
        )}
      </svg>
      <span>{categoryDetails[category]?.note || "A new perspective"}</span>
    </div>
  );
}
