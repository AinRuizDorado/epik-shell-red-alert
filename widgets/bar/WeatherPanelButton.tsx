import PanelButton from "../common/PanelButton";
import { bind, Variable } from "astal";
import { execAsync } from "../../utils";

export default function WeatherPanelButton() {
    const weatherText = Variable("Cargando...");
    const weatherClass = Variable([""]);
    
    // Función para actualizar el clima usando curl
    const updateWeather = async () => {
        try {
            const API_KEY = "YOUR API KEY";
            const LAT = "-37.3217";
            const LON = "-59.1332";
            const LANG = "es";
            const UNITS = "metric";
            
            const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly&appid=${API_KEY}&units=${UNITS}&lang=${LANG}`;
            
            // Usar curl para obtener los datos
            const result = await execAsync(["curl", "-s", url]);
            const data = JSON.parse(result);
            
            // Verificar si hay error
            if (data.cod) {
                throw new Error(data.message || "Error en la API");
            }
            
            // Extraer datos
            const current = data.current;
            const daily = data.daily[0];
            
            const tempMin = Math.round(daily.temp.min);
            const tempMax = Math.round(daily.temp.max);
            const humidity = current.humidity;
            const description = current.weather[0].description;
            
            // Capitalizar descripción
            const capitalizedDesc = description.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            // Determinar iconos extremos
            let extremeIcon = "";
            if (tempMax >= 32) {
                extremeIcon = " 🔥";
            } else if (tempMin < 0) {
                extremeIcon = " ❄️";
            }
            
            // Colores
            const minColor = "#89DCEB";
            let maxColor = "#74C7EC";
            if (tempMax >= 20) {
                maxColor = "#F38BA8";
            }
            
            // Crear texto con markup
            const text = `${capitalizedDesc}${extremeIcon} | <span color="${minColor}">${tempMin}°</span>/<span color="${maxColor}">${tempMax}°</span> | H:${humidity}%`;
            
            weatherText.set(text);
            weatherClass.set(["weather-details"]);
            
        } catch (error) {
            console.error("Error fetching weather:", error);
            weatherText.set(" Error");
            weatherClass.set(["error"]);
        }
    };

    // Actualizar cada 10 minutos
    setInterval(updateWeather, 600000);
    
    // Actualizar inmediatamente
    updateWeather();

    return (
        <PanelButton
            setup={(self) => {
                // Actualizar al hacer clic en el botón
                self.connect("clicked", () => {
                    updateWeather();
                });
            }}
        >
            <label 
                useMarkup={true}
                label={weatherText()}
                cssClasses={weatherClass()}
            />
        </PanelButton>
    );
}
