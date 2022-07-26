var db = require('../../config/connection')
var collection = require('../../config/collection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userData.password)
            userData.password = await bcrypt.hash(userData.password,10)
            console.log(userData)
            //db.get().collection(collection.USER_COL).insertOne(userData).then((data)=>{
            //    resolve(data)
            //})
        })
        

    },

    doLogin:(userData)=>{
        let response={}
        return new Promise(async(resolve,reject)=>{
           // let user = await db.get().collection(collection.USER_COL).findOne({email:userData.email});
           // if(user){
           //     bcrypt.compare(userData.password,user.password).then((state)=>{
           //         if (state){
           //             console.log('login success');
           //             response.user = user;
           //             response.status = true;
           //             resolve(response);
           //         }
           //         else{
           //             console.log('login failed');
           //             resolve({status:false});
           //         }
           //     })
           // }
           // else{
           //     console.log('no user found');
           //     resolve({status:false});
           // }
        })
    }
} 