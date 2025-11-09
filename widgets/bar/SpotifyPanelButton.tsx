import { Variable } from "astal";
import { App } from "astal/gtk4";
import PanelButton from "../common/PanelButton";
import { bash } from "../../utils";

const spotifyInfo = Variable({ artist: "", title: "" });
const albumArt = Variable("");

// Función para obtener la información de Spotify
async function updateSpotifyInfo() {
    try {
        // Usamos playerctl para obtener la información de Spotify
        const result = await bash`
            playerctl -p spotify metadata --format '{{artist}}|{{title}}' 2>/dev/null || echo "||"
        `;
        
        const [artist, title] = result.trim().split('|');
        if (artist && title) {
            spotifyInfo.set({ artist, title });
        } else {
            spotifyInfo.set({ artist: "", title: "" });
        }
        
        // Actualizar también la imagen del álbum
        const artUrl = await bash`
            playerctl -p spotify metadata mpris:artUrl 2>/dev/null || echo ""
        `;
        const url = artUrl.trim();
        console.log("Album art URL from panel:", url);
        albumArt.set(url);
    } catch (error) {
        spotifyInfo.set({ artist: "", title: "" });
        albumArt.set("");
    }
}

// Actualizar la información periódicamente
setInterval(() => {
    updateSpotifyInfo().catch(() => {});
}, 1000);
// Llamada inicial
updateSpotifyInfo().catch(() => {});

const WINDOW_NAME = "spotify-controls";

export default function SpotifyPanelButton() {
    return (
        <PanelButton
            window={WINDOW_NAME}
            onClicked={() => App.toggle_window(WINDOW_NAME)}
        >
            <box spacing={6} cssClasses={["spotify-widget"]}>
                <image iconName={"spotify"} pixelSize={16} />
                <label 
                    label={spotifyInfo((info) => 
                        info.artist && info.title ? `${info.artist} - ${info.title}` : ""
                    )} 
                />
            </box>
        </PanelButton>
    );
}
