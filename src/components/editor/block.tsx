import { useState } from "react";
import { PowerKey } from "@/global";
import { allOptionEntries } from "@/functions/block-options";
import type { Block, Project } from "@/types";
import { usePageContext } from "@/components/page-context";
import { IconDeleteForeverOutline, IconDeleteOutline, IconDragIndicator } from "@/components/icons";
import Dialog from "@/components/dialog";
import BlockOptionsEditor from "@/components/editor/block-options-editor";
import { PopoverContainer, PopoverContent, PopoverTrigger } from "@/components/popover";
import { parseBlockTime } from "@/functions/project/time-parser";

/** 
 * I don't like this, but this is very convenient to keep the UI prettier during drag-and-drop
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window { __st_drag?: string | null; }
}

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
  const { isPowerMode } = usePageContext();

  const [isDragOver, setDragOver] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState<string | null>(block.startTime || null);

  const updateProject = (updater: (project: Project) => Project) => {
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;
      return updater(prevProject);
    });
  };
  const updateBlock = (updatedFields: Partial<Block>) => {
    updateProject((project) => {
      const updatedBlocks = project.blocks.map(b => b.id === block.id ? { ...b, ...updatedFields } : b);
      return { ...project, blocks: updatedBlocks };
    });
  };

  const moveBlock = (proj: Project, fromIndex: number, toIndex: number): Project => {
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
      const id = ep.blockID;
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
  const deleteBlock = (blockID: string) => {
    updateProject((project) => {
      const updatedBlocks = project.blocks.filter(b => b.id !== blockID);
      const updatedEpisodes = project.episodes.filter(e => e.blockID !== blockID);
      return { ...project, blocks: updatedBlocks, episodes: updatedEpisodes };
    });
  };
  const handleDeleteBlock = () => {
    if (isPowerMode) {
      deleteBlock(block.id);
      return;
    }
    setDeleteDialogVisible(true);
  };

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", `block:${block.id}`);
    window.__st_drag = `block:${block.id}`; // To keep track of if moving a block or episode
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragEnd = () => {
    window.__st_drag = null;
    setDragOver(false);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedText: string = ((window.__st_drag ?? e.dataTransfer.getData("text/plain")) || "");
    if (!draggedText.startsWith("block:")) {
      // Not a block drag, ignore to avoid cross-highlighting
      setDragOver(false);
      return;
    }
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedText: string = ((window.__st_drag ?? e.dataTransfer.getData("text/plain")) || "");
    if (!draggedText.startsWith("block:")) return;
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedText = (window.__st_drag ?? e.dataTransfer.getData("text/plain")) || "";
    if (!draggedText.startsWith("block:")) return;

    setDragOver(false);

    const draggedID = draggedText.split(":")[1];
    if (!draggedID || draggedID === block.id) return;

    updateProject((project) => {
      const draggedIndex = project.blocks.findIndex(b => b.id === draggedID);
      const dropIndex = project.blocks.findIndex(b => b.id === block.id);
      if (draggedIndex === -1 || dropIndex === -1) {
        console.warn(`[BlockLi onDrop] Could not find blocks with ids ${draggedID} or ${block.id}`);
        return project;
      }

      return moveBlock(project, draggedIndex, dropIndex);
    });

    window.__st_drag = null;

    // Focus and scroll li into view (not thumb)
    setTimeout(() => {
      const li = document.getElementById(`block-${block.id}`);
      if (!(li instanceof HTMLElement)) return;
      li.tabIndex = 0;
      li.focus();
      li.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };
  const moveBlockUpOne = () => {
    updateProject((project) => {
      const thisIndex = project.blocks.findIndex(b => b.id === block.id);
      if (thisIndex <= 0) return project;
      return moveBlock(project, thisIndex, thisIndex - 1);
    });


    setTimeout(() => {
      const li = document.getElementById(`block-${block.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector(`[draggable="true"]`);
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };
  const moveBlockDownOne = () => {
    updateProject((project) => {
      const thisIndex = project.blocks.findIndex(b => b.id === block.id);
      if (thisIndex === -1 || thisIndex >= project.blocks.length - 1) return project;
      return moveBlock(project, thisIndex, thisIndex + 1);
    });

    setTimeout(() => {
      const li = document.getElementById(`block-${block.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector(`[draggable="true"]`);
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  return (<>
    {/* Delete dialog */}
    <Dialog
      visible={deleteDialogVisible}
      setVisible={setDeleteDialogVisible}
      dialogHeader={<p className="text-lg">Delete Block {blockIndex}</p>}
      dialogContent={<div>
        <p>
          This will delete a block with {(() => {
            const epCount = volatileProject?.episodes.filter(e => e.blockID === block.id).length ?? 0;
            return epCount === 1 ? "1 episode" : `${epCount} episodes`;
          })()}. Are you sure?
        </p>

        <p className="text-sm text-flare-500/60 pt-3">
          Hint:
          <br />
          For quicker deletions, hold the [{PowerKey}] key while clicking the delete button to skip this dialog.
        </p>
      </div>}
      buttons={[
        <button key={"cancel-button"} onClick={() => setDeleteDialogVisible(false)} >
          Cancel
        </button>,
        <button
          data-focus="true"
          key={"delete-button"}
          className="gap-x-1 pe-1 bg-red-alert-500 hover:bg-red-alert-700"
          onClick={() => { deleteBlock(block.id); setDeleteDialogVisible(false); }}
        >
          Delete
          <IconDeleteOutline className="inline size-6" />
        </button>,
      ]}
    />

    <li
      id={`block-${block.id}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`bg-abyss-900 px-4 py-2 rounded-sm ${isDragOver
        ? "ring-2 ring-science-500/60 rounded-sm"
        : ""}`
      }
    >
      {/* Header */}
      <div className="h-12 flex flex-row items-center gap-x-4">
        <p>Block {blockIndex + 1}</p>

        {/* Block start time */}
        <label>
          <input
            aria-label="block start time in format --:--"
            className="bg-abyss-500 w-[6ch] text-center"
            type="text"
            placeholder="--:--"
            value={blockStartTime ?? ""}
            onChange={e => setBlockStartTime(e.target.value || null)}
            onBlur={e => {
              setBlockStartTime(parseBlockTime(e.target.value));
              updateBlock({ startTime: parseBlockTime(e.target.value) });
            }}
          />
        </label>

        {/* Block options (leading/trailing clips): one dot per catalog option, lit when enabled */}
        <PopoverContainer>
          <PopoverTrigger>
            <span className="inline-flex flex-row items-center gap-x-1 me-2 align-middle">
              {allOptionEntries().map(({ key, placement, clip }) => (
                <span
                  key={key}
                  title={`${clip.name} (${placement})`}
                  className={`
                    inline-block size-4.5 rounded-sm border-2 border-abyss-800
                    ${block.options[key]
                      ? placement === "leading" ? "bg-science-500" : "bg-spore-500"
                      : "bg-abyss-500"}
                  `}
                ></span>
              ))}
            </span>
            Options
          </PopoverTrigger>
          <PopoverContent>
            <BlockOptionsEditor
              options={block.options}
              onToggle={(key, checked) => updateBlock({ options: { ...block.options, [key]: checked } })}
            />
          </PopoverContent>
        </PopoverContainer>

        <span className="flex-1"></span>

        {/* Controls */}
        <div className="flex flex-row gap-x-4 items-center">
          <label>
            <button
              className="€icon hover:text-red-alert-500"
              onClick={handleDeleteBlock}
              title={isPowerMode ? "Delete block instantly" : "Delete block"}
            >
              {isPowerMode
                ? <IconDeleteForeverOutline className="size-6 animate-shiver origin-bottom" />
                : <IconDeleteOutline className="size-6" />
              }
            </button>
          </label>

          {/* Drag thumb */}
          <span
            draggable
            className={`cursor-grab ms-2 text-flare-700 hover:opacity-80 transition-all`}
            aria-label="Drag to reorder block"
            title="Drag to reorder block"
            tabIndex={0}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
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
          >
            <IconDragIndicator className="size-6" />
          </span>
        </div>
      </div>

      <hr className="h-px border-0 border-t border-abyss-200" />

      <div className="pt-3">
        <div className="flex flex-row gap-x-6 *:text-sm items-center ps-1">
          <span className="w-[6ch]">Start</span>
          <span className="w-[7ch]">Duration</span>
          <span className="w-[4ch] ps-1">Encoding</span>
        </div>
        <ul className="flex flex-col gap-y-2 pb-3 pt-1">
          {children}
        </ul>
      </div>
    </li>
  </>);
}