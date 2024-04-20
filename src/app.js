require('dotenv').config()
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
require("./db/conn");
const Register = require("./models/registers")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cookieparser = require("cookie-parser");
const auth = require("./middleware/auth")


const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use((cookieparser()))
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/secret", auth, (req, res) => {
    res.render("secret");
});

app.get("/logout", auth, async (req, res) => {
    try {
        //From single Logout
        // req.user.tokens = req.user.tokens.filter((currentelement)=>{
        //     return currentelement.token!==req.token
        // })  

        //logout from all the devices
        req.user.tokens=[];

        res.clearCookie("jwt");
        await req.user.save();
        res.render("login")

    } catch (err) {
        res.status(500).send(err)
    }
});


app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/login", (req, res) => {
    res.render("login");
});

//creat a new user in or database
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            })

            const token = await registerEmployee.generateAuthToken();

            //The res.cookie() function is used to set the cokiee name to value.
            //The value parameter may be in a string or object converted  to JSON.
            //syntax: res.cookie(name, value,[option])

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            });

            const registered = await registerEmployee.save();
            res.status(201).render("index");

        } else {
            res.send("password are not matching")
        }

    } catch (error) {
        res.status(400).send(error);
    }
})

//Login validation
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email })

        const isMatch = await bcrypt.compare(password, useremail.password)

        const token = await useremail.generateAuthToken();
        console.log(token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true,
            // secure:true
        });


        if (isMatch) {
            res.status(201).render("index")
        }
        else {
            res.send("Invalid login Details")
        }
    } catch (error) {
        res.status(400).send("Invalid login Details")
    }
})


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})