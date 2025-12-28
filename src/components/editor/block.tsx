import { useState } from "react";
import { Block, Project } from "@/types";
import { IconDeleteOutline, IconSettingsOutline, IconDragIndicator } from "@/components/icons";

export default function BlockLi({
  block,
  blockIndex,
  children,
  project: volatileProject,
  projectSetter: setVolatileProject,
}: {
  block: Block;
  blockIndex: number;
  children: React.ReactNode;
  project: Project | null;
  projectSetter: React.Dispatch<React.SetStateAction<Project | null>>;
}) {
  const [isDragOver, setDragOver] = useState(false);

  const moveBlock = (proj: Project, fromIndex: number, toIndex: number) => {
    const blocksCopy = [...proj.blocks];
    const [moved] = blocksCopy.splice(fromIndex, 1);
    if (!moved) {
      console.warn(`[MoveBlock] No block found at index ${fromIndex}`);
      return proj;
    }
    blocksCopy.splice(toIndex, 0, moved);

    // Rebuild episodes array to preserve clumping by block in new block order
    const episodesByBlock: Record<string, typeof proj.episodes> = {};
    for (const ep of proj.episodes) {
      const id = ep.blockId;
      episodesByBlock[id] ??= [];
      episodesByBlock[id].push(ep);
    }

    const reorderedEpisodes: typeof proj.episodes = [];
    for (const b of blocksCopy) {
      const eps = episodesByBlock[b.id] ?? [];
      reorderedEpisodes.push(...eps);
    }

    return { ...proj, blocks: blocksCopy, episodes: reorderedEpisodes };
  };

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", block.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    setDragOver(false);
    if (!draggedId || draggedId === block.id) return;
    if (!setVolatileProject || !volatileProject) return;

    const blocksCopy = [...volatileProject.blocks];
    const draggedIndex = blocksCopy.findIndex(b => b.id === draggedId);
    const dropIndex = blocksCopy.findIndex(b => b.id === block.id);
    if (draggedIndex === -1 || dropIndex === -1) return;

    const updated = moveBlock(volatileProject, draggedIndex, dropIndex);
    setVolatileProject(updated);

    // focus and scroll into view
    setTimeout(() => {
      const li = document.getElementById(`block-${block.id}`);
      if (!(li instanceof HTMLElement)) return;
      li.tabIndex = 0;
      li.focus();
      li.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const fucusThumb = (li: HTMLElement | null) => {
    setTimeout(() => {
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector(`[draggable="true"]`);
      const focusEl = thumb instanceof HTMLElement ? thumb : li; // Fallback to li if no thumb found
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const moveBlockUpOne = () => {
    if (!volatileProject) return;

    const thisIndex = volatileProject.blocks.findIndex(b => b.id === block.id);
    if (thisIndex <= 0) return;

    setVolatileProject(prev => prev ? moveBlock(prev, thisIndex, thisIndex - 1) : prev);

    fucusThumb(document.getElementById(`block-${block.id}`));
  };

  const moveBlockDownOne = () => {
    if (!volatileProject) return;

    const thisIndex = volatileProject.blocks.findIndex(b => b.id === block.id);
    if (thisIndex === -1 || thisIndex >= volatileProject.blocks.length - 1) return;

    setVolatileProject(prev => prev ? moveBlock(prev, thisIndex, thisIndex + 1) : prev);

    fucusThumb(document.getElementById(`block-${block.id}`));
  };

  return (
    <li id={`block-${block.id}`} className={`bg-abyss-800 px-4 py-2 rounded-sm ${isDragOver ? "ring-2 ring-science-500/60 rounded-sm" : ""}`}>
      {/* Header */}
      <div className="h-14 flex flex-row items-center gap-x-4">
        <p>
          Block {blockIndex + 1}
        </p>

        <span className="flex-1"></span>

        {/* Controls */}
        <div className="flex flex-row gap-x-4 items-center">
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

          {/* Drag thumb for blocks */}
          <span
            draggable
            className={`cursor-grab ms-2 text-flare-700 hover:opacity-80 transition-all`}
            aria-label="Drag to reorder block"
            title="Drag to reorder block"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                moveBlockUpOne();
              }
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                moveBlockDownOne();
              }
            }}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
          >
            <IconDragIndicator className="size-6" />
          </span>
        </div>
      </div>

      <hr className="h-0.5 opacity-50" />

      <div className="pt-3">
        <div className="flex flex-row gap-x-6 *:text-sm items-center ps-1">
          <span className="w-6"></span>
          <span className="w-[6ch]">Start</span>
          <span className="w-[7ch]">Duration</span>
        </div>
        <ul className="flex flex-col gap-y-2 pb-3 pt-1">
          {children}
        </ul>
      </div>
    </li>
  );
}