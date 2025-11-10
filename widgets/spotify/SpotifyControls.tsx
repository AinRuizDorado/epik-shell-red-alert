import { App, Astal, Gtk } from "astal/gtk4";
import PopupWindow from "../common/PopupWindow";
import { bash } from "../../utils";
import { Variable } from "astal";
import Picture from "../common/Picture";

const WINDOW_NAME = "spotify-controls";

// Variable para almacenar la URL de la imagen del álbum
const albumArt = Variable("");

// Función para obtener la imagen del álbum actual
async function updateAlbumArt() {
    try {
        const artUrl = await bash`
            playerctl -p spotify metadata mpris:artUrl 2>/dev/null || echo ""
        `;
        const url = artUrl.trim();
        console.log("Album art URL:", url);
        albumArt.set(url);
    } catch (error) {
        console.error("Error getting album art:", error);
        albumArt.set("");
    }
}

// Actualizar la imagen del álbum periódicamente
setInterval(updateAlbumArt, 1000);
updateAlbumArt(); // Llamada inicial

function Controls() {
    const playPause = async () => {
        await bash`playerctl -p spotify play-pause`;
    };

    const next = async () => {
        await bash`playerctl -p spotify next`;
    };

    const previous = async () => {
        await bash`playerctl -p spotify previous`;
    };

    return (
        <overlay cssClasses={["spotify-controls"]}>
            {/* Usar Picture para mostrar la imagen del álbum */}
            <Picture
                hexpand={true}
                vexpand={true}
                cssClasses={["album-art-background"]}
                setup={(self) => {
                    // Actualizar la imagen cuando cambie la URL
                    albumArt.subscribe((url) => {
                        if (url && url.trim() !== "") {
                            self.set_filename(url);
                        } else {
                            // Si no hay imagen, limpiar
                            self.set_filename(null);
                        }
                    });
                }}
            />
            <box 
                spacing={12}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                cssClasses={["controls-overlay"]}
            >
                <button 
                    cssClasses={["control-button"]}
                    onClicked={previous}
                    widthRequest={30}
                    heightRequest={30}
                >
                    <image iconName={"media-skip-backward-symbolic"} pixelSize={16} />
                </button>
                <button 
                    cssClasses={["control-button"]}
                    onClicked={playPause}
                    widthRequest={30}
                    heightRequest={30}
                >
                    <image iconName={"media-playback-start-symbolic"} pixelSize={16} />
                </button>
                <button 
                    cssClasses={["control-button"]}
                    onClicked={next}
                    widthRequest={30}
                    heightRequest={30}
                >
                    <image iconName={"media-skip-forward-symbolic"} pixelSize={16} />
                </button>
            </box>
        </overlay>
    );
}

export default function SpotifyControls(monitorIndex: number = 0) {
    return (
        <PopupWindow
            name={WINDOW_NAME}
            layout="top"
            child={<Controls />}
            width={800}
            height={800}
            setup={(self) => {
                // Asegurarnos de que la ventana tenga las propiedades necesarias para mostrar el fondo
                self.set_default_size(800, 800);
            }}
        />
    );
}
