import sunny from './weather-icons/png/wsymbol_0001_sunny.png';
import {FooterDiv, Us, Logo, Links, Aboutus, Copyright} from './Footer-style.js'
import Socials from './Socials';

function Footer() {
  return (
    <FooterDiv>
        <Us>
            <Logo>
                <h3>Che tempo fa</h3>
                <img src={sunny} />
            </Logo>
            <Links>
                <p>Recapiti:</p>
                <p>via Cinque Martiri, 27</p>
                <p>Como (CO) 21010</p><br/>
                <p>info@meteoesse.it</p>
            </Links>
            <Aboutus>
                <h5>About</h5>
                <p>Esse per Semplicità. Meteoesse è il portale meteo che offre previsioni greatuite per ogni località italiana, e lo fa nel modo più semplice, veloce e trasparente possibile. </p>
            </Aboutus>
        </Us>
        <Copyright>
            <a href="/terms">Termini d'uso</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/sitemap">Sitemap</a>
            <p>&copy; 2022 Meteoesse spa</p>
        </Copyright>
    </FooterDiv>
  );
}

export default Footer;