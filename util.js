const jwt = require('jsonwebtoken')

const getToken = (user) =>{
    const signinUser={
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
    }
    return jwt.sign(signinUser, process.env.JWT_SECRET,{
        expiresIn: '48h'
    })
}

const isAuth = (req, res, next) => {
    const token = req.headers.authorization
    
    if(token){
        const onlyToken = token.slice(6, token.length)
        jwt.verify(onlyToken, process.env.JWT_SECRET, (err, decode)=>{
            if(err){
                return res.status(401).send({msg: 'Invalid token'})
            }
            req.user = decode
            return next()
        })
    }else{
        return res.status(401).send({msg: 'Token is not supplied'})
    }  
}

const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        return next()
    }else{
        return res.status(401).send({msg: 'Not an admin'})
    }
}

module.exports = { getToken, isAuth, isAdmin }