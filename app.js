require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: 'https://dialog-translator.netlify.app',
  credentials: true
}));

const routes = require('./routes');
app.use(routes);
app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`);
});