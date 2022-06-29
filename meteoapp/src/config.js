const dev = {
    urls: {
        CITY: "http://127.0.0.1:3001/api/city/",
        REGION: "http://127.0.0.1:3001/api/regions/",
        ITALY: "http://127.0.0.1:3001/api/italy/"
    }
};
  
const prod = {
    urls: {
        CITY: "/api/city/",
        REGION: "/api/regions/",
        ITALY: "/api/italy/"
    }
};
  
const config = process.env.REACT_APP_STAGE == "production" ? prod : dev;

export default {
...config,
};