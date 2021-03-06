const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UsersModel = require('./users-model')

const {authenticate} = require('../../auth/auth-middleware')

const secret = require('../../config/secrets')

router.get('/', authenticate, (req, res) => {
  UsersModel.find()
  .then(users => {
      res.json(users)
  })
  .catch(err => res.status(500).json(err))
})

router.post('/register', (req, res) => {
  let user = req.body

  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash
  
  UsersModel.add(user)
  .then(newUser => {
      const token = generateToken(newUser)
      res.status(201).json({newUser, token})
  })
  .catch(err => {
      res.status(500).json({error: err})
  })
})

router.post('/login', (req,res) => {
  let { username, password } = req.body

  UsersModel.findBy({ username })
  .first()
  .then(user => {
    if(user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user)
        const id = user.id
        res.status(200).json({
            message: `Welcome back ${user.username}!`,
            token,
            id
        })
    } else {
        res.status(401).json({ message: 'Invalid Credentials'})
    }
  })
  .catch(error => {
    res.status(500).json(error)
  })
})

function generateToken(user){
  const username = user.username

  const payload = {
    subject: user.id, //sub property in header, normally user id
    username // = username: user.username
    // additional data, do not include sensitve info, role: user.role 
  }

  const options = {
    expiresIn : '8h'
  }

  //secret comes from config/secrets

  return jwt.sign(payload, secret.jwtSecret, options)
}

router.get("/logout", (req, res) => {
  if (req.session) {
    //kills session
    req.session.destroy(error => {
      //check if possible error
      if (error) {
        res
          .status(500)
          .json({
            message:
              "error logging you out. try again."
          });
      } else {
        res.status(200).json({ message: "logged out successfully" });
      }
    });
  } else {
    res.status(200).json({ message: "come back soon" });
  }
});

module.exports = router;