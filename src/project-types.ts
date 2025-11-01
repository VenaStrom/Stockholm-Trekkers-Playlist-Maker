export type Episode = {
  id: string;
  filePath: string;
  duration: number; // in seconds
  cachedStartTime: number | null; // in seconds
  cachedEndTime: number | null; // in seconds
};
export const EmptyEpisode: Episode = {
  id: "",
  filePath: "",
  duration: 0,
  cachedStartTime: null,
  cachedEndTime: null,
};

export type Block = {
  id: string;
  options: Record<string, boolean>;
  episodes: Episode[];
};
export const EmptyBlock: Block = {
  id: "",
  options: {},
  episodes: [
    { ...EmptyEpisode },
    { ...EmptyEpisode },
  ],
};

export type Project = {
  id: string;
  date: string;
  description: string | null;
  dateCreated: number; // unix timestamp
  dateModified: number | null; // unix timestamp
  optionsRev: number;
  blocks: Block[];
};
export const EmptyProject: Project = {
  id: "",
  date: "",
  description: null,
  dateCreated: 0,
  dateModified: null,
  optionsRev: 0,
  blocks: [
    { ...EmptyBlock },
  ],
};


export const demoProject: Project = {
  id: "demo-project",
  date: "2025-11-08",
  description: "A demonstration project to showcase features.",
  dateCreated: 1761400984532,
  dateModified: 1761400999349,
  optionsRev: 0, // If mismatched with editor, warn but preserve options if possible
  blocks: [
    {
      id: "block-1",
      options: {
        "option-uuid-1": true,
        "option-uuid-2": false,
        "option-uuid-3": false,
        "option-uuid-4": false,
        "option-uuid-5": true,
      },
      episodes: [
        {
          id: "episode-1",
          filePath: "/path/to/demo-episode.mp3",
          duration: 3600,
          cachedStartTime: null,
          cachedEndTime: null,
        },
        {
          id: "episode-3",
          filePath: "/path/to/demo-episode-3.mp3",
          duration: 3000,
          cachedStartTime: null,
          cachedEndTime: null,
        },
        {
          id: "episode-2",
          filePath: "/path/to/another-demo-episode.mp3",
          duration: 4200,
          cachedStartTime: null,
          cachedEndTime: null,
        }
      ],
    },
    {
      id: "block-2",
      options: {
        "option-uuid-1": false,
        "option-uuid-2": true,
        "option-uuid-3": true,
        "option-uuid-4": false,
        "option-uuid-5": false,
      },
      episodes: [
        {
          id: "episode-4",
          filePath: "/path/to/demo-episode-4.mp3",
          duration: 2400,
          cachedStartTime: null,
          cachedEndTime: null,
        },
        {
          id: "episode-5",
          filePath: "/path/to/demo-episode-5.mp3",
          duration: 1800,
          cachedStartTime: null,
          cachedEndTime: null,
        }
      ],
    },
  ],
};