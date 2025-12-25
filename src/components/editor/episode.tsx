import { useMemo, useState } from "react";
import { Episode, Project } from "@/types";
import { IconDeleteOutline, IconDragIndicator, IconFolderOutline } from "../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { secondsToTimeString } from "../../functions/time-format";

export default function EpisodeLi({
  episode,
  projectSetter: setVolatileProject,

}: {
  episode: Episode;
  projectSetter: React.Dispatch<React.SetStateAction<Project | null>>;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(episode.filePath ?? null);

  const onFileChange = () => {
    const handleFileSelection = async () => {
      const filePath = await open({
        multiple: false,
        directory: false,
        filters: [
          { name: "Video Files", extensions: ["wav", "mp4", "mov", "avi", "mkv", "gif"], },
          { name: "Audio Files", extensions: ["mp3", "aac", "flac", "wav", "ogg", "m4a"], },
          { name: "Image Files", extensions: ["png", "jpg", "jpeg", "gif", "bmp", "tiff"], },
          { name: "All Files", extensions: ["*"] },
        ],
        title: "Select Episode Media File",
      });

      if (!filePath || typeof filePath !== "string") {
        console.warn("Canceled file selection");
        // Unset selected file if selection was canceled
        setSelectedFile(null);
      }
      else {
        setSelectedFile(filePath);
      }

      const newEpisode: Episode = {
        ...episode,
        filePath: filePath ?? undefined,
      };

      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;
        const newEpisodes = prevProject.episodes.map((ep) => ep.id === newEpisode.id ? newEpisode : ep);
        return { ...prevProject, episodes: newEpisodes };
      });
    };

    handleFileSelection()
      .catch((err) => {
        console.error("Error during file selection:", err);
      });
  };

  // Drag handlers
  const [isDragOver, setDragOver] = useState(false);
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", episode.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => {
    setDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    setDragOver(false);
    if (!draggedId || draggedId === episode.id) return;

    // Linked-list aware move: remove dragged from its current chain and insert before target
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const episodesById = new Map(prevProject.episodes.map(ep => [ep.id, { ...ep }]));
      const dragged = episodesById.get(draggedId);
      const target = episodesById.get(episode.id);
      if (!dragged || !target) return prevProject;

      // Find prev of dragged (if any)
      const prevOfDragged = prevProject.episodes.find(ep => ep.nextEpisodeId === draggedId);

      // Remove dragged from its current chain
      if (prevOfDragged) {
        const prevCopy = episodesById.get(prevOfDragged.id)!;
        prevCopy.nextEpisodeId = dragged.nextEpisodeId;
        episodesById.set(prevCopy.id, prevCopy);
      }

      // Inserting dragged before target: find prev of target within target block
      const prevOfTarget = prevProject.episodes.find(ep => ep.nextEpisodeId === target.id && ep.blockId === target.blockId);

      // Update dragged to point to target
      dragged.nextEpisodeId = target.id;
      // Update its blockId to target's block
      dragged.blockId = target.blockId;
      episodesById.set(dragged.id, dragged);

      if (prevOfTarget) {
        const prevCopy = episodesById.get(prevOfTarget.id)!;
        prevCopy.nextEpisodeId = dragged.id;
        episodesById.set(prevCopy.id, prevCopy);
      } else {
        // If there was no prevOfTarget then dragged becomes new head for that block.
        // Nothing else to update here because head is implicit.
      }

      // Produce new episodes array preserving original array entries order (but updated objects)
      const newEpisodes = prevProject.episodes.map(ep => episodesById.get(ep.id) ?? ep);
      return { ...prevProject, episodes: newEpisodes };
    });
    // After state update, ensure the moved episode is visible and focused
    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector('[draggable="true"]');
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      // ensure focusable
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const moveEpisodeUpOne = () => {
    // Move earlier in the linked list, jumping to previous block if at head
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      // helper: build block order by linked nextBlockId
      const blocksById = new Map(prevProject.blocks.map(b => [b.id, b]));
      const pointedBlocks = new Set(prevProject.blocks.map(b => b.nextBlockId).filter(Boolean) as string[]);
      const heads = prevProject.blocks.filter(b => !pointedBlocks.has(b.id));
      const orderedBlocks: typeof prevProject.blocks = [];
      for (const head of heads) {
        let curB: typeof head | undefined = head;
        const seenB = new Set<string>();
        while (curB && !seenB.has(curB.id)) {
          orderedBlocks.push(curB);
          seenB.add(curB.id);
          const nextId: string | undefined = curB.nextBlockId;
          curB = nextId ? blocksById.get(nextId) : undefined;
        }
      }
      for (const b of prevProject.blocks) if (!orderedBlocks.find(x => x.id === b.id)) orderedBlocks.push(b);

      const episodesById = new Map(prevProject.episodes.map(ep => [ep.id, { ...ep }]));
      const cur = episodesById.get(episode.id);
      if (!cur) return prevProject;

      // find previous (may be in any block)
      const prev = prevProject.episodes.find(ep => ep.nextEpisodeId === episode.id);
      if (prev) {
        // usual within-block move (swap cur and prev positions)
        const prevPrev = prevProject.episodes.find(ep => ep.nextEpisodeId === prev.id);
        const curCopy = episodesById.get(cur.id)!;
        const prevCopy = episodesById.get(prev.id)!;

        // detach cur
        prevCopy.nextEpisodeId = curCopy.nextEpisodeId;

        // insert cur before prev
        curCopy.nextEpisodeId = prevCopy.id;
        // if prev is in a different block, cur moves into prev's block
        if (prevCopy.blockId && prevCopy.blockId !== curCopy.blockId) curCopy.blockId = prevCopy.blockId;
        if (prevPrev) {
          const prevPrevCopy = episodesById.get(prevPrev.id)!;
          prevPrevCopy.nextEpisodeId = curCopy.id;
          episodesById.set(prevPrevCopy.id, prevPrevCopy);
        }

        episodesById.set(prevCopy.id, prevCopy);
        episodesById.set(curCopy.id, curCopy);

        const newEpisodes = prevProject.episodes.map(ep => episodesById.get(ep.id) ?? ep);
        return { ...prevProject, episodes: newEpisodes };
      }

      // no prev -> cur is head of its block. Jump to previous block's tail if exists
      const blockIndex = orderedBlocks.findIndex(b => b.id === cur.blockId);
      if (blockIndex <= 0) return prevProject; // no previous block

      const prevBlock = orderedBlocks[blockIndex - 1];
      if (!prevBlock) return prevProject;
      // find tail of prevBlock (episode with undefined nextEpisodeId in that block)
      const tail = prevProject.episodes.find(ep => ep.blockId === prevBlock.id && (ep.nextEpisodeId == null));

      // remove cur from current chain: find prevOfCur (if any)
      const prevOfCur = prevProject.episodes.find(ep => ep.nextEpisodeId === cur.id);
      if (prevOfCur) {
        const prevOfCurCopy = episodesById.get(prevOfCur.id)!;
        prevOfCurCopy.nextEpisodeId = cur.nextEpisodeId;
        episodesById.set(prevOfCurCopy.id, prevOfCurCopy);
      }

      // update cur to append to tail of prevBlock
      const curCopy = episodesById.get(cur.id)!;
      curCopy.blockId = prevBlock.id;
      curCopy.nextEpisodeId = undefined;
      episodesById.set(curCopy.id, curCopy);

      if (tail) {
        const tailCopy = episodesById.get(tail.id)!;
        tailCopy.nextEpisodeId = curCopy.id;
        episodesById.set(tailCopy.id, tailCopy);
      }

      const newEpisodes = prevProject.episodes.map(ep => episodesById.get(ep.id) ?? ep);
      return { ...prevProject, episodes: newEpisodes };
    });
    // keep moved episode in view / focused
    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector('[draggable="true"]');
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const moveEpisodeDownOne = () => {
    // Move later in linked list; if at tail, jump to head of next block
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      // build ordered blocks
      const blocksById = new Map(prevProject.blocks.map(b => [b.id, b]));
      const pointedBlocks = new Set(prevProject.blocks.map(b => b.nextBlockId).filter(Boolean) as string[]);
      const heads = prevProject.blocks.filter(b => !pointedBlocks.has(b.id));
      const orderedBlocks: typeof prevProject.blocks = [];
      for (const head of heads) {
        let curB: typeof head | undefined = head;
        const seenB = new Set<string>();
        while (curB && !seenB.has(curB.id)) {
          orderedBlocks.push(curB);
          seenB.add(curB.id);
          const nextId: string | undefined = curB.nextBlockId;
          curB = nextId ? blocksById.get(nextId) : undefined;
        }
      }
      for (const b of prevProject.blocks) if (!orderedBlocks.find(x => x.id === b.id)) orderedBlocks.push(b);

      const episodesById = new Map(prevProject.episodes.map(ep => [ep.id, { ...ep }]));
      const cur = episodesById.get(episode.id);
      if (!cur) return prevProject;

      const next = prevProject.episodes.find(ep => ep.id === cur.nextEpisodeId);
      if (next) {
        // normal swap with next within same block
        const prev = prevProject.episodes.find(ep => ep.nextEpisodeId === episode.id);
        const nextCopy = episodesById.get(next.id)!;
        const curCopy = episodesById.get(cur.id)!;

        // re-link: prev -> next
        if (prev) {
          const prevCopy = episodesById.get(prev.id)!;
          prevCopy.nextEpisodeId = nextCopy.id;
          episodesById.set(prevCopy.id, prevCopy);
        }

        // cur -> next.next
        curCopy.nextEpisodeId = nextCopy.nextEpisodeId;

        // next -> cur
        nextCopy.nextEpisodeId = curCopy.id;

        // if next is in a different block, move cur into next's block
        if (nextCopy.blockId && nextCopy.blockId !== curCopy.blockId) curCopy.blockId = nextCopy.blockId;

        episodesById.set(curCopy.id, curCopy);
        episodesById.set(nextCopy.id, nextCopy);

        const newEpisodes = prevProject.episodes.map(ep => episodesById.get(ep.id) ?? ep);
        return { ...prevProject, episodes: newEpisodes };
      }

      // no next -> cur is tail. Jump to next block's head
      const blockIndex = orderedBlocks.findIndex(b => b.id === cur.blockId);
      if (blockIndex === -1 || blockIndex >= orderedBlocks.length - 1) return prevProject; // no next block
      const nextBlock = orderedBlocks[blockIndex + 1];
      if (!nextBlock) return prevProject;

      // find head of next block (episode in nextBlock that is not pointed to by other episodes)
      const nextBlockEpisodes = prevProject.episodes.filter(ep => ep.blockId === nextBlock.id);
      const pointed = new Set(nextBlockEpisodes.map(ep => ep.nextEpisodeId).filter(Boolean) as string[]);
      const nextHead = nextBlockEpisodes.find(ep => !pointed.has(ep.id));

      // remove cur from its current chain (find prevOfCur)
      const prevOfCur = prevProject.episodes.find(ep => ep.nextEpisodeId === cur.id);
      if (prevOfCur) {
        const prevOfCurCopy = episodesById.get(prevOfCur.id)!;
        prevOfCurCopy.nextEpisodeId = cur.nextEpisodeId;
        episodesById.set(prevOfCurCopy.id, prevOfCurCopy);
      }

      // insert before nextHead (become head) or if no nextHead, simply become sole episode in next block
      const curCopy = episodesById.get(cur.id)!;
      curCopy.blockId = nextBlock.id;
      if (nextHead) {
        // become head: point to old head
        curCopy.nextEpisodeId = nextHead.id;
        // no prev to update since head
      } else {
        curCopy.nextEpisodeId = undefined;
      }
      episodesById.set(curCopy.id, curCopy);

      const newEpisodes = prevProject.episodes.map(ep => episodesById.get(ep.id) ?? ep);
      return { ...prevProject, episodes: newEpisodes };
    });
    // keep moved episode in view / focused
    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector('[draggable="true"]');
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  // Memoized file name and route for prettier display
  const fileName = useMemo(() => {
    if (!selectedFile) return "No file selected";
    const parts = selectedFile.split(/[/\\]/);
    return parts[parts.length - 1];
  }, [selectedFile]);
  const fileRoute = useMemo(() => {
    if (!selectedFile) return "No file selected";

    // remove file name from path
    const delim = selectedFile.includes("/") ? "/" : "\\";
    const parts = selectedFile.split(/[/\\]/);
    parts.pop();
    return parts.join(delim);

  }, [selectedFile]);
  const delim = useMemo(() => {
    if (!selectedFile) return "/";
    return selectedFile.includes("/") ? "/" : "\\";
  }, [selectedFile]);

  return (
    <li
      className={`w-full flex flex-row items-center ps-1 select-none ${isDragOver ? "ring-2 ring-science-500/60 rounded-sm" : ""}`}
      id={`episode-${episode.id}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      <div className="flex flex-row gap-x-6 items-center pe-10">
        {/* Delete button */}
        <button className="€icon text-flare-700 hover:text-red-alert-500">
          <IconDeleteOutline className="size-6" />
        </button>
        {/* Start time */}
        <span className={`w-[5ch] ${!episode.cachedStartTime ? "text-flare-700" : ""}`}>{episode.cachedStartTime ?? "--:--"}</span>
        {/* Duration */}
        <span className={`w-[7ch] ps-0.5 ${!episode.duration ? "text-flare-700" : ""}`}>{episode.duration ? secondsToTimeString(episode.duration) : "-"}</span>
      </div>

      {/* Custom file input */}
      <label className="bg-abyss-500 rounded-sm flex flow-row items-center justify-between gap-x-4 ps-3 flex-1">
        <div className="flex-1 min-w-0">
          <span style={{ direction: "rtl" }} className="block overflow-hidden text-start">
            <span style={{ direction: "ltr" }} className={`truncate inline-block align-middle ${selectedFile ? "" : "text-flare-700"}`}>
              {selectedFile ?
                <><span className="text-flare-700">{fileRoute}{delim}</span>{fileName}</>
                : "No file selected"}
            </span>
          </span>
        </div>

        <button
          className="bg-abyss-200 hover:bg-spore-500 ps-3"
          onClick={onFileChange}
        >
          Select file
          <IconFolderOutline className="inline size-6 ms-0.5" />
        </button>
      </label>

      {/* Drag thumb */}
      <span
        draggable
        onDragStart={onDragStart}
        className={`cursor-grab ms-3 text-flare-700 hover:opacity-80 transition-all`}
        aria-label="Drag to reorder"
        title="Drag to reorder"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            moveEpisodeUpOne();
          }
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            moveEpisodeDownOne();
          }
        }}
      >
        <IconDragIndicator className="size-6" />
      </span>
    </li>
  );
}