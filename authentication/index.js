require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const users = [{ username: "Lazy", password: "no" }];
let refreshTokens = [];

app.get("/users", (req, res) => {
    res.json(users);
});

//Register
app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { username: req.body.username, password: hashedPassword };
        users.push(user);
        res.status(201).send();
    } catch {
        res.status(500).send();
    }
});

//LogIn
app.post("/login", async (req, res) => {
    const user = users.find((user) => user.username === req.body.username);
    if (user == null) {
        return res.status(400).send("Cannot find the user");
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            refreshTokens.push(refreshToken)
            res.json({ accessToken: accessToken, refreshToken: refreshToken }).send("success");
        } else {
            res.send("Not allowed");
        }
    } catch {
        res.status(500).send();
    }
});

//Refresh token
app.post('/token', (req, res) => {
    //store in database
    const refreshToken = req.body.token;
    if (refreshToken == null) {
        return res.sendStatus(401)
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403)
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        const accessToken = generateAccessToken({ username: user.username })
        res.json({ accessToken: accessToken })
    })
})

//Delete Refresh Token
app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
}

app.use("/", (req, res, next) => {
    return res.status(200).json({ msg: "Hello from authentication" });
});

app.listen(8001, () => {
    console.log("Authentication is listening to port 8001");
});
