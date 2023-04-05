require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json())

const posts = [
    {
        username: 'Lazy',
        title: 'post 1'
    },
    {
        username: 'Krisi',
        title: 'post 2'
    }
]

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.username))
})

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

app.use('/', (req,res,next)=>{
    return res.status(200).json({"msg":"Hello from Posts"})
})

app.listen(8002, ()=> {
    console.log('Posts is listening to port 8002')
})