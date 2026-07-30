import React from "react";
import "../styles/spinner.css";

const Spinner = ({ label = "Loading...", fullPage = false }) => {
  return (
    <div
      className={
        fullPage ? "spinner-wrapper spinner-fullpage" : "spinner-wrapper"
      }
    >
      <div className="spinner" />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
};

export default Spinner;
