import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faInstagram, faTelegram, faWhatsapp, faTwitter } from "@fortawesome/free-brands-svg-icons"
import {SocialContainer} from './Footer-style.js'

function Socials(){
    return(
        <SocialContainer>
            <a href="#">
                <FontAwesomeIcon icon={faFacebook} color='#3b5998'/>
            </a>

            <a href="#">
            <FontAwesomeIcon icon={faInstagram} color='#bd081c'/>
            </a>
                        
            <a href="#">
            <FontAwesomeIcon icon={faWhatsapp} color='#25d366'/>
            </a>

            <a href="#">
            <FontAwesomeIcon icon={faTelegram} color='#0077b5'/>
            </a>

            <a href="#">
            <FontAwesomeIcon icon={faTwitter} color='#1da1f2'/>
            </a>
        </SocialContainer>
    )
}

export default Socials;