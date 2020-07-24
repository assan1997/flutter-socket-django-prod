const mongoose = require('mongoose');

const connect = async () =>  {
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/db-chat',{
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log('connected to mongodb');
    }catch(e){
        console.log('err',e);
    }
}

module.exports = connect;