import { GitHubIcon, LinkedInIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="footer">
      <span>Built by</span>
      <a href="https://github.com/lindennis5" target="_blank" rel="noreferrer">
        <GitHubIcon /> lindennis5
      </a>
      <a href="https://www.linkedin.com/in/dennisdlin" target="_blank" rel="noreferrer">
        <LinkedInIcon /> dennisdlin
      </a>
    </footer>
  );
}
