import jwt from 'jsonwebtoken';


const authUser = async (req , res , next)=>{
     
    const token = req.cookies.token || req.headers.token;
    console.log('authUser middleware, token:', token);

    if(!token){
        return res.json({success: false, message:'Not Authorized'});
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        console.log('Decoded token:', tokenDecode);
        if(tokenDecode.id){
            req.user = { _id: tokenDecode.id };
        }else{
            return res.json({success: false,message:'Not Authorized'});
        }
        next();
        
    } catch (error) {
        res.json({success:false, message: error.message});
        
    }
}

export default authUser;