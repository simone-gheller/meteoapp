
import styled from 'styled-components';

export const FooterDiv = styled.footer`
    margin-top: 160px;
    background-color: #230357;
    width: 100%;
   
    display: flex;
    flex-direction: column;
    color: #fff;
`;


export const Copyright = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 50px;
    margin-bottom: 30px;

    & p, a, p{
        color: rgb(129, 129, 129);
        font-size: 0.9em;
        text-decoration: none;
    }
`


export const Aboutus = styled.div`
    flex-basis: 33%;

    & p{
        color: rgb(129, 129, 129);
        font-size: 0.9em;
        text-decoration: none;
    }

    & p{
        color: #fff;
        font-weight: 400;
        font-size: 0.9em;
        text-decoration: none;
    }
`
export const Us = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 150px;
    margin: 40px;
    margin-bottom: 60px;
`
export const Logo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    & img{
        width: 140px;
    }
`

export const Links = styled.div`
    color: #fff;
    font-weight: 400;
    font-size: 0.9em;
    text-decoration: none;
`
export const SocialContainer = styled.div`
    margin-top: 20px;
    background: #fff;
    display: flex;
    flex-direction: row;
    padding:0px 15px;
    border-radius: 5px;
    gap: 10px;

    & a{
        margin: 7px 0;
        transition: 200ms;
        font-size: 32px;
    }

    & a:hover{
        transform: scale(1.3);
    }
`