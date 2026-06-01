import "../styles/card.css";

function Card({ title, value, subtitle, subtitleColor }) {
  return (
    <div className="card">
      <h3>{title}</h3>

      <p>{value}</p>

      {subtitle && (
        <small
          style={{
            color: subtitleColor || "#666",
          }}
        >
          {subtitle}
        </small>
      )}
    </div>
  );
}

export default Card;
