export type Agent = {
  id: string;
  name: string;
  role: string;
  image: string;
  color: string;
  tasks: string;
  resultLabel: string;
  result: string;
};
export const agents: Agent[] = [
  {
    id: "steve",
    name: "Steve",
    role: "Sales Agent",
    image: "/profile.png",
    color: "#5B9CD5",
    tasks: "12",
    resultLabel: "Success Rate",
    result: "92%",
  },
  {
    id: "cassie",
    name: "Cassie",
    role: "Support Agent",
    image: "/cassie.png",
    color: "#06B6D4",
    tasks: "18",
    resultLabel: "Success Rate",
    result: "95%",
  },
  {
    id: "vizzy",
    name: "Vizzy",
    role: "Operations Agent",
    image: "/vizzy.png",
    color: "#D24FC7",
    tasks: "15",
    resultLabel: "AVG. Time",
    result: "3h 20m",
  },
  {
    id: "dexter",
    name: "Dexter",
    role: "Strategy Agent",
    image: "/dexter.png",
    color: "#5B7FF0",
    tasks: "9",
    resultLabel: "AVG. Time",
    result: "5h 50m",
  },
  {
    id: "havi",
    name: "Havi",
    role: "Design Agent",
    image: "/havi.png",
    color: "#F59E0B",
    tasks: "20",
    resultLabel: "Success Rate",
    result: "98%",
  },
  {
    id: "soshie",
    name: "Soshie",
    role: "Marketing Agent",
    image: "/shshie.png",
    color: "#10B981",
    tasks: "14",
    resultLabel: "Success Rate",
    result: "96%",
  },
];
