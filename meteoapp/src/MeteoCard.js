import Socials from './Socials'
import sunny from './weather-icons/png/wsymbol_0001_sunny.png';
import cloudy from './weather-icons/png/wsymbol_0004_black_low_cloud.png';
import sunny_intervals from './weather-icons/png/wsymbol_0002_sunny_intervals.png';
import rainy from './weather-icons/png/wsymbol_0018_cloudy_with_heavy_rain.png';
import storm from './weather-icons/png/wsymbol_0024_thunderstorms.png';
import snowy from './weather-icons/png/wsymbol_0020_cloudy_with_heavy_snow.png';
import { weather_decode } from './MeteoMap-utils';
import { Divisor, Temperatures, CardCaption, CardTable, CityForecastCard, VisualCityForecastCard, VisualIcon, ForecastCard} from './MeteoCard-style.js'
const dayjs = require('dayjs')
const updateLocale = require('dayjs/plugin/updateLocale')

dayjs.extend(updateLocale)
require('dayjs/locale/it')

dayjs.updateLocale('it', {
    weekdaysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
    months: ["Gennaio", "Febbrario", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settempre", "Ottobre", "Novembre", "Dicembre"],
})
dayjs.locale('it')

const catchphrases = {
    "sunny": "Esci all'aria aperta e goditi il sole 😎",
    "sunny_intervals": "Hei, ma dov'è finito il sole? 🤔",
    "cloudy": "Probabile rovesci. Potrebbe piovere!",
    "rainy": "Piove, non dimenticarti l'ombrello! 🌂",
    "stormy": "Temporali in vista, è meglio rimane a casa per oggi! 💒",
    "snowy": "Nevica! Che belli i pupazzi di neve... ❄️",
}

const map = {
    "sunny": sunny,
    "sunny_intervals": sunny_intervals,
    "cloudy": cloudy,
    "rainy": rainy,
    "stormy": storm,
    "snowy": snowy,
}

function MeteoCard({ selDay, location, forecast }) {
  return (
    <ForecastCard>
        <CityForecastCard>
            <h3>{
                location.city + ', ' + location.prov
            }</h3>
            <p>{
                dayjs().add(selDay, 'day').format('ddd D MMMM')
            }</p>
            <VisualCityForecastCard>
                {forecast != null &&
                    <VisualIcon src={map[weather_decode(forecast.daily[selDay].weather[0].id)]} />}
                <p>{forecast != null && (Math.round((forecast.daily[selDay].temp.day + Number.EPSILON)*100)/100).toFixed(1) + '°'}</p>
            </VisualCityForecastCard>
            <CardCaption>{forecast != null && catchphrases[weather_decode(forecast.daily[selDay].weather[0].id)]}</CardCaption>
            <Divisor />
            <Temperatures>
                <CardTable>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td>Umidità:</td>
                            <td>{forecast != null && forecast.daily[selDay].humidity + '%'}</td>
                        </tr>
                        <tr>
                            <td>Vento:</td>
                            <td>{forecast != null && forecast.daily[selDay].wind_speed + ' km/h'}</td>
                        </tr>
                    </tbody>

                </CardTable>
            </Temperatures>
            <Socials />
        </CityForecastCard>
    </ForecastCard>
  );
}

export default MeteoCard;