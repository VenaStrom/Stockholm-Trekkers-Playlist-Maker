import { useEffect } from "react";
import { usePageContext } from "../components/page-context/use-page-context";

export default function Editor() {
  const { setHeaderText } = usePageContext();

  useEffect(() => setHeaderText("Editor"), [setHeaderText]);

  return (
    <main>

    </main>
  );
}