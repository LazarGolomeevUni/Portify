const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/authentication', proxy('http://localhost:8001'));
app.use('/posts', proxy('http://localhost:8002'));//posts
app.use('/projects', proxy('http://localhost:8003'));

app.use('/', (req,res,next)=>{
    return res.status(200).json({"msg":"Hello from API"})
});

app.listen(8000, ()=> {
    console.log('API gateway is listening to port 8000')
});