import { Block } from "@/types";
import { IconDeleteOutline, IconSettingsOutline } from "../icons";

export default function BlockLi({
  block,
  blockIndex,
}: {
  block: Block;
  blockIndex: number;
}) {
  return (
    <li className="bg-abyss-800 px-4 py-2 rounded-sm">
      {/* Header */}
      <div className="h-14 flex flex-row items-center gap-x-4">
        <p>
          Block {blockIndex + 1}
        </p>

        <span className="flex-1"></span>

        {/* Controls */}
        <div className="flex flex-row gap-x-4">
          <button
            className="pe-1.5 ps-2.5 hover:bg-science-500 bg-abyss-200"
          >
            Block options
            <IconSettingsOutline className="inline size-6 ms-0.5" />
          </button>

          <button
            className="pe-1.5 ps-2.5 hover:bg-red-alert-500 bg-abyss-200"
          >
            Delete block
            <IconDeleteOutline className="inline size-6 ms-0.5" />
          </button>
        </div>
      </div>

      <hr className="h-0.5 opacity-50" />

      <div className="pt-3">
        <div className="flex flex-row gap-x-6 *:text-sm items-center ps-1">
          <span className="w-6"></span>
          <span className="w-[6ch]">Start</span>
          <span className="w-[7ch]">Duration</span>
        </div>
        {/*
         * Episodes are portaled into the block's episode container by `EpisodeLi`.
         * We render an empty list element with a stable id that episodes can target.
         * Episodes themselves are mounted once at the Editor level and moved via portals
         * so they are not reconstructed when moving between blocks.
         */}
        <ul id={`block-episodes-${block.id}`} className="flex flex-col gap-y-2 pb-3 pt-1"></ul>
      </div>
    </li>
  );
}