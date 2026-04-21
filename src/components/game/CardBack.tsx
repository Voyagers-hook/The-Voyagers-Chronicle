import logo from "@/assets/logo.png";

export const CardBack = ({ onClick }: { onClick?: () => void }) => (
  <div className="card-back" onClick={onClick} role="button" aria-label="Unopened card — tap to reveal">
    <div className="seal">
      <img src={logo} alt="" className="seal-logo" />
    </div>
    <div className="tap-cta">Tap to reveal</div>
  </div>
);
