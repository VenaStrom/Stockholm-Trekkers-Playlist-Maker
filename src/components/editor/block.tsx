import { Block } from "../../project-types";

export default function BlockLi({
  block,
  blockIndex,
}: {
  block: Block;
  blockIndex: number;
}) {
  return (
    <li className="bg-abyss-800 h-36 px-4 py-2 rounded-sm">
      {blockIndex + 1}

    </li>
  );
}