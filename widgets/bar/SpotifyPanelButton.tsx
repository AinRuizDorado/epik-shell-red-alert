import { Variable } from "astal";
import PanelButton from "../common/PanelButton";
import { bash } from "../../utils";

const spotifyInfo = Variable({ artist: "", title: "" });

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
    } catch (error) {
        spotifyInfo.set({ artist: "", title: "" });
    }
}

// Actualizar la información periódicamente
setInterval(updateSpotifyInfo, 1000);
// También actualizar cuando cambie el estado de reproducción
bash`
    playerctl -p spotify -F status 2>/dev/null | while read; do
        echo "update"
    done
`.then(() => {
    // Esto mantendrá la información actualizada cuando cambie el estado
});

export default function SpotifyPanelButton() {
    return (
        <PanelButton>
            <box spacing={6}>
                <label 
                    label={spotifyInfo((info) => 
                        info.artist && info.title ? `${info.artist} - ${info.title}` : ""
                    )} 
                />
            </box>
        </PanelButton>
    );
}
