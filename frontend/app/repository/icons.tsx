import { FiFileText, FiClipboard, FiCheckSquare, FiMic, FiVideo, FiUser } from "react-icons/fi";

export const DocumentIcons: { [key: string]: JSX.Element } = {
  "Research Report": <FiFileText size={20} color="#2e7d32" />,
  "Study Plan": <FiClipboard size={20} color="#2e7d32" />,
  "Screener": <FiCheckSquare size={20} color="#2e7d32" />,
  "Transcript": <FiMic size={20} color="#2e7d32" />,
  "Stimulus": <FiVideo size={20} color="#2e7d32" />,
};

export const DemographicsIcon = <FiUser size={20} color="#2e7d32" />;
