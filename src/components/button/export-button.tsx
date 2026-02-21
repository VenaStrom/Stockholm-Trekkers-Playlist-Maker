import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { exportProject } from "@/functions/project";
import { IconFileExportOutline } from "@/components/icons";
import { useToast } from "@/components/toast";
import Dialog from "@/components/dialog";

export default function ExportButton({
  projectID,
}: {
  projectID: string | null;
}) {
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const onExport = () => {
    if (!projectID) {
      toast("No project data to export.");
      return;
    }
    open({
      directory: true,
      title: "Select export location. A folder with the project's name will be created here.",
      canCreateDirectories: true,
      recursive: true, // Needed to mkdir and copy things here
    }).then((path) => {
      if (!path) {
        toast("Export cancelled.");
        return;
      }

      setIsModalOpen(true);
      exportProject(projectID, path)
        .then((res) => {
          console.log(res);
        })
        .catch(e => {
          console.error("Error exporting project:", e);
        });
    })
      .catch(e => {
        console.error("Error opening save dialog:", e);
        toast("Failed to open save dialog. Please try again.");
      });
  };

  return (<>
    <Dialog
      visible={isModalOpen}
      setVisible={setIsModalOpen}
      dialogHeader={<p className="text-lg">Export Project</p>}
      dialogContent={<p>
        Exporting project data is not yet implemented.
      </p>}
      buttons={[
        <button>
          Cancel
        </button>,
      ]}
    />

    <div className="flex flex-row items-center justify-center">
      <button
        className="pe-1.5 ps-3 hover:bg-spore-500"
        onClick={onExport}
      >
        Export
        <span className="flex-1"></span>
        <IconFileExportOutline className="inline size-6" />
      </button>
    </div>
  </>);
}