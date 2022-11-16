const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const Connect = require('./utils/db');
require("dotenv").config({path: './.env'});

const app = express()

app.use(helmet());
app.use(express.json());

if(process.env.NODE_ENV !== 'test'){
    app.use(morgan('dev'));
    Connect(process.env.MONGO_DEV_URI);
}

app.get('/', (req, res)=>{
    res.json({
        message: 'Server running successfully'
    })
})

app.use('/api', require('./routes/post.route'))
app.use('/api', require('./routes/user.route'))

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`Server running at ${port}`);
})

module.exports = server