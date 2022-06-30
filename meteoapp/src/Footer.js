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
                <a href="#">Termini d'uso</a><br />
                <a href="#">Contattaci</a><br />
                <a href="#">Condividi sui social</a><br />
                <Socials />
            </Links>
            <Aboutus>
                <h5>About us</h5>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Est consectetur sint, iure adipisci harum earum rerum. Corporis fuga exercitationem in quisquam eveniet et beatae numquam hic. Voluptatem magni laborum ipsum?</p>
            </Aboutus>
        </Us>
        <Copyright> 
            <a href="#">Privacy Policy</a>
            <a href="/sitemap">Sitemap</a>
            <p>&copy; 2022 Meteosg spa</p>
        </Copyright>
    </FooterDiv>
  );
}

export default Footer;