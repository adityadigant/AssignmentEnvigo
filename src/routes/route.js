const express = require('express')
const router = express.Router()
const {createUser,loginUser,updateUser,getUserProfile} = require("../controllers/userController")
const {authentication,authorisation } = require("../middleware/auth") 





// User APIs
router.post("/signup",createUser)
 router.post("/signin", loginUser)
 router.put("/user/:id",authentication ,authorisation, updateUser )
 router.get("/user/:id",authentication, getUserProfile)


// if api is invalid OR wrong URL
router.all("/*", function (req, res) {
    res
      .status(404)
      .send({ status: false, message: "The api you requested is not available" });
  });
  
module.exports =router