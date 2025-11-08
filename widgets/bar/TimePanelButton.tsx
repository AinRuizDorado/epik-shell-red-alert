import { App } from "astal/gtk4";
import { time } from "../../utils";
import PanelButton from "../common/PanelButton";
import { WINDOW_NAME } from "../datemenu/DateMenu";
import SpotifyPanelButton from "./SpotifyPanelButton";

export default function TimePanelButton({ format = "%H:%M" }) {
  return (
    <box spacing={12}>
      <PanelButton
        window={WINDOW_NAME}
        onClicked={() => App.toggle_window(WINDOW_NAME)}
      >
        <label label={time((t) => t.format(format)!)} />
      </PanelButton>
      <SpotifyPanelButton />
    </box>
  );
}
