const express = require('express');
const helmet = require('helmet');
const Connect = require('./utils/db');
require("dotenv").config();

const app = express()

app.use(helmet());
app.use(express.json());

app.get('/', (req, res)=>{
    res.json({
        message: 'Server running successfully'
    })
})

app.use('/api', require('./routes/post.route'))
app.use('/api', require('./routes/user.route'))

Connect();

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running at ${port}`);
})