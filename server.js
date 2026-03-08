const express = require('express')
const cors = require('cors')
require('dotenv').config();

const app = express()

global.__basedir = __dirname;

var corsOptions = {
    origin: '*'
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


// database
const db = require('./app/models')
const Role = db.role
db.sequelize.sync();

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to HMS application.' })
})

require("./app/routes/upload.routes")(app)
require("./app/routes/analytics.routes")(app)


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})


