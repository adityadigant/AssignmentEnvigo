const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { uploadFile } = require("../AWS/aws");
const jwt = require("jsonwebtoken");

//Validator file is created for the validations
const {
  isValidRequestBody,
  isValid,
  isValidObjectId,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidMobile,
} = require("../validators/validator");

//Create Api function to create and store the data of user
const createUser = async function (req, res) {
  try {
    let requestBody = req.body;

    //Check if data is present in request body or not
    if (!isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "data should not be empty" });
    }

    //Destructuring Data
    let { fname, lname, email, password, phone } = requestBody;

    //Validating mandatory field of first name
    if (!isValid(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "First name is mandatory" });
    }
    //check if first name is in alphabets or not
    if (!isValidName(fname)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "First name should contain alphabets Only",
        });
    }
    //Validating mandatory field of last name
    if (!isValid(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Last name is mandatory" });
    }
    //check if Last name is in alphabets or not
    if (!isValidName) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Last name should contain alphabet Only",
        });
    }

    //Validating mandatory field of email
    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is mandatory" });
    }

    //check email is valid or not
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is not valid" });
    }
    //Check if Email is already exist or not
    let checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      return res
        .status(400)
        .send({ status: false, message: "Email is already exist " });
    }

    //Validating mandatory field of password
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is mandatory" });
    }
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "password should contain at least a number and a special character and Should be of length from 8 to 14",
        });
    }

    //password encryption for security
    const encryptPassword = await bcrypt.hash(password, 10);
    requestBody.password = encryptPassword;

    //Mobile number Validation
    if (!isValid(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Phone no. is Mandatory" });
    }
    if (!isValidMobile(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Phone no. is not valid" });
    }
    let checkPhoneNum = await userModel.findOne({ phone });
    if (checkPhoneNum) {
      return res
        .status(400)
        .send({ status: false, message: "Phone number is already Present" });
    }

    //files from data
    let files = req.files;
    
    //uploading the profile picture in aws s3 bucket and set the url of image in profileImage field
    if (files && files.length > 0) {
     
      let uploadedFileURL = await uploadFile(files[0]);

      requestBody.profileImage = uploadedFileURL;
    }

    //creating and storing the data in Database
    let createUserData = await userModel.create(requestBody);

    return res.status(201).send({ status: true, data: createUserData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

//***********************SignIn API Function **********************/

const loginUser = async function (req, res) {
  try {
    let data = req.body;

    //Check if data is present in request body or not
    if (!isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "data should not be empty" });
    }

    let { email, password } = data;

    //Validating mandatory field of email
    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter Your Email Id" });
    }

    //check email is valid or not
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is not valid" });
    }

    //Validating mandatory field of password
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is mandatory" });
    }

    //Finding user document with email
    const checkData = await userModel.findOne({ email });

    //if email not found
    if (!checkData) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    //comparing bcrypt password with the password provided by the user
    const validPassword = await bcrypt.compare(password, checkData.password);

    //if password is not valid
    if (!validPassword) {
      return res
        .status(400)
        .send({ status: false, message: "Password is Invalid " });
    }

    let loginCredentials = checkData._id;

    // Generating json web token
    let token = jwt.sign(
      {
        email: checkData.email.toString(),
        userId: loginCredentials,
      },
      "xpyna91skajsusldsje8js",
      {
        expiresIn: "1h",
      }
    );

    //returning the token as a cookie on successful login.
    return res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .send({ message: "Logged in successfully" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



//------------------------------------------------------------------------------------------------------------------------------------------------------

//***************************Update user API function **********************/

const updateUser = async function (req, res) {
  try {
    let id = req.params.id;

    //checking if the objectId is valid or not
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .send({ status: false, message: `Id ${id} is not valid` });
    }

    let data = req.body;
    if (!isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Data is for updation is empty" });
    }

    let { fname, lname, email, phone } = data;

    if (fname) {
      if (!isValidName(fname)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "First name should be in alphabets only",
          });
      }
    }
    if (lname) {
      if (!isValidName(lname)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Last name should be in alphabets only",
          });
      }
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Email is not valid" });
      }
    }
    //Check if Email is already exist or not
    let checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      return res
        .status(400)
        .send({ status: false, message: "Email is already exist " });
    }
    if (phone) {
      if (!isValidMobile(phone)) {
        return res.send({ status: false, message: "Phone no. is not valid" });
      }
    }
    let checkPhoneNum = await userModel.findOne({ phone });
    if (checkPhoneNum) {
      return res
        .status(400)
        .send({ status: false, message: "Phone number is already Present" });
    }

    //checking if file is coming
    let files = req.files;
    if (files && files.length > 0) {
      //uploading file
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;
    }

    const updateData = await userModel.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!updateData) {
      return res
        .status(404)
        .send({
          status: false,
          message: `Document with Id : ${id} is not found`,
        });
    }
    return res.status(200).send({ status: true, data: updateData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



//------------------------------------------------------------------------------------------------------------------------------------------------------

//**********************Get API function to get all the details of user */
const getUserProfile = async function (req, res) {
  try {
    let id = req.params.id;
    //checking if the objectId is valid or not
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .send({ status: false, message: `Id ${id} is not valid` });
    }

    //Finding data in db collection
    let getData = await userModel.findOne({ id });

    //If data no found
    if (!getData) {
      return res
        .status(404)
        .send({
          status: false,
          message: `Document Associated with id ${id} not found`,
        });
    }
    return res.status(200).send({ status: false, data: getData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};



//------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { createUser, loginUser, updateUser, getUserProfile};
