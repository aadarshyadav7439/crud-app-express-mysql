const mysql = require("mysql2");
const {faker}=require("@faker-js/faker");
const express= require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const path = require("path");
const methodOverride= require("method-override");
const { error } = require("console");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password:'Indi@123'
});

let getRandomUser =()=>{
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password()
  ];
};

app.listen("8080",()=>{
    console.log("server is listening");
});
//homepage
app.get("/",(req,res)=>{
    let q = 'SELECT count(*) FROM user';
    try {
        connection.query(q,(error,result)=>{
            if(error) throw error;
            let count=(result[0]["count(*)"]);
            res.render("home.ejs",{count});
        });
    } catch (error) {
        console.log(error);
        res.send("some error occurred while fetching information")
    }
});

//show the user info
app.get("/user",(req,res)=>{
    let q= 'SELECT * FROM user';

try {
        connection.query(q,(error,users)=>{
            if(error) throw error;
            res.render("showusers.ejs",{users});
        });
    } catch (error) {
        console.log(error);
        res.send("some error occurred while fetching  user information")
    }
});
//edit route for username

app.get("/user/:id/edit",(req,res)=>{
    let id=req.params.id;
    // console.log(id);
    let q=`SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q,(error,result)=>{
            if(error) throw error;
            let user=result[0];
            res.render("edit.ejs",{user});
        });
    } catch (error) {
        console.log(error);
        res.send("some error occurred while fetching  user information");
    }
});

//updating the username

app.patch("/user/:id",(req,res)=>{
    let id=req.params.id;
    let {password:formPassword, username:newUsername}=req.body;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q,(error,result)=>{
            if(error) throw error;
            let user=result[0];
            if(formPassword!=user.password){
                res.send("WRONG PASSWORD");
            }else{
                let q2=`UPDATE user SET username="${newUsername}" WHERE id = "${id}"`;
                connection.query(q2,(error,result)=>{
                    if(error) throw error;
                    res.redirect("/user");
                });
            };
            
        });
    } catch (error) {
        console.log(error);
        res.send("some error occurred while fetching  user information");
    }
});
//adding new user
app.get("/user/new", (req,res)=>{
    res.render("new.ejs");
});

app.post("/user", (req, res) => {
    let id = uuidv4();
    let { username, email, password } = req.body;
    let q = `
        INSERT INTO user(id, username, email, password)
        VALUES (?, ?, ?, ?)
    `;
    let values = [id, username, email, password];
    connection.query(q, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Something went wrong");
        }
        res.redirect("/user");
    });
});
//geting request to delete user

app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = "SELECT * FROM user WHERE id = ?";
    connection.query(q, [id], (err, result) => {
        if (err) return res.send("Error");
        res.render("delete.ejs", { user: result[0] });
    });
});
//deleting user from database

app.delete("/user/:id",(req,res)=>{
    let id = req.params.id;
    let{email,password}=req.body;

    let q=`SELECT * FROM user WHERE id = "${id}"`;
    connection.query(q,(error,result)=>{
        if(error) throw error;
        let user = result[0];

        if(user.email==email && user.password==password){
            let q2=`DELETE FROM user WHERE id="${id}"`;
            connection.query(q2,(err)=>{
                if(err) {
                    console.log(err);
                    return res.send("Deleting failed, Please try again");
                };
                res.redirect("/user");
            }); 
        }else{
            res.send("Incorrect email-id or password, Please try again ");
        }
    });
});
// try{
//     connection.query(q,[data],(err,result)=>{
//     if(err) throw err;
//     console.log(result);
//     })
// }catch(err){
//     console.log(err);
// }
// connection.end();


