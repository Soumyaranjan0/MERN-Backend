const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/youtubeRegistration", {
    //for deprication waring is not comming
    // useNewUrlPaser:true,
    // uaeUnifiedTopology:true,
    // useCreatIndex:true
}).then(() => {
    console.log(`connection succesful`);
}).catch((e) =>{
    console.log(`not connected`)
})