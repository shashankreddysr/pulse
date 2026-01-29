import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <strong>Pulse</strong> · Video Sensitivity Dashboard
      </div>
      <div>
        Contact us:{" "}
        <a href="mailto:pulse@gmail.com">pulse@gmail.com</a>
        {" · "}
        <a
          href="https://www.linkedin.com/in/yourlinkedin/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
};

export default Footer;