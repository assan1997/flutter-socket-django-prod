const mongoose = require('mongoose');

const EntSchema = new mongoose.Schema({
    id:{type:Number},
    name:{
        type:String,
    },
    email:{
        type:String
    },
    password:{
        type:String,
    },
    users:[{type:mongoose.Schema.Types.ObjectId,ref:"users"}],
    groupes:[]
})

module.exports = mongoose.model('entreprise',EntSchema);