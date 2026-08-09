import { Fragment } from "react";
import { clipsForPlacement, optionKey, type BlockPlacement } from "@/functions/block-options";
import type { Block } from "@/types";

const OptionGroups: { placement: BlockPlacement; title: string; }[] = [
  { placement: "leading", title: "Leading Clips" },
  { placement: "trailing", title: "Trailing Clips" },
];

/**
 * Grouped checkbox list over the clip catalog, styled after the v3 options dropdown.
 * Used both for a block's options and for the user's default options in settings.
 */
export default function BlockOptionsEditor({
  options,
  onToggle,
}: {
  options: Block["options"];
  onToggle: (key: string, checked: boolean) => void;
}) {
  const groups = OptionGroups.filter(({ placement }) => clipsForPlacement(placement).length > 0);

  return (
    <div className="flex flex-col gap-y-4 min-w-64">
      {groups.map(({ placement, title }, groupIndex) => (
        <Fragment key={placement}>
          {groupIndex > 0 && <hr className="h-px w-full border-0 border-t border-abyss-200" />}

          <div>
            <p className="text-lg pb-2">{title}</p>
            <div className="flex flex-row flex-wrap gap-x-10 gap-y-2 ps-2">
              {clipsForPlacement(placement).map((clip) => {
                const key = optionKey(placement, clip.id);
                return (
                  <label
                    key={key}
                    className="group flex flex-row items-center gap-x-2 text-sm font-thin cursor-pointer select-none"
                    title={clip.description}
                  >
                    <span>{clip.name}</span>
                    <input
                      type="checkbox"
                      className={placement === "leading" ? "" : "[--checkbox-color:var(--color-spore-500)]"}
                      checked={options[key] ?? false}
                      onChange={(e) => onToggle(key, e.target.checked)}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
