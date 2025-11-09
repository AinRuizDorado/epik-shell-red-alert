import { App } from "astal/gtk4";
import windows from "./windows";
import request from "./request";
import initStyles from "./utils/styles";
import initHyprland from "./utils/hyprland";
import SpotifyControls from "./widgets/spotify/SpotifyControls";

initStyles();

App.start({
  requestHandler(req, res) {
    request(req, res);
  },
  main() {
    windows.map((win) => App.get_monitors().map(win));
    // Agregar la ventana de controles de Spotify a todos los monitores
    App.get_monitors().map((_, i) => App.add_window(SpotifyControls(i)));
    initHyprland();
  },
});
