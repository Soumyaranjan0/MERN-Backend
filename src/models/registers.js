const mongoose = require("mongoose")
const bcrypt= require("bcryptjs")
const jwt =require("jsonwebtoken")

const employeeSchema =new mongoose.Schema({
    firstname:{
        type:"string",
        required:"true"
    },
    lastname:{
        type:"string",
        required:"true"
    },
    email:{
        type:"string",
        required:"true",
        unique:"true"
    },
    gender:{
        type: "string",
        required:"true"
    },
    phone:{
        type:Number,
        required:"true",
        unique:"true"
    },
    age:{
        type:Number,
        required:"true"
    },
    password:{
        type:"string",
        required:"true"
    },
    confirmpassword:{
        type:"string",
        required:"true"
    },
    tokens:[{
        token:{
            type:"string",
            required:"true"
        }
    }],
})

// generating tokens 
employeeSchema.methods.generateAuthToken = async function(){
   try {
       const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
       this.tokens = this.tokens.concat({token:token})
       await this.save();
       return token;
   } catch (err) {
       res.send("the error part" + err);
   }
}

//Converting password into hash
employeeSchema.pre("save", async function(next){
if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10)
    this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10)
}
next();
})

//now we need to creat a collection
module.exports = new mongoose.model("Register",employeeSchema)