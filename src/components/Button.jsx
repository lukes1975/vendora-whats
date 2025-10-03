/* eslint-disable react/prop-types */
import { Marker } from "./Marker.jsx";

const Button = ({
  icon,
  children,
  href,
  containerClassName,
  onClick,
  markerFill,
  variant = "primary",
}) => {
  const Inner = () => (
    <>
      <span className={`relative flex items-center min-h-[60px] px-4 rounded-2xl inner-before group-hover:before:opacity-100 overflow-hidden ${
        variant === "outline" 
          ? "border-2 border-p1 bg-transparent hover:bg-p1/10" 
          : "g4"
      }`}>
        <span className="absolute -left-[1px]">
          <Marker markerFill={markerFill} />
        </span>

        {icon && (
          <img
            src={icon}
            alt="circle"
            className="size-10 mr-5 object-contain z-10"
          />
        )}

        <span className={`relative z-2 font-poppins base-bold uppercase ${
          variant === "outline" 
            ? "text-p1 group-hover:text-white" 
            : "text-p1"
        }`}>
          {children}
        </span>
      </span>

      {variant === "primary" && <span className="glow-before glow-after" />}
    </>
  );
  return href ? (
    <a
      className={`
        relative p-0.5 rounded-2xl group transition-all duration-300 hover:scale-105
        ${variant === "outline" 
          ? "border-2 border-p1/50 hover:border-p1 hover:shadow-lg hover:shadow-p1/25" 
          : "g5 shadow-500"
        }
        ${containerClassName}
      `}
      href={href}
    >
      <Inner />
    </a>
  ) : (
    <button
      className={`
        relative p-0.5 rounded-2xl group transition-all duration-300 hover:scale-105
        ${variant === "outline" 
          ? "border-2 border-p1/50 hover:border-p1 hover:shadow-lg hover:shadow-p1/25" 
          : "g5 shadow-500"
        }
        ${containerClassName}
      `}
      onClick={onClick}
    >
      <Inner />
    </button>
  );
};
export default Button;
