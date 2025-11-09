import { App, Astal, Gtk } from "astal/gtk4";
import PopupWindow from "../common/PopupWindow";
import { bash } from "../../utils";
import { Variable } from "astal";

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
            <box 
                hexpand={true}
                vexpand={true}
                spacing={12}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                setup={(self) => {
                    let cssProvider: Gtk.CssProvider | null = null;
                    
                    const updateBackground = () => {
                        const art = albumArt.get();
                        const styleContext = self.get_style_context();
                        
                        // Remover el proveedor CSS anterior si existe
                        if (cssProvider) {
                            styleContext.remove_provider(cssProvider);
                            cssProvider = null;
                        }
                        
                        if (art && art.trim() !== "") {
                            // Crear un nuevo proveedor CSS con la imagen actual
                            cssProvider = new Gtk.CssProvider();
                            const css = `
                                * {
                                    background-image: url('${art}');
                                    background-size: cover;
                                    background-position: center;
                                    background-repeat: no-repeat;
                                }
                            `;
                            cssProvider.load_from_data(css);
                            styleContext.add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
                        } else {
                            self.style = "background-color: rgba(30, 30, 30, 0.95);";
                        }
                    };
                    
                    albumArt.subscribe(updateBackground);
                    updateBackground();
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
            >
                <image iconName={"media-skip-backward-symbolic"} />
            </button>
            <button 
                cssClasses={["control-button"]}
                onClicked={playPause}
            >
                <image iconName={"media-playback-start-symbolic"} />
            </button>
            <button 
                cssClasses={["control-button"]}
                onClicked={next}
            >
                <image iconName={"media-skip-forward-symbolic"} />
            </button>
            </box>
        </overlay>
    );
}

export default function SpotifyControls(monitorIndex: number = 0) {
    // Obtener el ancho de la pantalla y calcular el 40% para hacerlo más ancho
    const monitor = App.get_monitors()[monitorIndex];
    const width = monitor ? Math.floor(monitor.width * 0.4) : 400;
    
    return (
        <PopupWindow
            name={WINDOW_NAME}
            layout="top"
            child={<Controls />}
            width={width}
            height={120}
        />
    );
}
